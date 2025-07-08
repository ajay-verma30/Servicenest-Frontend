import { createContext, useState, useEffect } from "react";
import {jwtDecode} from 'jwt-decode'

export const AuthContext = createContext()

const AuthProvider = ({children}) =>{
    const [auth, setAuth] = useState({token: null, user: null,isAuthenticated: false});
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
        const storedToken = localStorage.getItem('token')
        if(storedToken){
            try{
                const decoded = jwtDecode(storedToken)
                const isExpired = decoded.exp * 1000 < Date.now();
                if(isExpired){
                    localStorage.removeItem('token');
                    setAuth({token: null, user: null,isAuthenticated: false})
                }else{
                    setAuth({
                        token:storedToken,
                        user:{email: decoded.email, id:decoded.id},
                        isAuthenticated: true
                    })
                    }
            }
            catch(e){
                console.log("Invalid Token");
                localStorage.removeItem('token')
            }
        }
        setLoading(false);
    },[])

    const login = (token)=>{
        localStorage.setItem('token', token)
        const decoded = jwtDecode(token)
        setAuth({
            token,
            user:{email:decoded.email, id:decoded.id},
            isAuthenticated: true
        });

    };

    const logout = ()=>{
        localStorage.removeItem('token');
        setAuth({ token: null, user: null, isAuthenticated: false });
    }

     return (
    <AuthContext.Provider value={{ auth, login, logout,loading  }}>
      {children}
    </AuthContext.Provider>
  );
}


export default AuthProvider;