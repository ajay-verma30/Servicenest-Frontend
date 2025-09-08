import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const refreshTimeoutRef = useRef(null);
  const isRefreshingRef = useRef(false);
  const failedQueueRef = useRef([]);

  // Base axios instance
  const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true, // ensures refreshToken cookie is sent
  });

  /** -----------------
   * Utility Functions
   ------------------*/

  const clearRefreshTimeout = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const processQueue = (error, token = null) => {
    failedQueueRef.current.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    failedQueueRef.current = [];
  };

  const scheduleTokenRefresh = (token) => {
    clearRefreshTimeout();
    try {
      const decoded = jwtDecode(token);
      const expiryTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Refresh 2 minutes before expiry (but at least 30s from now)
      const refreshTime = Math.max(timeUntilExpiry - 2 * 60 * 1000, 30 * 1000);

      if (refreshTime > 0) {
        refreshTimeoutRef.current = setTimeout(() => {
          refreshToken();
        }, refreshTime);
      } else {
        // Token already expired or expiring very soon
        refreshToken();
      }
    } catch (err) {
      console.error("Error scheduling refresh:", err);
      logout();
    }
  };

  /** -----------------
   * Axios Interceptors
   ------------------*/

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshingRef.current) {
          // Queue requests until refresh completes
          return new Promise((resolve, reject) => {
            failedQueueRef.current.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;

        try {
          const newToken = await refreshToken();
          if (newToken) {
            processQueue(null, newToken);
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (err) {
          processQueue(err, null);
          logout();
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );

  /** -----------------
   * Auth Initialization
   ------------------*/

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now() + 60 * 1000) {
            // Token expired or near expiry → try refresh
            const newToken = await refreshToken();
            if (!newToken) {
              logout();
              return;
            }
          } else {
            // Token is valid
            setUser({
              id: decoded.userId,
              email: decoded.email,
              role: decoded.role,
              orgId: decoded.userOrg,
            });
            setAccessToken(token);
            scheduleTokenRefresh(token);
          }
        } catch (err) {
          console.error("Invalid token on load:", err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    return () => clearRefreshTimeout();
  }, []);

  /** -----------------
   * Core Auth Functions
   ------------------*/

  const refreshToken = async () => {
    if (isRefreshingRef.current) return null;
    isRefreshingRef.current = true;

    try {
      const res = await axios.post(
        "http://localhost:3000/user/refresh-token",
        {},
        { withCredentials: true }
      );

      if (res.data.success && res.data.accessToken) {
        const newToken = res.data.accessToken;
        localStorage.setItem("token", newToken);
        setAccessToken(newToken);

        const decoded = jwtDecode(newToken);
        setUser({
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          orgId: decoded.userOrg,
        });

        scheduleTokenRefresh(newToken);
        return newToken;
      } else {
        throw new Error("Invalid refresh response");
      }
    } catch (err) {
      console.error("Refresh failed:", err.response?.data || err.message);
      logout(); // ensure user session is cleared
      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post("/user/login", { email, password });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setAccessToken(res.data.token);

        const decoded = jwtDecode(res.data.token);
        const userData = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          orgId: decoded.userOrg,
        };

        setUser(userData);
        scheduleTokenRefresh(res.data.token);

        navigate(`/${decoded.userOrg}/dashboard`);
        return { success: true, user: userData };
      } else {
        throw new Error("No token received from login");
      }
    } catch (err) {
      console.error("Login failed:", err);
      return {
        success: false,
        message:
          err.response?.data?.message || err.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:3000/user/logout", {}, { withCredentials: true });
    } catch (err) {
      console.log("Logout request failed:", err.message);
    }

    clearRefreshTimeout();
    isRefreshingRef.current = false;
    failedQueueRef.current = [];
    localStorage.removeItem("token");
    setAccessToken(null);
    setUser(null);
    navigate("/login");
  };

  const isTokenValid = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        loading,
        api,
        refreshToken,
        isTokenValid,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
