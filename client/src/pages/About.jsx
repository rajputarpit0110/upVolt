import React from 'react';
import { Button } from '../components/common/Button';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { getWhatsAppLink } from '../utils/constants';
import { Cpu, Users, Award, Target } from 'lucide-react';
import { MentorsSection } from '../components/home/MentorsSection';
import { FoundersSection } from '../components/about/FoundersSection';

export const About = () => {
  return (
    <div className="cc-page cc-about-page" style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center', marginBottom: 50 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ABOUT UPVOLT
          </span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginTop: 10, marginBottom: 16 }}>
            Empowering the Next Generation of <span className="gradient-text-blue">Builders & Makers</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            "Powering Ideas. Connecting Possibilities." We are a dedicated student technology platform founded to eliminate the friction in obtaining genuine hardware components, sensors, and practical guidance.
          </p>
        </div>

        {/* Mission / Vision Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
          <div className="glass-panel" style={{ padding: 36, borderRadius: 'var(--radius-xl)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: 10 }}>Our Mission</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              To ensure every engineering student and maker across Delhi has rapid access to affordable, tested IoT hardware and mentorship right at their college or hostel doorstep.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: 36, borderRadius: 'var(--radius-xl)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: 10 }}>Our Philosophy</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Learning happens by touching wires, burning occasional LEDs, and fixing bugs together. We don't just ship boxes; we support you from project concept to final exhibition demo.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: 36, borderRadius: 'var(--radius-xl)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: 10 }}>Student Community</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Joined by 5,000+ student makers from 100+ colleges across Delhi who share code, project schematics, and collaborate on hackathon innovations.
            </p>
          </div>
        </div>

        {/* Founders & Leadership Section */}
        <FoundersSection />

        {/* Mentors Section */}
        <MentorsSection />

        {/* CTA banner */}
        <div className="glass-panel" style={{ padding: '40px', borderRadius: 'var(--radius-xl)', textAlign: 'center', marginTop: 40 }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 12 }}>Ready to Build Your Next Big Idea?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 600, margin: '0 auto 24px' }}>
            Connect with our student mentors directly over WhatsApp for free component selection advice.
          </p>
          <a href={getWhatsAppLink('Hi upVolt team! I read about your mission and would love to collaborate/get project advice.')} target="_blank" rel="noopener noreferrer">
            <Button variant="whatsapp" size="lg" icon={<WhatsAppIcon size={18} />}>
              Connect with upVolt Mentors on WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};
