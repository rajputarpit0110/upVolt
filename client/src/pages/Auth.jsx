import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Mail, Lock, User as UserIcon, GraduationCap, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL, safeJson } from '../config/api';
import './Auth.css';

export const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const endpoint = isRegister
        ? `${API_BASE_URL}/api/auth/register`
        : `${API_BASE_URL}/api/auth/login`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await safeJson(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      login(data.user, data.token);

      if (data.user.role === 'admin' || data.user.role === 'master_admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cc-page cc-auth-page">
      <div className="container cc-auth-container">
        <div className="cc-auth-card glass-panel">
          {/* Left Form Panel */}
          <div className="cc-auth-form-panel">
            <h1 className="cc-auth-title">
              {isRegister ? 'Join upVolt' : 'Welcome back, builder.'}
            </h1>
            <p className="cc-auth-subtitle">
              {isRegister
                ? 'Create your student account to access exclusive discounts and hardware guidance.'
                : 'Turn ideas into working prototypes with student-priced hardware.'}
            </p>

            {errorMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#F87171', fontSize: '0.88rem', marginBottom: 16 }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Standard Form */}
            <form onSubmit={handleSubmit} className="cc-auth-form">
              {isRegister && (
                <>
                  <div className="cc-form-group">
                    <label className="cc-form-label">Full Name</label>
                    <div className="cc-input-wrap">
                      <UserIcon size={18} className="cc-input-icon" />
                      <input
                        type="text"
                        required
                        placeholder="Aryan Verma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="cc-input cc-input--with-icon"
                      />
                    </div>
                  </div>

                  <div className="cc-form-group">
                    <label className="cc-form-label">College / University</label>
                    <div className="cc-input-wrap">
                      <GraduationCap size={18} className="cc-input-icon" />
                      <input
                        type="text"
                        placeholder="IIT, NIT, BITS, VIT..."
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        className="cc-input cc-input--with-icon"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="cc-form-group">
                <label className="cc-form-label">
                  {isRegister ? 'Email Address' : 'Email Address or Username'}
                </label>
                <div className="cc-input-wrap">
                  <Mail size={18} className="cc-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder={isRegister ? 'student@college.edu.in' : 'Email or Username (e.g. admin1)'}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="cc-input cc-input--with-icon"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="cc-form-group">
                <label className="cc-form-label">Password</label>
                <div className="cc-input-wrap">
                  <Lock size={18} className="cc-input-icon" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="cc-input cc-input--with-icon"
                  />
                </div>
              </div>

              <Button type="submit" variant="glow" size="lg" className="cc-auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <>
                    <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            {/* Switch between Sign In / Register */}
            <div className="cc-auth-switch">
              {isRegister ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(false); setErrorMessage(''); }}
                    className="cc-auth-switch-btn"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  New to upVolt?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(true); setErrorMessage(''); }}
                    className="cc-auth-switch-btn"
                  >
                    Create an account
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Right Brand Showcase Panel */}
          <div className="cc-auth-hero-panel">
            <div className="cc-auth-hero-content">
              <div className="cc-auth-hero-badge">Student Innovation</div>
              <h2 className="cc-auth-hero-title">From breadboards to working patents.</h2>
              <p className="cc-auth-hero-text">
                Access verified microcontrollers, low-cost sensor assortments, and instant WhatsApp engineering support for your college labs.
              </p>

              <div className="cc-auth-quote">
                <p className="cc-auth-quote-text">
                  "upVolt supplied our entire IoT lab kit for the hackathon. Genuine parts delivered right to our hostel gate within 24 hours."
                </p>
                <div className="cc-auth-quote-author">
                  <strong>Priya Nair</strong>
                  <span>Electronics Engineering, 3rd Year</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
