import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';
import './GoToHomeBtn.css';

export const GoToHomeBtn = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoHome = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="cc-go-home-section" aria-label="Return to Home Screen">
      <div className="container cc-go-home-container">
        <div className="cc-go-home-divider" />
        <button
          type="button"
          onClick={handleGoHome}
          className="cc-go-home-btn"
          id="btn-go-to-home"
          title="Return to upVolt Home Screen"
        >
          <span className="cc-go-home-icon-box">
            <Home size={18} />
          </span>
          <span className="cc-go-home-label">Go to Home Screen</span>
          <ArrowRight size={16} className="cc-go-home-arrow" />
        </button>
        <div className="cc-go-home-divider" />
      </div>
    </section>
  );
};
