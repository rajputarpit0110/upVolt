import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RotateCw,
  ArrowLeft,
  Mail,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Button } from '../common/Button';
import { API_BASE_URL, safeJson } from '../../config/api';

/**
 * OtpVerificationModal
 * 6-Digit Email OTP verification view with auto-advance, backspace navigation,
 * paste detection, resend cooldown timer, and server error handling.
 */
export const OtpVerificationModal = ({
  email,
  maskedEmail,
  purpose = 'registration',
  onSuccess,
  onCancel
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // 60-Second Resend Cooldown Countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index, value) => {
    // Only accept numeric inputs
    const numeric = value.replace(/\D/g, '');
    if (!numeric) {
      const updated = [...otp];
      updated[index] = '';
      setOtp(updated);
      return;
    }

    // Handle single digit
    const digit = numeric.slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    setErrorMessage('');

    // Auto-advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const updated = [...otp];
        updated[index] = '';
        setOtp(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      if (otp.join('').length === 6 && !loading) {
        handleVerify();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const updated = ['', '', '', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      updated[i] = pastedData[i];
    }
    setOtp(updated);
    setErrorMessage('');

    // Focus last filled box or next empty box
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join('').trim();

    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: code,
          purpose
        })
      });

      const data = await safeJson(res);

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid verification code. Please try again.');
      }

      setSuccessMessage('Email verified successfully! Signing you in...');
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(data);
        }, 500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setErrorMessage('');
    setSuccessMessage('');
    setResending(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          purpose
        })
      });

      const data = await safeJson(res);

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to resend code. Please wait and try again.');
      }

      setSuccessMessage('A fresh 6-digit verification code has been dispatched to your email.');
      setCooldown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send new code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const isCodeComplete = otp.join('').length === 6;

  return (
    <div className="cc-otp-view">
      {/* Header Badge */}
      <div className="cc-auth-header-top">
        <button
          type="button"
          onClick={onCancel}
          className="cc-otp-back-btn"
          title="Return to login/registration"
        >
          <ArrowLeft size={16} />
          <span>Change Email</span>
        </button>
        <div className="cc-auth-pill-badge">
          <Sparkles size={13} />
          <span>Email Verification</span>
        </div>
      </div>

      {/* Title & Email Display */}
      <div className="cc-auth-title-wrap">
        <h1 className="cc-auth-title">Verify your email</h1>
        <p className="cc-auth-subtitle">
          We’ve sent a 6-digit verification code to
        </p>
        <div className="cc-otp-email-chip">
          <Mail size={15} className="text-accent" />
          <span className="cc-otp-masked-email">{maskedEmail || email}</span>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="cc-auth-alert-success">
          <CheckCircle2 size={18} className="cc-alert-icon text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="cc-auth-alert-error">
          <AlertCircle size={18} className="cc-alert-icon" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* OTP 6-Digit Form */}
      <form onSubmit={handleVerify} className="cc-otp-form">
        <div className="cc-otp-inputs-grid" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoComplete={idx === 0 ? 'one-time-code' : 'off'}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`cc-otp-input-box ${digit ? 'filled' : ''} ${errorMessage ? 'has-error' : ''}`}
              aria-label={`Digit ${idx + 1}`}
              disabled={loading}
            />
          ))}
        </div>

        <div className="cc-otp-timer-row">
          <span className="cc-otp-validity-note">Code valid for 5 minutes</span>
          <span className="cc-otp-cooldown-text">
            {cooldown > 0 ? (
              <>Resend in <strong className="text-accent">{cooldown}s</strong></>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || loading}
                className="cc-otp-resend-link"
              >
                {resending ? (
                  <>
                    <RotateCw size={13} className="animate-spin" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <RotateCw size={13} />
                    <span>Resend Code</span>
                  </>
                )}
              </button>
            )}
          </span>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="glow"
          size="lg"
          className="cc-auth-submit-btn cc-otp-verify-btn"
          disabled={loading || !isCodeComplete}
        >
          {loading ? (
            <span className="cc-btn-loading-content">
              <Loader2 size={18} className="animate-spin" />
              <span>Verifying code...</span>
            </span>
          ) : (
            <span className="cc-btn-content">
              <span>Verify & Continue</span>
              <ShieldCheck size={18} />
            </span>
          )}
        </Button>
      </form>

      {/* Security Footer Note */}
      <div className="cc-auth-footer-note">
        <ShieldCheck size={16} className="text-accent" />
        <span>Secured with 256-Bit Brevo Transactional Email Verification</span>
      </div>
    </div>
  );
};
