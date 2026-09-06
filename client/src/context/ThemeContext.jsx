import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
  EYECARE: 'eyecare'
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('campuscircuit_theme');
    if (saved && Object.values(THEMES).includes(saved)) {
      return saved;
    }
    return THEMES.DARK; // Default flagship theme
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('campuscircuit_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === THEMES.DARK) return THEMES.LIGHT;
      if (prev === THEMES.LIGHT) return THEMES.EYECARE;
      return THEMES.DARK;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
