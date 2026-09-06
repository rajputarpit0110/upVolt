import React, { useState } from 'react';
import { X, Tag, Calendar, AlertCircle, CheckCircle, Loader2, Sparkles, Percent, DollarSign } from 'lucide-react';
import { createCoupon } from '../../services/couponService';
import './AddCouponModal.css';

const formatDateForInput = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

export const AddCouponModal = ({ isOpen, onClose, onCouponAdded }) => {
  const todayStr = formatDateForInput(new Date());
  
  const defaultUntil = new Date();
  defaultUntil.setDate(defaultUntil.getDate() + 14);
  const defaultUntilStr = formatDateForInput(defaultUntil);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '15',
    validFrom: todayStr,
    validUntil: defaultUntilStr,
    minOrderAmount: '0',
    maxDiscountAmount: '300',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'code') {
      setFormData(prev => ({ ...prev, code: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Preset Date Range buttons
  const setQuickRange = (rangeType) => {
    const from = new Date();
    const until = new Date();

    if (rangeType === 'today') {
      // Today only
      setFormData(prev => ({
        ...prev,
        validFrom: formatDateForInput(from),
        validUntil: formatDateForInput(until)
      }));
    } else if (rangeType === 'weekend') {
      // 3 days
      until.setDate(from.getDate() + 3);
      setFormData(prev => ({
        ...prev,
        validFrom: formatDateForInput(from),
        validUntil: formatDateForInput(until)
      }));
    } else if (rangeType === 'week') {
      // 7 days
      until.setDate(from.getDate() + 7);
      setFormData(prev => ({
        ...prev,
        validFrom: formatDateForInput(from),
        validUntil: formatDateForInput(until)
      }));
    } else if (rangeType === 'month') {
      // 30 days
      until.setDate(from.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        validFrom: formatDateForInput(from),
        validUntil: formatDateForInput(until)
      }));
    } else if (rangeType === 'endOfYear') {
      // Until December 31
      until.setMonth(11, 31);
      setFormData(prev => ({
        ...prev,
        validFrom: formatDateForInput(from),
        validUntil: formatDateForInput(until)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.code.trim()) {
      setError('Please provide a coupon code.');
      return;
    }

    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      setError('Discount value must be greater than 0.');
      return;
    }

    if (new Date(formData.validUntil) < new Date(formData.validFrom)) {
      setError('Valid Until date must be on or after Valid From date.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        description: formData.description.trim()
      };

      await createCoupon(payload);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onCouponAdded) onCouponAdded();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to create coupon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cc-modal-overlay" onClick={onClose}>
      <div
        className="cc-modal-card glass-panel"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-coupon-title"
      >
        {/* Header */}
        <div className="cc-modal-header">
          <div className="cc-modal-title-group">
            <div className="cc-modal-badge-icon">
              <Tag size={20} />
            </div>
            <div>
              <h2 id="add-coupon-title" className="cc-modal-title">
                Create Discount Coupon
              </h2>
              <p className="cc-modal-subtitle">
                Configure discount rates and date-based validity range
              </p>
            </div>
          </div>
          <button
            type="button"
            className="cc-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="cc-modal-alert cc-modal-alert--error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="cc-modal-alert cc-modal-alert--success">
            <CheckCircle size={18} />
            <span>Coupon created successfully! Updating active list...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="cc-modal-form">
          <div className="cc-form-grid">
            {/* Coupon Code */}
            <div className="cc-form-group">
              <label className="cc-form-label">
                Coupon Code <span className="cc-required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="code"
                  required
                  className="cc-input"
                  placeholder="e.g. CAMPUS20, MAKER50"
                  value={formData.code}
                  onChange={handleChange}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}
                />
              </div>
            </div>

            {/* Discount Type */}
            <div className="cc-form-group">
              <label className="cc-form-label">Discount Type</label>
              <div className="cc-coupon-type-toggle">
                <button
                  type="button"
                  className={`cc-toggle-pill ${formData.discountType === 'percentage' ? 'cc-toggle-pill--active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, discountType: 'percentage' }))}
                >
                  <Percent size={14} />
                  <span>Percentage (%)</span>
                </button>
                <button
                  type="button"
                  className={`cc-toggle-pill ${formData.discountType === 'fixed' ? 'cc-toggle-pill--active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, discountType: 'fixed' }))}
                >
                  <span style={{ fontWeight: 700 }}>₹</span>
                  <span>Flat Amount</span>
                </button>
              </div>
            </div>

            {/* Discount Value */}
            <div className="cc-form-group">
              <label className="cc-form-label">
                {formData.discountType === 'percentage' ? 'Discount Percentage (%)' : 'Flat Discount (₹)'} <span className="cc-required">*</span>
              </label>
              <input
                type="number"
                name="discountValue"
                required
                min="1"
                max={formData.discountType === 'percentage' ? '100' : '10000'}
                className="cc-input"
                placeholder={formData.discountType === 'percentage' ? '15' : '100'}
                value={formData.discountValue}
                onChange={handleChange}
              />
            </div>

            {/* Min Order Value */}
            <div className="cc-form-group">
              <label className="cc-form-label">Min Order Value (₹)</label>
              <input
                type="number"
                name="minOrderAmount"
                min="0"
                className="cc-input"
                placeholder="0 for no minimum"
                value={formData.minOrderAmount}
                onChange={handleChange}
              />
            </div>

            {/* Max Discount (only for percentage) */}
            {formData.discountType === 'percentage' && (
              <div className="cc-form-group cc-form-group--full">
                <label className="cc-form-label">Max Discount Cap (₹) (Optional)</label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  min="1"
                  className="cc-input"
                  placeholder="e.g. 250 (Leave empty for no limit)"
                  value={formData.maxDiscountAmount}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Date Range Presets */}
            <div className="cc-form-group cc-form-group--full">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="cc-form-label" style={{ margin: 0 }}>
                  Validity Range Preset
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Select:</span>
              </div>
              <div className="cc-coupon-presets">
                <button type="button" className="cc-preset-chip" onClick={() => setQuickRange('today')}>
                  📅 Today Only
                </button>
                <button type="button" className="cc-preset-chip" onClick={() => setQuickRange('weekend')}>
                  ⚡ 3 Days
                </button>
                <button type="button" className="cc-preset-chip" onClick={() => setQuickRange('week')}>
                  🗓️ 7 Days
                </button>
                <button type="button" className="cc-preset-chip" onClick={() => setQuickRange('month')}>
                  🌟 30 Days
                </button>
                <button type="button" className="cc-preset-chip" onClick={() => setQuickRange('endOfYear')}>
                  🚀 Full Year
                </button>
              </div>
            </div>

            {/* Valid From Date */}
            <div className="cc-form-group">
              <label className="cc-form-label">
                Valid From Date <span className="cc-required">*</span>
              </label>
              <div className="cc-date-input-wrap">
                <Calendar size={16} className="cc-date-icon" />
                <input
                  type="date"
                  name="validFrom"
                  required
                  className="cc-input cc-input--with-icon"
                  value={formData.validFrom}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Valid Until / Expiry Date */}
            <div className="cc-form-group">
              <label className="cc-form-label">
                Valid Until (Expiry) <span className="cc-required">*</span>
              </label>
              <div className="cc-date-input-wrap">
                <Calendar size={16} className="cc-date-icon" />
                <input
                  type="date"
                  name="validUntil"
                  required
                  className="cc-input cc-input--with-icon"
                  value={formData.validUntil}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Description / Terms */}
            <div className="cc-form-group cc-form-group--full">
              <label className="cc-form-label">Description / Offer Details</label>
              <input
                type="text"
                name="description"
                className="cc-input"
                placeholder="e.g. 20% discount on all IoT controllers for upcoming hackathon"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="cc-modal-footer">
            <button
              type="button"
              className="cc-btn cc-btn--outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cc-btn cc-btn--primary"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="cc-spinner" />
                  <span>Creating Coupon...</span>
                </>
              ) : (
                <>
                  <Tag size={16} />
                  <span>Publish Coupon</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
