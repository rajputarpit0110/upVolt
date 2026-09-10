import React from 'react';
import { getWhatsAppLink, WHATSAPP_GROUP_LINK } from '../../utils/constants';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { MessageSquare, Wrench, Users, ArrowRight } from 'lucide-react';
import './GuidanceBanner.css';

export const GuidanceBanner = () => {
  return (
    <section className="cc-guidance-section">
      <div className="container cc-guidance-section__container">
        <div className="cc-guidance-card">
          {/* Left Workbench Photo Showcase */}
          <div className="cc-guidance-visual">
            <img
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
              alt="Student Maker Electronics Workbench"
              className="cc-guidance-img"
            />
            <div className="cc-guidance-notebook-tag">
              <span className="cc-guidance-notebook-line">• Plan</span>
              <span className="cc-guidance-notebook-line">• Build</span>
              <span className="cc-guidance-notebook-line">• Debug</span>
            </div>
          </div>

          {/* Right Content */}
          <div className="cc-guidance-content">
            <div className="cc-guidance-badge">
              <MessageSquare size={14} />
              <span>Project Mentorship &amp; Hardware Support</span>
            </div>

            <h2 className="cc-guidance-title">
              We Don't Just Sell Hardware.{' '}
              <span className="gradient-text-blue">We Help You Build With It.</span>
            </h2>

            <p className="cc-guidance-desc">
              Confused about which component to choose? Need help with your project? Want to know what else you need? Just ask us. Our team is here to guide you — before and after your purchase.
            </p>

            {/* Benefit Badges */}
            <div className="cc-guidance-pills">
              <div className="cc-guidance-pill">
                <MessageSquare size={16} className="cc-guidance-pill__icon" />
                <span>Expert Guidance</span>
              </div>
              <div className="cc-guidance-pill">
                <Wrench size={16} className="cc-guidance-pill__icon" />
                <span>Project Support</span>
              </div>
              <div className="cc-guidance-pill">
                <Users size={16} className="cc-guidance-pill__icon" />
                <span>Community Driven</span>
              </div>
            </div>

            {/* WhatsApp Consultation & Community Buttons */}
            <div className="cc-guidance-action-group">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <a
                  href={getWhatsAppLink('Hi upVolt! I need guidance from a project expert regarding my college project idea.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cc-guidance-btn"
                >
                  <div className="cc-guidance-btn__icon">
                    <WhatsAppIcon size={18} />
                  </div>
                  <span className="cc-guidance-btn__text">Talk to a Project Expert</span>
                  <ArrowRight size={16} />
                </a>

                <a
                  href={WHATSAPP_GROUP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cc-guidance-btn"
                  style={{
                    background: 'rgba(37, 211, 102, 0.12)',
                    border: '1px solid rgba(37, 211, 102, 0.45)',
                    color: 'var(--color-whatsapp)',
                    boxShadow: '0 4px 16px rgba(37, 211, 102, 0.15)'
                  }}
                >
                  <div className="cc-guidance-btn__icon">
                    <WhatsAppIcon size={18} />
                  </div>
                  <span className="cc-guidance-btn__text">Join WhatsApp Group</span>
                  <ArrowRight size={16} />
                </a>
              </div>

              <div className="cc-guidance-script">
                From your idea to your prototype — we're here.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
