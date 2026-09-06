import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campuscircuit_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('campuscircuit_token') || null;
  });

  const login = (userData, userToken) => {
    setUser(userData);
    localStorage.setItem('campuscircuit_user', JSON.stringify(userData));
    if (userToken) {
      setToken(userToken);
      localStorage.setItem('campuscircuit_token', userToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campuscircuit_user');
    localStorage.removeItem('campuscircuit_token');
  };

  const updateToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('campuscircuit_token', newToken);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'master_admin';
  const isMasterAdmin = user?.role === 'master_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateToken,
        isAuthenticated: !!user,
        isAdmin,
        isMasterAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
