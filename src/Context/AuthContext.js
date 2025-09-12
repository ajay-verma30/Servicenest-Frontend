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

  const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
    timeout: 10000, 
  });


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

      const refreshTime = Math.max(timeUntilExpiry - 2 * 60 * 1000, 30 * 1000);

      console.log(`Token expires in ${timeUntilExpiry/1000}s, refreshing in ${refreshTime/1000}s`);

      if (refreshTime > 0) {
        refreshTimeoutRef.current = setTimeout(() => {
          console.log("Scheduled refresh triggered");
          refreshToken();
        }, refreshTime);
      } else {
        console.log("Token expired/expiring soon, refreshing immediately");
        refreshToken();
      }
    } catch (err) {
      console.error("Error scheduling refresh:", err);
      logout();
    }
  };


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
        console.log("401 response received, attempting token refresh");
        
        if (isRefreshingRef.current) {
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
          console.error("Refresh failed in interceptor:", err);
          processQueue(err, null);
          logout();
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );


  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decoded = jwtDecode(token);
          const isExpired = decoded.exp * 1000 < Date.now();
          const isNearExpiry = decoded.exp * 1000 < Date.now() + 60 * 1000;
          
          console.log("Token initialization:", {
            isExpired,
            isNearExpiry,
            expiresAt: new Date(decoded.exp * 1000),
            now: new Date()
          });

          if (isExpired || isNearExpiry) {
            console.log("Token expired/near expiry, attempting refresh");
            const newToken = await refreshToken();
            if (!newToken) {
              console.log("Refresh failed during initialization, logging out");
              logout();
              return;
            }
          } else {
            console.log("Token is valid, setting user state");
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
      } else {
        console.log("No token found in localStorage");
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    return () => clearRefreshTimeout();
  }, []);


  const refreshToken = async () => {
    if (isRefreshingRef.current) {
      console.log("Refresh already in progress, skipping");
      return null;
    }
    
    isRefreshingRef.current = true;
    console.log("Starting token refresh");

    try {
      const res = await axios.post(
        "http://localhost:3000/user/refresh-token",
        {},
        { 
          withCredentials: true,
          timeout: 10000
        }
      );

      console.log("Refresh response:", res.data);

      if (res.data.success && res.data.accessToken) {
        const newToken = res.data.accessToken;
        localStorage.setItem("token", newToken);
        setAccessToken(newToken);

        const decoded = jwtDecode(newToken);
        const userData = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          orgId: decoded.userOrg,
        };
        
        setUser(userData);
        scheduleTokenRefresh(newToken);
        console.log("Token refresh successful");
        return newToken;
      } else {
        throw new Error("Invalid refresh response structure");
      }
    } catch (err) {
      console.error("Refresh failed:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 401 || err.message.includes('timeout')) {
        logout();
      }
      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  };

  const login = async (email, password) => {
    try {
      console.log("Attempting login");
      const res = await api.post("/user/login", { email, password });

      console.log("Login response:", res.data);

      if (res.data.success && res.data.token) {
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

        console.log("Login successful, navigating to dashboard");
        navigate(`/${decoded.userOrg}/dashboard`);
        return { success: true, user: userData };
      } else {
        throw new Error("No token received from login or login failed");
      }
    } catch (err) {
      console.error("Login failed:", {
        message: err.message,
        response: err.response?.data
      });
      return {
        success: false,
        message:
          err.response?.data?.message || err.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    console.log("Starting logout process");
    
    try {
      await axios.post(
        "http://localhost:3000/user/logout", 
        {}, 
        { 
          withCredentials: true,
          timeout: 5000
        }
      );
      console.log("Logout request successful");
    } catch (err) {
      console.log("Logout request failed:", err.message);
    }

    clearRefreshTimeout();
    isRefreshingRef.current = false;
    failedQueueRef.current = [];
    localStorage.removeItem("token");
    setAccessToken(null);
    setUser(null);
    console.log("Local state cleared, navigating to login");
    navigate("/login");
  };

  const isTokenValid = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const isValid = decoded.exp * 1000 > Date.now();
      console.log("Token validity check:", {
        isValid,
        expiresAt: new Date(decoded.exp * 1000),
        now: new Date()
      });
      return isValid;
    } catch (err) {
      console.error("Error checking token validity:", err);
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
