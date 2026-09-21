import React, { useState, useRef } from 'react';
import {
  X,
  Lock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Copy,
  Check,
  HelpCircle
} from 'lucide-react';
import { uploadMediaFiles } from '../../services/uploadService';
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
  const [processingStage, setProcessingStage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  // Merchant UPI ID
  const upiId = 'suyashnishad16693@okicici';

  const handleCopyUpi = () => {
    try {
      navigator.clipboard?.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Screenshot file size exceeds 10MB. Please choose a smaller image.');
      return;
    }

    setError('');
    setScreenshotFile(file);
    const objectUrl = URL.createObjectURL(file);
    setScreenshotPreview(objectUrl);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
      setScreenshotPreview('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateUtr = (rawVal) => {
    const clean = rawVal.trim().replace(/\s+/g, '');
    if (!clean) {
      return 'Please enter the 12-digit UTR / UPI Reference Number from your payment app.';
    }

    const is12Digit = /^\d{12}$/.test(clean);
    const isAlphanumericBank = /^[A-Za-z0-9]{12,22}$/.test(clean);

    if (!is12Digit && !isAlphanumericBank) {
      return 'Invalid UTR. Standard UPI UTR must be exactly 12 numeric digits (e.g. 426819203912).';
    }

    // Dummy checks
    if (/^(\d)\1{11}$/.test(clean) || clean === '123456789012' || clean === '012345678901') {
      return 'The entered UTR appears to be a dummy number. Please enter the genuine UTR from your UPI transaction receipt.';
    }

    return null;
  };

  const handlePay = async () => {
    setError('');

    // 1. Validate UTR
    const utrError = validateUtr(transactionId);
    if (utrError) {
      setError(utrError);
      return;
    }

    // 2. Validate Screenshot
    if (!screenshotFile) {
      setError('Payment screenshot proof is required. Please upload the screenshot of your payment confirmation.');
      return;
    }

    const cleanUtr = transactionId.trim().replace(/\s+/g, '');

    try {
      setIsProcessing(true);
      setProcessingStage('Uploading payment proof...');

      // Upload screenshot to Cloudinary / CDN
      let screenshotUrl = '';
      const uploadedUrls = await uploadMediaFiles([screenshotFile]);
      if (uploadedUrls && uploadedUrls.length > 0) {
        screenshotUrl = uploadedUrls[0];
      } else {
        throw new Error('Could not upload payment screenshot. Please check your connection and try again.');
      }

      setProcessingStage('Verifying payment details...');

      await onSuccess({
        razorpay_payment_id: cleanUtr,
        utr: cleanUtr,
        paymentScreenshot: screenshotUrl,
        razorpay_order_id: orderId || ('order_' + Math.random().toString(36).substring(2, 14)),
        razorpay_signature: 'manual_verification'
      });
    } catch (err) {
      console.error('Payment submission failed:', err);
      setError(err.message || 'Failed to submit payment details. Please try again.');
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const cleanInputUtr = transactionId.trim().replace(/\s+/g, '');
  const isUtrComplete = /^\d{12}$/.test(cleanInputUtr);

  return (
    <div className="cc-rzp-overlay" onClick={isProcessing ? undefined : onClose}>
      <div 
        className="cc-rzp-modal cc-rzp-modal--enhanced" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '460px' }}
      >
        {/* Header */}
        <div className="cc-rzp-header">
          <div className="cc-rzp-brand">
            <div className="cc-rzp-logo-badge">⚡</div>
            <div className="cc-rzp-merchant">
              <h4>UPVOLT - Instant UPI Pay</h4>
              <span>Scan QR & Submit Verification</span>
            </div>
          </div>
          <div className="cc-rzp-amount-badge">
            <span>To Pay</span>
            <strong>₹{amount}</strong>
          </div>
          {!isProcessing && (
            <button
              type="button"
              className="cc-rzp-close-btn"
              onClick={onClose}
              title="Cancel payment"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="cc-rzp-body cc-rzp-body--single">
          {/* QR Code Section */}
          <div className="cc-rzp-qr-wrapper">
            <div className="cc-rzp-qr-box-main">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=upVolt&am=${amount}&cu=INR`)}`}
                alt="Scan to Pay via UPI" 
                className="cc-rzp-qr-img"
              />
            </div>
            <div className="cc-rzp-upi-id-bar">
              <span className="cc-rzp-upi-label">UPI ID:</span>
              <strong className="cc-rzp-upi-val">{upiId}</strong>
              <button 
                type="button" 
                className="cc-rzp-copy-btn" 
                onClick={handleCopyUpi}
                title="Copy UPI ID"
              >
                {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="cc-rzp-scan-hint">
              Pay via <strong>GPay, PhonePe, Paytm, BHIM</strong> or any UPI App.
            </p>
          </div>

          <div className="cc-rzp-divider" />

          {/* Form Fields: UTR & Screenshot */}
          <div className="cc-rzp-fields-section">
            {/* Field 1: UTR */}
            <div className="cc-rzp-field-group">
              <div className="cc-rzp-field-label-row">
                <label className="cc-rzp-label" htmlFor="rzp-utr-input">
                  1. 12-Digit UTR / Transaction ID <span className="cc-required">*</span>
                </label>
                <span className={`cc-rzp-utr-count ${isUtrComplete ? 'cc-rzp-utr-count--valid' : ''}`}>
                  {cleanInputUtr.length}/12 Digits {isUtrComplete && <Check size={12} strokeWidth={3} />}
                </span>
              </div>
              <div className="cc-rzp-input-container">
                <input
                  id="rzp-utr-input"
                  type="text"
                  maxLength={22}
                  disabled={isProcessing}
                  value={transactionId}
                  onChange={(e) => {
                    setTransactionId(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. 426819203912"
                  className={`cc-rzp-input ${isUtrComplete ? 'cc-rzp-input--valid' : ''}`}
                />
              </div>
              <p className="cc-rzp-hint">
                <HelpCircle size={12} />
                <span>Found in your payment app under &quot;UPI Ref No.&quot; or &quot;UTR&quot;.</span>
              </p>
            </div>

            {/* Field 2: Screenshot Upload */}
            <div className="cc-rzp-field-group">
              <div className="cc-rzp-field-label-row">
                <label className="cc-rzp-label">
                  2. Payment Screenshot Proof <span className="cc-required">*</span>
                </label>
                {screenshotFile && (
                  <span className="cc-rzp-screenshot-badge">
                    <CheckCircle2 size={12} color="#10B981" /> Ready
                  </span>
                )}
              </div>

              {/* Hidden native file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                disabled={isProcessing}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {!screenshotFile ? (
                <div 
                  className="cc-rzp-upload-dropzone"
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                >
                  <div className="cc-rzp-upload-icon-circle">
                    <UploadCloud size={20} />
                  </div>
                  <div className="cc-rzp-upload-text">
                    <strong>Click to upload payment screenshot</strong>
                    <span>PNG, JPG or WEBP (Max 10MB)</span>
                  </div>
                </div>
              ) : (
                <div className="cc-rzp-preview-card">
                  <div className="cc-rzp-preview-thumb-wrap">
                    <img 
                      src={screenshotPreview} 
                      alt="Payment screenshot proof" 
                      className="cc-rzp-preview-thumb" 
                    />
                  </div>
                  <div className="cc-rzp-preview-meta">
                    <strong className="cc-rzp-preview-filename" title={screenshotFile.name}>
                      {screenshotFile.name}
                    </strong>
                    <span className="cc-rzp-preview-size">
                      {(screenshotFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  {!isProcessing && (
                    <div className="cc-rzp-preview-actions">
                      <button
                        type="button"
                        className="cc-rzp-preview-change-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        className="cc-rzp-preview-remove-btn"
                        onClick={handleRemoveScreenshot}
                        title="Remove image"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Alert Box */}
            {error && (
              <div className="cc-rzp-error-box" role="alert">
                <AlertCircle size={16} className="cc-rzp-error-icon" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="cc-rzp-footer">
          <div className="cc-rzp-security">
            <Lock size={14} />
            <span>Encrypted • 100% Secure Checkout</span>
          </div>

          <div className="cc-rzp-footer-btns">
            <button
              type="button"
              className="cc-rzp-submit-btn cc-rzp-submit-btn--full"
              onClick={handlePay}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{processingStage || 'Processing Payment...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Confirm & Place Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
