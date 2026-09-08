import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, Mail } from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { WHATSAPP_NUMBER, WHATSAPP_GROUP_LINK, PRIORITY_BUYING_NUMBERS, OFFICIAL_EMAIL, OFFICIAL_INSTAGRAM } from '../../utils/constants';
import './Footer.css';


export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="cc-footer">
      <div className="container cc-footer__container">
        {/* Top Grid */}
        <div className="cc-footer__grid">
          {/* Brand Column */}
          <div className="cc-footer__col cc-footer__col--brand">
            <Link to="/" className="cc-footer-brand">
              <img
                src="/images/upvolt-logo-dark.png"
                alt="upVolt - Powering Ideas. Connecting Possibilities."
                className="cc-footer-brand__logo-img cc-brand__logo-img--dark"
              />
              <img
                src="/images/upvolt-logo-light.png"
                alt="upVolt - Powering Ideas. Connecting Possibilities."
                className="cc-footer-brand__logo-img cc-brand__logo-img--light"
              />
            </Link>
            <p className="cc-footer__desc">
              upVolt empowers the next generation of engineers, makers, and innovators with genuine hardware, IoT components, and hands-on project guidance directly to college hostels and campuses.
            </p>
            <div className="cc-footer__badge">
              <span>🚀 Made for students, built for builders</span>
            </div>
          </div>

          {/* Column 1: Shop */}
          <div className="cc-footer__col">
            <h4 className="cc-footer__heading">Shop</h4>
            <ul className="cc-footer__links">
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/shop?category=Development+Boards">Development Boards</Link></li>
              <li><Link to="/shop?category=Sensors">Sensors & Modules</Link></li>
              <li><Link to="/shop?category=IoT+Kits">IoT Kits & Robotics</Link></li>
              <li><Link to="/shop?category=Motors+%26+Drivers">Motors & Drivers</Link></li>
              <li><Link to="/shop?category=Power+%26+Components">Power & Components</Link></li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="cc-footer__col">
            <h4 className="cc-footer__heading">Company</h4>
            <ul className="cc-footer__links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact & Guidance</Link></li>
              <li><Link to="/ambassadors">Campus Ambassadors</Link></li>
              <li><Link to="/learning-hub">Student Project Hub</Link></li>
              <li><Link to="/careers">Student Internships</Link></li>
            </ul>
          </div>

          {/* Column 3: Help & Direct Buying */}
          <div className="cc-footer__col">
            <h4 className="cc-footer__heading">Direct Buying &amp; Help</h4>
            <ul className="cc-footer__links">
              {PRIORITY_BUYING_NUMBERS.map((line, idx) => (
                <li key={idx}>
                  <a
                    href={`https://wa.me/${line.raw}?text=${encodeURIComponent(`Hi upVolt! I want to buy components directly via ${line.display}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    title={`Buy components via ${line.label}`}
                  >
                    <WhatsAppIcon size={14} color="#25D366" />
                    <span>{line.display} <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>({idx === 0 ? 'Founder' : `P${idx + 1}`})</span></span>
                  </a>
                </li>
              ))}
              <li>
                <a href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#25D366', fontWeight: 600 }}>
                  <WhatsAppIcon size={14} color="#25D366" />
                  <span>Join WhatsApp Group</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${OFFICIAL_EMAIL}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} title={`Email us at ${OFFICIAL_EMAIL}`}>
                  <Mail size={14} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.8rem' }}>{OFFICIAL_EMAIL}</span>
                </a>
              </li>
              <li><Link to="/shipping-policy">Shipping &amp; Delivery</Link></li>
              <li><Link to="/contact">Help &amp; FAQs</Link></li>
              <li><Link to="/terms">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div className="cc-footer__col cc-footer__col--newsletter">
            <h4 className="cc-footer__heading">Stay In The Loop</h4>
            <p className="cc-footer__newsletter-desc">
              Get updates on new IoT components, student discounts, and project guides.
            </p>
            <form onSubmit={handleSubscribe} className="cc-footer__newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="cc-footer__newsletter-input"
              />
              <button type="submit" className="cc-footer__newsletter-btn" aria-label="Subscribe">
                <Send size={16} />
              </button>
            </form>
            {subscribed && (
              <div className="cc-footer__subscribed-msg">
                <CheckCircle2 size={15} />
                <span>You're subscribed! Welcome to the maker circle.</span>
              </div>
            )}

            <div className="cc-footer__social">
              <span className="cc-footer__social-label">Connect:</span>
              <div className="cc-footer__social-icons">
                {/* Instagram */}
                <a href={OFFICIAL_INSTAGRAM} target="_blank" rel="noopener noreferrer" className="cc-social-link" title="Instagram (@upvolt_in)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="https://www.linkedin.com/company/upvolt-in/" target="_blank" rel="noopener noreferrer" className="cc-social-link" title="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect width="4" height="12" x="2" y="9"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                {/* WhatsApp */}
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="cc-social-link" title="WhatsApp Support">
                  <WhatsAppIcon size={18} />
                </a>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <a
                href={WHATSAPP_GROUP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 14px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(37, 211, 102, 0.12)',
                  border: '1px solid rgba(37, 211, 102, 0.4)',
                  color: '#25D366',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <WhatsAppIcon size={15} />
                <span>Join Our WhatsApp Group</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="cc-footer__bottom">
          <div className="cc-footer__copyright">
            © {new Date().getFullYear()} upVolt. All rights reserved. Built for students, by builders.
          </div>
          <div className="cc-footer__tagline-script">
            Powering Ideas. Connecting Possibilities. 🚀
          </div>
        </div>
      </div>
    </footer>
  );
};
