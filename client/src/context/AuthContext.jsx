import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const sanitizeUser = (userData) => {
  if (!userData || typeof userData !== 'object') return userData;
  return {
    ...userData,
    name: userData.name ? userData.name.replace(/CampusCircuit/gi, 'upVolt') : userData.name,
    college: userData.college ? userData.college.replace(/CampusCircuit/gi, 'upVolt') : userData.college,
    email: userData.email ? userData.email.replace(/@campuscircuit\.com/gi, '@upvolt.com') : userData.email
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('upvolt_user') || localStorage.getItem('campuscircuit_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return sanitizeUser(parsed);
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('upvolt_token') || localStorage.getItem('campuscircuit_token') || null;
  });

  const login = (userData, userToken) => {
    const cleanUser = sanitizeUser(userData);
    setUser(cleanUser);
    localStorage.setItem('upvolt_user', JSON.stringify(cleanUser));
    localStorage.setItem('campuscircuit_user', JSON.stringify(cleanUser));
    if (userToken) {
      setToken(userToken);
      localStorage.setItem('upvolt_token', userToken);
      localStorage.setItem('campuscircuit_token', userToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('upvolt_user');
    localStorage.removeItem('campuscircuit_user');
    localStorage.removeItem('upvolt_token');
    localStorage.removeItem('campuscircuit_token');
  };

  const updateToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('upvolt_token', newToken);
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
