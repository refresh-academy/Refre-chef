import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Create the UserContext
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// UserProvider component
export const UserProvider = ({ children, cookieConsent }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Make setUser available globally for logout in Layout
  useEffect(() => { 
    window.setUser = setUser; 
  }, [setUser]);

  // Persist user session after refresh ONLY if cookies are accepted
  useEffect(() => {
    if (cookieConsent) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded && decoded.userId && decoded.nickname) {
            setUser({ userId: decoded.userId, nickname: decoded.nickname });
          }
        } catch {
          // Ignore invalid token
        }
      }
    } else if (cookieConsent === false) {
      // Remove all session data if cookies are refused
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setUser(null);
    }
    setLoading(false);
  }, [cookieConsent]);

  // Login function
  const login = (userData) => {
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return user !== null;
  };

  // Get user ID
  const getUserId = () => {
    return user?.userId || null;
  };

  // Get user nickname
  const getNickname = () => {
    return user?.nickname || null;
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    isAuthenticated,
    getUserId,
    getNickname,
    loading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;