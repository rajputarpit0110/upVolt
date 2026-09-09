import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Lock,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import './RazorpayModal.css';

export const RazorpayModal = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  orderId
}) => {
  if (!isOpen) return null;

  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState('');

  // Placeholder UPI ID - USER SHOULD CHANGE THIS!
  const upiId = 'suyashnishad16693@okicici'; 

  const handlePay = () => {
    if (!transactionId || transactionId.trim().length < 8) {
      setError('Please enter a valid 12-digit UTR or Transaction ID from your payment app.');
      return;
    }

    setError('');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({
        razorpay_payment_id: transactionId.trim(),
        razorpay_order_id: orderId || ('order_' + Math.random().toString(36).substring(2, 14)),
        razorpay_signature: 'manual_verification'
      });
    }, 1200);
  };

  return (
    <div className="cc-rzp-overlay" onClick={onClose}>
      <div className="cc-rzp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        {/* Header */}
        <div className="cc-rzp-header" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="cc-rzp-brand">
            <div className="cc-rzp-merchant">
              <h4>UPVOLT - Secure Checkout</h4>
              <span style={{ color: 'var(--text-secondary)' }}>Pay directly via UPI</span>
            </div>
          </div>
          <div className="cc-rzp-amount-badge" style={{ background: 'var(--bg-inset)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Amount to Pay</span>
            <strong style={{ color: 'var(--text-primary)' }}>₹{amount}</strong>
          </div>
          <button
            type="button"
            className="cc-rzp-close-btn"
            onClick={onClose}
            title="Cancel payment"
          >
            <X size={18} />
          </button>
        </div>

        <div className="cc-rzp-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px', gap: '20px' }}>
          
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Scan and Pay</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Open Google Pay, PhonePe, or Paytm and scan the QR code below to pay <strong>₹{amount}</strong>.
            </p>
          </div>

          {/* QR Code Container */}
          <div style={{ 
            padding: '16px', 
            background: 'white', 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {/* Generate a dynamic UPI QR Code using an open API */}
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}&pn=upVolt&am=${amount}&cu=INR`} 
              alt="UPI Payment QR Code" 
              style={{ width: '200px', height: '200px', display: 'block' }}
            />
          </div>

          <div style={{ textAlign: 'center', width: '100%' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>UPI ID: {upiId}</span>
          </div>

          <div style={{ width: '100%', marginTop: '10px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Enter UTR / Transaction ID (12 Digits) *
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => {
                setTransactionId(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. 312345678901"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-inset)',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}
            />
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.8rem', marginTop: '8px' }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="cc-rzp-footer" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
          <div className="cc-rzp-security" style={{ color: 'var(--text-secondary)' }}>
            <Lock size={14} />
            <span>Secure Manual Verification</span>
          </div>

          <div className="cc-rzp-footer-btns">
            <button
              type="button"
              className="cc-rzp-submit-btn"
              onClick={handlePay}
              disabled={isProcessing}
              style={{ width: '100%', padding: '14px', borderRadius: '8px', background: 'var(--accent-primary)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Confirm Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
