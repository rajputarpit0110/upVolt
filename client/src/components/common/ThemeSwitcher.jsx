import React, { useState, useRef, useEffect } from 'react';
import { useTheme, THEMES } from '../../context/ThemeContext';
import { Sun, Moon, Eye, Check } from 'lucide-react';
import './ThemeSwitcher.css';

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside (handles both mouse and touch on mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const getThemeIcon = () => {
    switch (theme) {
      case THEMES.DARK:
        return <Moon size={18} className="theme-icon theme-icon--dark" />;
      case THEMES.EYECARE:
        return <Eye size={18} className="theme-icon theme-icon--eyecare" />;
      case THEMES.LIGHT:
      default:
        return <Sun size={18} className="theme-icon theme-icon--light" />;
    }
  };

  const options = [
    {
      id: THEMES.LIGHT,
      label: 'Light',
      desc: 'Clean & bright daylight (Default)',
      icon: <Sun size={16} />
    },
    {
      id: THEMES.DARK,
      label: 'Dark',
      desc: 'Easy on the eyes',
      icon: <Moon size={16} />
    },
    {
      id: THEMES.EYECARE,
      label: 'Eye Care',
      desc: 'Warm & soothing paper tone',
      icon: <Eye size={16} />
    }
  ];

  return (
    <div className="theme-switcher-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="theme-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title={`Current Theme: ${theme.toUpperCase()}. Click to switch.`}
        aria-label="Toggle Theme Menu"
      >
        {getThemeIcon()}
      </button>

      {isOpen && (
        <div className="theme-switcher-dropdown glass-panel">
          <div className="theme-dropdown-header">
            <span className="theme-dropdown-title">Appearance</span>
          </div>

          <div className="theme-options-list">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`theme-option-item ${theme === opt.id ? 'theme-option-item--active' : ''}`}
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
              >
                <div className="theme-option-icon">{opt.icon}</div>
                <div className="theme-option-content">
                  <div className="theme-option-label">{opt.label}</div>
                  <div className="theme-option-desc">{opt.desc}</div>
                </div>
                {theme === opt.id && (
                  <div className="theme-option-check">
                    <Check size={16} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
