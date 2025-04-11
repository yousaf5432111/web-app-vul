import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const themes = {
    blue: {
      primary: '#3b82f6',
      primaryDark: '#2563eb',
      secondary: '#6366f1',
      text: '#1e293b',
      background: '#ffffff',
      card: '#f8fafc',
    },
    green: {
      primary: '#10b981',
      primaryDark: '#059669',
      secondary: '#06b6d4',
      text: '#1e293b',
      background: '#ffffff',
      card: '#f8fafc',
    },
    red: {
      primary: '#ef4444',
      primaryDark: '#dc2626',
      secondary: '#f97316',
      text: '#1e293b',
      background: '#ffffff',
      card: '#f8fafc',
    },
    purple: {
      primary: '#8b5cf6',
      primaryDark: '#7c3aed',
      secondary: '#a855f7',
      text: '#1e293b',
      background: '#ffffff',
      card: '#f8fafc',
    },
    orange: {
      primary: '#f97316',
      primaryDark: '#ea580c',
      secondary: '#f59e0b',
      text: '#1e293b',
      background: '#ffffff',
      card: '#f8fafc',
    }
  };

  const [currentTheme, setCurrentTheme] = useState('blue');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'blue';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeKey) => {
    const theme = themes[themeKey];
    const root = document.documentElement;
    
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-dark', theme.primaryDark);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--card', theme.card);
  };

  const changeTheme = (themeKey) => {
    setCurrentTheme(themeKey);
    localStorage.setItem('theme', themeKey);
    applyTheme(themeKey);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
