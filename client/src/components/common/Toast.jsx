import React from 'react';
import { useCart } from '../../context/CartContext';
import { CheckCircle2, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Toast.css';

export const Toast = () => {
  const { toastMessage, closeToast } = useCart();

  if (!toastMessage) return null;

  const isObj = typeof toastMessage === 'object' && toastMessage !== null;
  const title = isObj && toastMessage.title ? toastMessage.title : 'Added to Cart!';

  let productName = '';
  if (isObj) {
    productName = toastMessage.name || toastMessage.message || '';
  } else if (typeof toastMessage === 'string') {
    const match = toastMessage.match(/Added\s+"?(.*?)"?\s+to cart!/i);
    productName = match ? match[1] : toastMessage;
  }

  const image = isObj ? toastMessage.image : null;
  const price = isObj && toastMessage.price ? toastMessage.price : null;

  return (
    <aside className="cc-toast" role="status" aria-live="polite">
      <div className="cc-toast__card">
        {/* Left Visual: Product Thumbnail or Status Icon */}
        <div className="cc-toast__visual">
          {image ? (
            <div className="cc-toast__thumb-container">
              <img src={image} alt="" className="cc-toast__thumb" />
              <span className="cc-toast__thumb-badge" aria-hidden="true">
                <CheckCircle2 size={13} strokeWidth={2.8} />
              </span>
            </div>
          ) : (
            <div className="cc-toast__icon-badge" aria-hidden="true">
              <CheckCircle2 size={22} strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Middle Info */}
        <div className="cc-toast__content">
          <div className="cc-toast__header">
            <span className="cc-toast__status-pill">Success</span>
            <strong className="cc-toast__title">{title}</strong>
          </div>

          {productName && (
            <p className="cc-toast__product" title={productName}>
              {productName}
            </p>
          )}

          {price && (
            <span className="cc-toast__price">₹{price}</span>
          )}
        </div>

        {/* Right CTA Actions */}
        <div className="cc-toast__actions">
          <Link 
            to="/cart" 
            className="cc-toast__cta-btn" 
            onClick={closeToast}
            title="Go to Cart"
          >
            <span>View Cart</span>
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
          <button 
            type="button" 
            className="cc-toast__close-btn" 
            onClick={closeToast}
            aria-label="Dismiss notification"
          >
            <X size={15} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Progress countdown indicator */}
      <div className="cc-toast__progress-track" aria-hidden="true">
        <div className="cc-toast__progress-bar" />
      </div>
    </aside>
  );
};
