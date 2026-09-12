import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import {
  Mail,
  Lock,
  User as UserIcon,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Quote,
  Zap
} from 'lucide-react';
import { OtpVerificationModal } from '../components/auth/OtpVerificationModal';
import { API_BASE_URL, safeJson } from '../config/api';
import './Auth.css';

export const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const returnUrl = location.state?.returnUrl;
  const stateParams = location.state?.checkoutState ? { state: location.state.checkoutState } : undefined;

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [otpState, setOtpState] = useState({
    required: false,
    email: '',
    maskedEmail: '',
    purpose: 'registration'
  });

  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

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

      if (data.requiresOtp) {
        setOtpState({
          required: true,
          email: data.fullEmail || formData.email.trim().toLowerCase(),
          maskedEmail: data.email,
          purpose: isRegister ? 'registration' : 'login'
        });
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed. Please check your credentials.');
      }

      login(data.user, data.token);

      if (returnUrl) {
        navigate(returnUrl, stateParams);
      } else if (data.user.role === 'admin' || data.user.role === 'master_admin') {
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

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await safeJson(res);
      if (data.requiresOtp) {
        setOtpState({
          required: true,
          email: data.fullEmail || formData.email.trim().toLowerCase(),
          maskedEmail: data.email,
          purpose: 'password-reset'
        });
      } else {
        throw new Error(data.message || 'Failed to initiate password reset.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error initiating password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const tokenObj = localStorage.getItem('upvolt_user') || localStorage.getItem('campuscircuit_user');
      const token = tokenObj ? JSON.parse(tokenObj).token : null;
      if (!token) throw new Error('Session expired. Please log in again.');

      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: resetPasswordForm.newPassword })
      });
      const data = await safeJson(res);

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      if (returnUrl) {
        navigate(returnUrl, stateParams);
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = (data) => {
    login(data.user, data.token);

    if (otpState.purpose === 'password-reset') {
      setOtpState({ required: false, email: '', maskedEmail: '', purpose: 'registration' });
      setForgotPasswordMode(false);
      setResetPasswordMode(true);
      return;
    }

    if (returnUrl) {
      navigate(returnUrl, stateParams);
    } else if (data.user.role === 'admin' || data.user.role === 'master_admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleOtpCancel = () => {
    setOtpState({
      required: false,
      email: '',
      maskedEmail: '',
      purpose: 'registration'
    });
    setErrorMessage('');
  };

  return (
    <div className="cc-page cc-auth-page">
      <div className="container cc-auth-container">
        {/* Main Card */}
        <div className="cc-auth-card">

          {/* Left Form Panel */}
          <div className="cc-auth-form-panel">
            {otpState.required ? (
              <OtpVerificationModal
                email={otpState.email}
                maskedEmail={otpState.maskedEmail}
                purpose={otpState.purpose}
                onSuccess={handleOtpSuccess}
                onCancel={handleOtpCancel}
              />
            ) : (
              <>
                {/* Brand Logo & Mode Badge */}
                <div className="cc-auth-header-top">
                  <Link to="/" className="cc-auth-brand-link">
                    <span className="cc-auth-brand-bolt">⚡</span>
                    <span className="cc-auth-brand-text">up<span>Volt</span></span>
                  </Link>
                  <div className="cc-auth-pill-badge">
                    <Sparkles size={13} />
                    <span>{resetPasswordMode ? 'Secure Reset' : forgotPasswordMode ? 'Account Recovery' : isRegister ? 'Student Registration' : 'Secure Login'}</span>
                  </div>
                </div>

                {resetPasswordMode ? (
                  <>
                    <div className="cc-auth-title-wrap">
                      <h1 className="cc-auth-title">Set New Password</h1>
                      <p className="cc-auth-subtitle">Please enter a new, strong password.</p>
                    </div>
                    {errorMessage && (
                      <div className="cc-auth-alert-error">
                        <AlertCircle size={18} className="cc-alert-icon" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                    <form onSubmit={handleResetPasswordSubmit} className="cc-auth-form">
                      <div className="cc-form-group">
                        <label className="cc-form-label">New Password</label>
                        <div className="cc-input-wrap">
                          <Lock size={18} className="cc-input-icon" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••••••"
                            value={resetPasswordForm.newPassword}
                            onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value })}
                            className="cc-input cc-input--with-icon cc-input--with-action"
                            minLength={6}
                          />
                          <button
                            type="button"
                            className="cc-input-action-btn"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="cc-form-group">
                        <label className="cc-form-label">Confirm Password</label>
                        <div className="cc-input-wrap">
                          <Lock size={18} className="cc-input-icon" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••••••"
                            value={resetPasswordForm.confirmPassword}
                            onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value })}
                            className="cc-input cc-input--with-icon cc-input--with-action"
                            minLength={6}
                          />
                        </div>
                      </div>
                      <Button type="submit" variant="glow" size="lg" className="cc-auth-submit-btn" disabled={loading}>
                        {loading ? (
                          <span className="cc-btn-loading-content">
                            <Loader2 size={18} className="animate-spin" />
                            <span>Updating Password...</span>
                          </span>
                        ) : (
                          <span className="cc-btn-content">
                            <span>Update Password</span>
                            <ArrowRight size={18} />
                          </span>
                        )}
                      </Button>
                    </form>
                  </>
                ) : forgotPasswordMode ? (
                  <>
                    <div className="cc-auth-title-wrap">
                      <h1 className="cc-auth-title">Forgot Password</h1>
                      <p className="cc-auth-subtitle">Enter your email and we'll send you a verification code to reset it.</p>
                    </div>
                    {errorMessage && (
                      <div className="cc-auth-alert-error">
                        <AlertCircle size={18} className="cc-alert-icon" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                    <form onSubmit={handleForgotPasswordSubmit} className="cc-auth-form">
                      <div className="cc-form-group">
                        <label className="cc-form-label">Email Address</label>
                        <div className="cc-input-wrap">
                          <Mail size={18} className="cc-input-icon" />
                          <input
                            type="text"
                            required
                            placeholder="student@college.edu.in"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="cc-input cc-input--with-icon"
                          />
                        </div>
                      </div>
                      <Button type="submit" variant="glow" size="lg" className="cc-auth-submit-btn" disabled={loading}>
                        {loading ? (
                          <span className="cc-btn-loading-content">
                            <Loader2 size={18} className="animate-spin" />
                            <span>Sending Code...</span>
                          </span>
                        ) : (
                          <span className="cc-btn-content">
                            <span>Send Reset Code</span>
                            <ArrowRight size={18} />
                          </span>
                        )}
                      </Button>
                      <button
                        type="button"
                        className="cc-auth-back-link"
                        onClick={() => { setForgotPasswordMode(false); setErrorMessage(''); }}
                        style={{ marginTop: '1rem', width: '100%', textAlign: 'center', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
                      >
                        Back to Login
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    {/* Mode Switcher Tabs */}
                    <div className="cc-auth-tabs">
                      <button
                        type="button"
                        className={`cc-auth-tab ${!isRegister ? 'active' : ''}`}
                        onClick={() => { setIsRegister(false); setErrorMessage(''); }}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        className={`cc-auth-tab ${isRegister ? 'active' : ''}`}
                        onClick={() => { setIsRegister(true); setErrorMessage(''); }}
                      >
                        Create Account
                      </button>
                    </div>

                    {/* Titles */}
                    <div className="cc-auth-title-wrap">
                      <h1 className="cc-auth-title">
                        {isRegister ? 'Join the maker revolution.' : 'Welcome back, builder.'}
                      </h1>
                      <p className="cc-auth-subtitle">
                        {isRegister
                          ? 'Access verified microcontrollers, student-exclusive discounts, and instant WhatsApp guidance.'
                          : 'Log in to manage orders, access saved lab components, and track shipments.'}
                      </p>
                    </div>

                    {/* Error Message Box */}
                    {errorMessage && (
                      <div className="cc-auth-alert-error">
                        <AlertCircle size={18} className="cc-alert-icon" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Form */}
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
                                placeholder="Arpit Rajput"
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
                                placeholder="IIT, NIT, DTU, VIT, BITS..."
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
                        <div className="cc-form-label-row">
                          <label className="cc-form-label">Password</label>
                          {!isRegister && (
                            <button
                              type="button"
                              className="cc-forgot-hint"
                              onClick={() => {
                                setForgotPasswordMode(true);
                                setErrorMessage('');
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              Forgot Password?
                            </button>
                          )}
                        </div>
                        <div className="cc-input-wrap">
                          <Lock size={18} className="cc-input-icon" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="cc-input cc-input--with-icon cc-input--with-action"
                            autoComplete={isRegister ? 'new-password' : 'current-password'}
                          />
                          <button
                            type="button"
                            className="cc-input-action-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button type="submit" variant="glow" size="lg" className="cc-auth-submit-btn" disabled={loading}>
                        {loading ? (
                          <span className="cc-btn-loading-content">
                            <Loader2 size={18} className="animate-spin" />
                            <span>{isRegister ? 'Creating your account...' : 'Authenticating...'}</span>
                          </span>
                        ) : (
                          <span className="cc-btn-content">
                            <span>{isRegister ? 'Create Student Account' : 'Sign In to Dashboard'}</span>
                            <ArrowRight size={18} />
                          </span>
                        )}
                      </Button>
                    </form>

                    {/* Bottom Footer Note */}
                    <div className="cc-auth-footer-note">
                      <ShieldCheck size={16} className="text-accent" />
                      <span>256-Bit SSL Encrypted Authentication & Secure Session Tokens</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right Brand Showcase Panel */}
          <div className="cc-auth-hero-panel">
            <div className="cc-auth-hero-overlay"></div>

            <div className="cc-auth-hero-content">
              <div className="cc-auth-hero-badge">
                <Zap size={14} className="badge-icon" />
                <span>Student Innovation Platform</span>
              </div>

              <h2 className="cc-auth-hero-title">
                From breadboards to <span>working patents.</span>
              </h2>

              <p className="cc-auth-hero-text">
                Access verified microcontrollers, low-cost sensor assortments, and instant WhatsApp engineering support for your college labs & hackathons.
              </p>

              {/* Feature Highlights */}
              <div className="cc-auth-features">
                <div className="cc-auth-feature-item">
                  <div className="cc-feat-icon-wrap">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <strong>100% Tested Components</strong>
                    <span>Every ESP32, Arduino & sensor pre-tested before dispatch</span>
                  </div>
                </div>

                <div className="cc-auth-feature-item">
                  <div className="cc-feat-icon-wrap">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <strong>Express Hostel Delivery</strong>
                    <span>Delivered direct to your college hostel gate in 24-48 hrs</span>
                  </div>
                </div>

                <div className="cc-auth-feature-item">
                  <div className="cc-feat-icon-wrap">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <strong>Direct Mentor WhatsApp Support</strong>
                    <span>Get circuit diagrams, libraries & pinout assistance instantly</span>
                  </div>
                </div>
              </div>

              {/* Verified Student Quote Card */}
              <div className="cc-auth-quote-card">
                <Quote size={24} className="cc-quote-icon" />
                <p className="cc-auth-quote-text">
                  "upVolt supplied our entire IoT lab kit for the hackathon. Genuine parts delivered right to our hostel gate within 24 hours."
                </p>
                <div className="cc-auth-quote-author">
                  <img
                    src="/images/founders/arpit_avatar.jpg"
                    alt="Arpit Rajput"
                    className="cc-author-avatar-img"
                    width="40"
                    height="40"
                    loading="lazy"
                  />
                  <div className="cc-author-meta">
                    <strong className="cc-author-name">Arpit Rajput</strong>
                    <span className="cc-author-college">Computer Science Engineering</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
