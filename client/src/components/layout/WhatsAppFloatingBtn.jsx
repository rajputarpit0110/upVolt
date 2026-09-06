import React, { useState, useEffect, useRef } from 'react';
import { getWhatsAppLink, WHATSAPP_GROUP_LINK, PRIORITY_BUYING_NUMBERS } from '../../utils/constants';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { X, Users, Zap, MessageSquare } from 'lucide-react';
import './WhatsAppFloatingBtn.css';

export const WhatsAppFloatingBtn = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="cc-whatsapp-floating-wrapper" ref={containerRef}>
      {/* Interactive Popover Menu */}
      {isOpen && (
        <div className="cc-whatsapp-popover glass-panel animate-scale-in">
          <div className="cc-whatsapp-popover__header">
            <div className="cc-whatsapp-popover__header-title">
              <span className="cc-whatsapp-popover__pulse" />
              <div>
                <h4>Buy Components on WhatsApp</h4>
                <p>Instant dispatch for engineering students</p>
              </div>
            </div>
            <button
              type="button"
              className="cc-whatsapp-popover__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          <div className="cc-whatsapp-popover__body">
            <div className="cc-whatsapp-popover__tag">
              <Zap size={13} />
              <span>Priority Direct Buying Lines:</span>
            </div>

            <div className="cc-whatsapp-popover__lines">
              {PRIORITY_BUYING_NUMBERS.map((line, idx) => (
                <a
                  key={idx}
                  href={getWhatsAppLink(`Hi upVolt! I want to order/buy components directly via ${line.display}. Please share availability and fast delivery details.`, line.raw)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`cc-whatsapp-line-card ${idx === 0 ? 'cc-whatsapp-line-card--founder' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="cc-whatsapp-line-card__left">
                    <div className="cc-whatsapp-line-icon">
                      <WhatsAppIcon size={18} color="#25D366" />
                    </div>
                    <div>
                      <div className="cc-whatsapp-line-number">{line.display}</div>
                      <div className="cc-whatsapp-line-desc">{line.label}</div>
                    </div>
                  </div>
                  <span className="cc-whatsapp-line-badge">{line.tag}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="cc-whatsapp-popover__footer">
            <a
              href={WHATSAPP_GROUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="cc-whatsapp-group-btn"
              onClick={() => setIsOpen(false)}
            >
              <Users size={14} />
              <span>Join Maker WhatsApp Group</span>
            </a>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div
        className="cc-whatsapp-floating"
        onClick={() => setIsOpen(!isOpen)}
        title="Direct Component Ordering & WhatsApp Helpline"
        role="button"
        tabIndex={0}
      >
        {!isOpen && (
          <div className="cc-whatsapp-bubble">
            <span className="cc-whatsapp-bubble__title">⚡ Buy Components</span>
            <span className="cc-whatsapp-bubble__sub">Direct WhatsApp</span>
          </div>
        )}
        <div className={`cc-whatsapp-btn ${isOpen ? 'cc-whatsapp-btn--active' : ''}`}>
          {isOpen ? (
            <X size={24} color="#FFFFFF" />
          ) : (
            <>
              <WhatsAppIcon size={26} className="cc-whatsapp-icon" color="#FFFFFF" />
              <span className="cc-whatsapp-ping" />
              <span className="cc-whatsapp-badge">3</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
