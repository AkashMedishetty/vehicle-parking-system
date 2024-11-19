import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      const loginTime = localStorage.getItem('loginTime');
      
      if (storedUser && loginTime) {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - parseInt(loginTime);
        const threeHours = 3 * 60 * 60 * 1000;
        
        if (timeDiff > threeHours) {
          logout();
        } else {
          setUser(JSON.parse(storedUser));
          setTimeout(logout, threeHours - timeDiff);
        }
      }
      setLoading(false);
    }, []);
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('loginTime', new Date().getTime().toString());
        setTimeout(logout, 3 * 60 * 60 * 1000);
      };
    
      const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
      };
    
      return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
          {children}
        </AuthContext.Provider>
      );
    

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
