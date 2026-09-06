import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  CreditCard,
  QrCode,
  Building,
  Smartphone,
  Lock,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import './RazorpayModal.css';

export const RazorpayModal = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  orderId,
  customerName,
  customerEmail,
  customerPhone
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('upi');
  const [selectedUpi, setSelectedUpi] = useState('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({
        razorpay_payment_id: 'pay_' + Math.random().toString(36).substring(2, 14),
        razorpay_order_id: orderId || ('order_' + Math.random().toString(36).substring(2, 14)),
        razorpay_signature: 'verified_dev'
      });
    }, 1200);
  };

  return (
    <div className="cc-rzp-overlay" onClick={onClose}>
      <div className="cc-rzp-modal" onClick={(e) => e.stopPropagation()}>
        {/* Razorpay Brand Header */}
        <div className="cc-rzp-header">
          <div className="cc-rzp-brand">
            <div className="cc-rzp-logo-badge">
              <span className="cc-rzp-logo-text">R</span>
            </div>
            <div className="cc-rzp-merchant">
              <h4>CampusCircuit</h4>
              <span>Hardware &amp; IoT Project Store</span>
            </div>
          </div>
          <div className="cc-rzp-amount-badge">
            <span>Amount to Pay</span>
            <strong>₹{amount}</strong>
          </div>
          <button
            type="button"
            className="cc-rzp-close-btn"
            onClick={onClose}
            title="Cancel payment"
            aria-label="Cancel payment"
          >
            <X size={18} />
          </button>
        </div>

        {/* Test Mode Banner */}
        <div className="cc-rzp-test-banner">
          <span>⚡ <strong>Razorpay Test / Sandbox Gateway</strong> • 100% Safe Simulation</span>
        </div>

        <div className="cc-rzp-body">
          {/* Payment Method Selector Sidebar */}
          <div className="cc-rzp-tabs">
            <button
              type="button"
              className={`cc-rzp-tab ${activeTab === 'upi' ? 'cc-rzp-tab--active' : ''}`}
              onClick={() => setActiveTab('upi')}
            >
              <Smartphone size={16} />
              <span>UPI / QR</span>
            </button>
            <button
              type="button"
              className={`cc-rzp-tab ${activeTab === 'card' ? 'cc-rzp-tab--active' : ''}`}
              onClick={() => setActiveTab('card')}
            >
              <CreditCard size={16} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              className={`cc-rzp-tab ${activeTab === 'netbanking' ? 'cc-rzp-tab--active' : ''}`}
              onClick={() => setActiveTab('netbanking')}
            >
              <Building size={16} />
              <span>NetBanking</span>
            </button>
          </div>

          {/* Payment Content View */}
          <div className="cc-rzp-content">
            {activeTab === 'upi' && (
              <div className="cc-rzp-upi-view">
                <div className="cc-rzp-upi-options">
                  <label className={`cc-rzp-upi-option ${selectedUpi === 'gpay' ? 'cc-rzp-upi-option--active' : ''}`}>
                    <input
                      type="radio"
                      name="upiApp"
                      value="gpay"
                      checked={selectedUpi === 'gpay'}
                      onChange={() => setSelectedUpi('gpay')}
                    />
                    <span>Google Pay</span>
                  </label>
                  <label className={`cc-rzp-upi-option ${selectedUpi === 'phonepe' ? 'cc-rzp-upi-option--active' : ''}`}>
                    <input
                      type="radio"
                      name="upiApp"
                      value="phonepe"
                      checked={selectedUpi === 'phonepe'}
                      onChange={() => setSelectedUpi('phonepe')}
                    />
                    <span>PhonePe</span>
                  </label>
                  <label className={`cc-rzp-upi-option ${selectedUpi === 'paytm' ? 'cc-rzp-upi-option--active' : ''}`}>
                    <input
                      type="radio"
                      name="upiApp"
                      value="paytm"
                      checked={selectedUpi === 'paytm'}
                      onChange={() => setSelectedUpi('paytm')}
                    />
                    <span>Paytm UPI</span>
                  </label>
                </div>

                <div className="cc-rzp-qr-box">
                  <QrCode size={56} className="cc-rzp-qr-icon" />
                  <p>Or scan UPI QR code directly on your mobile screen</p>
                </div>
              </div>
            )}

            {activeTab === 'card' && (
              <div className="cc-rzp-card-view">
                <div className="cc-rzp-input-field">
                  <label>Card Number</label>
                  <input
                    type="text"
                    placeholder="4111 •••• •••• 1111"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                  />
                </div>
                <div className="cc-rzp-card-row">
                  <div className="cc-rzp-input-field">
                    <label>Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="12/28"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    />
                  </div>
                  <div className="cc-rzp-input-field">
                    <label>CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'netbanking' && (
              <div className="cc-rzp-netbanking-view">
                <p>Select your college or personal bank account:</p>
                <div className="cc-rzp-bank-chips">
                  <span className="cc-rzp-bank-chip">SBI</span>
                  <span className="cc-rzp-bank-chip">HDFC</span>
                  <span className="cc-rzp-bank-chip">ICICI</span>
                  <span className="cc-rzp-bank-chip">Axis Bank</span>
                  <span className="cc-rzp-bank-chip">Punjab National Bank</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="cc-rzp-footer">
          <div className="cc-rzp-security">
            <Lock size={14} />
            <span>256-Bit SSL Encrypted by Razorpay</span>
          </div>

          <div className="cc-rzp-footer-btns">
            <button
              type="button"
              className="cc-rzp-cancel-btn"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel Payment
            </button>

            <button
              type="button"
              className="cc-rzp-submit-btn"
              onClick={handlePay}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Complete Payment (₹{amount})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
