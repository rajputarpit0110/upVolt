import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { InstagramIcon } from '../components/common/SocialIcons';
import { getWhatsAppLink, WHATSAPP_DISPLAY, WHATSAPP_GROUP_LINK, PRIORITY_BUYING_NUMBERS, OFFICIAL_EMAIL, OFFICIAL_INSTAGRAM } from '../utils/constants';
import { Mail, MapPin, Send, CheckCircle2, Users, AlertCircle, Loader2 } from 'lucide-react';
import { submitContactMessage } from '../services/messageService';

export const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await submitContactMessage(formData);
      setSent(true);
      setTimeout(() => setSent(false), 6000);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again or reach out on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cc-page cc-contact-page" style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 1040 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            GET IN TOUCH
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: 8, marginBottom: 12 }}>
            We're Here to Help You Build.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 600, margin: '0 auto' }}>
            Whether you need urgent components for tomorrow's lab viva or technical debugging assistance, our team is active.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          {/* Quick Direct Support Box */}
          <div className="glass-panel" style={{ padding: 36, borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Fastest Support: WhatsApp</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Connect directly with our founder &amp; technical query team in real-time. We respond quickly during working &amp; evening lab hours.
              </p>
            </div>

            {/* Priority Direct Component Buying & WhatsApp Lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>⚡ Priority Direct Buying Lines:</span>
                <span style={{ color: 'var(--color-whatsapp)', fontSize: '0.72rem', fontWeight: 600 }}>1-Click WhatsApp</span>
              </div>

              {PRIORITY_BUYING_NUMBERS.map((line, idx) => (
                <a
                  key={idx}
                  href={getWhatsAppLink(`Hi upVolt! I want to inquire/buy components directly through ${line.display}. Please assist me with stock and pricing.`, line.raw)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    background: idx === 0 ? 'var(--color-whatsapp-bg)' : 'var(--bg-surface)',
                    border: idx === 0 ? '1px solid rgba(37, 211, 102, 0.45)' : '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title={`Chat with ${line.display} - ${line.label}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <WhatsAppIcon size={22} color="#25D366" />
                    <div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {line.display}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: idx === 0 ? 'var(--color-whatsapp)' : 'var(--text-muted)', fontWeight: 600 }}>
                        {line.label}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: idx === 0 ? '#10B981' : 'var(--text-secondary)',
                    background: idx === 0 ? 'rgba(16, 185, 129, 0.14)' : 'var(--bg-main)',
                    padding: '3px 8px',
                    borderRadius: 12,
                    border: idx === 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                    whiteSpace: 'nowrap'
                  }}>
                    {line.tag}
                  </span>
                </a>
              ))}
            </div>

            {/* Join WhatsApp Group Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.12), rgba(0, 210, 255, 0.08))',
                border: '1px solid rgba(37, 211, 102, 0.35)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(37, 211, 102, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-whatsapp)',
                  flexShrink: 0
                }}>
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                    Join Our WhatsApp Group
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Delhi student makers, project doubts &amp; component drops
                  </div>
                </div>
              </div>
              <a
                href={WHATSAPP_GROUP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'var(--color-whatsapp)',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 10px rgba(37, 211, 102, 0.3)'
                }}
              >
                <WhatsAppIcon size={18} />
                <span>Join WhatsApp Group ➔</span>
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
              <a
                href={`mailto:${OFFICIAL_EMAIL}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: 'var(--text-secondary)',
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)'
                }}
                title={`Email us at ${OFFICIAL_EMAIL}`}
              >
                <Mail size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                <span>{OFFICIAL_EMAIL}</span>
              </a>

              <a
                href={OFFICIAL_INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: 'var(--text-secondary)',
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)'
                }}
                title="Follow upVolt on Instagram"
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#E1306C',
                  flexShrink: 0
                }}>
                  <InstagramIcon size={18} />
                </span>
                <span>@upvolt_in (Instagram)</span>
              </a>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                <MapPin size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                <span>Delhi • Serving colleges &amp; hostels</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-panel" style={{ padding: 36, borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 16 }}>Send Us a Message</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="text"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
              />
              <input
                type="text"
                placeholder="Subject / Project Inquiry"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
              />
              <textarea
                rows="4"
                placeholder="Describe your question or component requirement..."
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                icon={submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                iconPosition="right"
              >
                {submitting ? 'Sending Message...' : 'Send Message'}
              </Button>
            </form>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.25)', marginTop: 14, fontSize: '0.88rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {sent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22C55E', background: 'rgba(34, 197, 94, 0.1)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34, 197, 94, 0.25)', marginTop: 14, fontSize: '0.9rem', fontWeight: 600 }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>Message received! We'll review your inquiry and get back to you shortly.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
