import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Theme Context
const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  // Load saved settings from localStorage
  const loadSavedSettings = () => {
    try {
      const saved = localStorage.getItem('themeSettings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    }
    return {
      fontSize: 'medium',
      primaryColor: 'brand-green',
      darkMode: false,
    };
  };

  const [settings, setSettings] = useState(loadSavedSettings());

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('themeSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
  }, [settings]);

  // Apply font size to the document
  useEffect(() => {
    const root = document.documentElement;
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.fontSize = fontSizes[settings.fontSize] || '16px';
  }, [settings.fontSize]);

  // Apply primary color to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const colorMap = {
      'brand-green': {
        default: '#16a34a',
        hover: '#15803d',
        light: '#22c55e',
        dark: '#15803d',
        '50': '#f0fdf4',
        '100': '#dcfce7',
        '200': '#bbf7d0',
        '300': '#86efac',
        '400': '#4ade80',
        '500': '#22c55e',
        '600': '#16a34a',
        '700': '#15803d',
        '800': '#166534',
        '900': '#14532d',
      },
      'blue-500': {
        default: '#3b82f6',
        hover: '#2563eb',
        light: '#60a5fa',
        dark: '#2563eb',
        '50': '#eff6ff',
        '100': '#dbeafe',
        '200': '#bfdbfe',
        '300': '#93c5fd',
        '400': '#60a5fa',
        '500': '#3b82f6',
        '600': '#2563eb',
        '700': '#1d4ed8',
        '800': '#1e40af',
        '900': '#1e3a8a',
      },
      'purple-500': {
        default: '#8b5cf6',
        hover: '#7c3aed',
        light: '#a78bfa',
        dark: '#7c3aed',
        '50': '#f5f3ff',
        '100': '#ede9fe',
        '200': '#ddd6fe',
        '300': '#c4b5fd',
        '400': '#a78bfa',
        '500': '#8b5cf6',
        '600': '#7c3aed',
        '700': '#6d28d9',
        '800': '#5b21b6',
        '900': '#4c1d95',
      },
      'orange-500': {
        default: '#f59e0b',
        hover: '#d97706',
        light: '#fbbf24',
        dark: '#d97706',
        '50': '#fffbeb',
        '100': '#fef3c7',
        '200': '#fde68a',
        '300': '#fcd34d',
        '400': '#fbbf24',
        '500': '#f59e0b',
        '600': '#d97706',
        '700': '#b45309',
        '800': '#92400e',
        '900': '#78350f',
      },
      'red-500': {
        default: '#ef4444',
        hover: '#dc2626',
        light: '#f87171',
        dark: '#dc2626',
        '50': '#fef2f2',
        '100': '#fee2e2',
        '200': '#fecaca',
        '300': '#fca5a5',
        '400': '#f87171',
        '500': '#ef4444',
        '600': '#dc2626',
        '700': '#b91c1c',
        '800': '#991b1b',
        '900': '#7f1d1d',
      },
    };

    const colors = colorMap[settings.primaryColor] || colorMap['brand-green'];
    
    // Set all color variations as CSS variables
    Object.keys(colors).forEach(key => {
      root.style.setProperty(`--primary-${key}`, colors[key]);
    });
    
    root.style.setProperty('--primary-color', colors.default);
    root.style.setProperty('--primary-hover', colors.hover);
    root.style.setProperty('--primary-light', colors.light);
    root.style.setProperty('--primary-dark', colors.dark);
    
  }, [settings.primaryColor]);

  // Apply dark mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Update a specific setting
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setSettings(prev => ({
      ...prev,
      darkMode: !prev.darkMode,
    }));
  };

  return (
    <ThemeContext.Provider
      value={{
        settings,
        updateSetting,
        toggleDarkMode,
        setSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme - MUST be exported
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;