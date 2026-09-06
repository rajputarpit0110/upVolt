import React from 'react';
import './Badge.css';

export const Badge = ({
  children,
  variant = 'bestseller',
  size = 'sm',
  dot = false,
  className = ''
}) => {
  return (
    <span className={`cc-badge cc-badge--${variant} cc-badge--${size} ${className}`}>
      {dot && <span className="cc-badge__dot" />}
      {children}
    </span>
  );
};
