import React from 'react';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`cc-btn cc-btn--${variant} cc-btn--${size} ${fullWidth ? 'cc-btn--full' : ''} ${loading ? 'cc-btn--loading' : ''} ${className}`}
      {...props}
    >
      {loading && <span className="cc-btn__spinner" />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="cc-btn__icon cc-btn__icon--left">{icon}</span>
      )}
      <span className="cc-btn__text">{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="cc-btn__icon cc-btn__icon--right">{icon}</span>
      )}
    </button>
  );
};
