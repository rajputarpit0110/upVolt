import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X, Trash2, Loader2, Check } from 'lucide-react';
import './DeleteConfirmModal.css';

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = '',
  itemSku = '',
  itemCategory = '',
  itemPrice = '',
  itemImage = '',
  itemType = 'component',
  loading = false
}) => {
  const [typedValue, setTypedValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Expected confirmation phrase (GitHub-style exact name match, or uppercase DELETE)
  const targetText = itemName || 'DELETE';
  const isMatch =
    typedValue.trim().toLowerCase() === targetText.trim().toLowerCase() ||
    typedValue.trim().toUpperCase() === 'DELETE';

  useEffect(() => {
    if (isOpen) {
      setTypedValue('');
      setError('');
      // Focus input on open
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, itemName]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMatch || loading) return;

    try {
      await onConfirm();
    } catch (err) {
      setError(err.message || `Failed to delete ${itemType}. Please try again.`);
    }
  };

  const isMentor = itemType === 'mentor';

  return (
    <div className="cc-danger-overlay" onClick={!loading ? onClose : undefined}>
      <div
        className="cc-danger-modal glass-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="danger-modal-title"
      >
        {/* Header */}
        <div className="cc-danger-header">
          <div className="cc-danger-title-group">
            <div className="cc-danger-icon-wrapper">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h2 id="danger-modal-title" className="cc-danger-title">
                Are you absolutely sure?
              </h2>
              <p className="cc-danger-subtitle">
                This action requires secondary verification
              </p>
            </div>
          </div>
          <button
            type="button"
            className="cc-danger-close-btn"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="cc-danger-banner">
          <div className="cc-danger-banner-content">
            <p className="cc-danger-banner-heading">Unexpected bad things will happen if you don't read this!</p>
            <p className="cc-danger-banner-text">
              This action <strong>cannot be undone</strong>. This will permanently delete the {itemType}{' '}
              <strong className="cc-danger-highlight-name">"{itemName}"</strong> from the {isMentor ? 'mentor directory, homepage, and guidance network' : 'catalog, inventory, and storefront'}.
            </p>
          </div>
        </div>

        {/* Item Preview Card */}
        <div className="cc-danger-item-card">
          {itemImage && (
            <div className="cc-danger-item-thumb">
              <img src={itemImage} alt={itemName} onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          )}
          <div className="cc-danger-item-info">
            <div className="cc-danger-item-name">{itemName}</div>
            <div className="cc-danger-item-meta">
              {itemSku && <span className="cc-danger-pill">{isMentor ? itemSku : `SKU: ${itemSku}`}</span>}
              {itemCategory && <span className="cc-danger-pill">{itemCategory}</span>}
              {itemPrice && <span className="cc-danger-pill cc-danger-pill--price">₹{itemPrice}</span>}
            </div>
          </div>
        </div>

        {error && (
          <div className="cc-danger-error-box">
            {error}
          </div>
        )}

        {/* Form requiring typing */}
        <form onSubmit={handleSubmit} className="cc-danger-form">
          <div className="cc-danger-prompt">
            Please type <code className="cc-danger-code-target">{itemName}</code> or <code className="cc-danger-code-target">DELETE</code> to confirm:
          </div>

          <div className="cc-danger-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className={`cc-danger-input ${isMatch ? 'cc-danger-input--matched' : ''}`}
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={`Type "${itemName}" to confirm`}
              disabled={loading}
              autoComplete="off"
              spellCheck="false"
            />
            {isMatch && (
              <div className="cc-danger-matched-badge">
                <Check size={14} /> Ready
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="cc-danger-actions">
            <button
              type="button"
              className="cc-danger-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`cc-danger-btn-submit ${isMatch ? 'cc-danger-btn-submit--active' : ''}`}
              disabled={!isMatch || loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="cc-spinner" />
                  <span>Deleting {itemType}...</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>I understand the consequences, delete this {itemType}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
