import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { getWhatsAppLink } from '../../utils/constants';
import { Truck, Headphones, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import './Hero.css';

export const Hero = () => {
  return (
    <section className="cc-hero">
      <div className="container cc-hero__container">
        {/* Left Content Column */}
        <div className="cc-hero__content">
          <div className="cc-hero__badge">
            <Sparkles size={14} className="cc-hero__badge-icon" />
            <span>IDEAS DESERVE HARDWARE • BUILT FOR STUDENT MAKERS</span>
          </div>

          <h1 className="cc-hero__title">
            Build Your Next{' '}
            <span className="gradient-text-blue">Project.</span>
          </h1>

          <p className="cc-hero__description">
            Everything you need to turn your college project idea into a working prototype — from IoT hardware and microcontrollers to hands-on guidance.
          </p>

          {/* Quick Value Props Strip */}
          <div className="cc-hero__features">
            <div className="cc-hero__feature-item">
              <div className="cc-hero__feature-icon">
                <Truck size={16} />
              </div>
              <div>
                <span className="cc-hero__feature-bold">Fast Delivery</span>
                <span className="cc-hero__feature-sub">to your college/hostel</span>
              </div>
            </div>

            <div className="cc-hero__feature-item">
              <div className="cc-hero__feature-icon">
                <Headphones size={16} />
              </div>
              <div>
                <span className="cc-hero__feature-bold">Project Guidance</span>
                <span className="cc-hero__feature-sub">by students, for students</span>
              </div>
            </div>

            <div className="cc-hero__feature-item">
              <div className="cc-hero__feature-icon">
                <ShieldCheck size={16} />
              </div>
              <div>
                <span className="cc-hero__feature-bold">Trusted & Affordable</span>
                <span className="cc-hero__feature-sub">genuine components only</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="cc-hero__actions">
            <Link to="/shop">
              <Button variant="glow" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
                Explore Products
              </Button>
            </Link>

            <a
              href={getWhatsAppLink('Hi upVolt! I have a doubt about selecting components for my project.')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="whatsapp"
                size="lg"
                icon={<WhatsAppIcon size={18} />}
                iconPosition="left"
              >
                Chat on WhatsApp
              </Button>
            </a>
          </div>

          <div className="cc-hero__handwritten-note">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cc-hero__arrow-curved">
              <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
              <path d="M12 3v13"/>
              <path d="m8 12 4 4 4-4"/>
            </svg>
            <span>Have a doubt? Just ask our makers!</span>
          </div>
        </div>

        {/* Right Visual Collage Column (Matching Reference Image) */}
        <div className="cc-hero__visual">
          <div className="cc-hero__glow-bg" />
          
          <div className="cc-hero__collage">
            {/* Annotation 1 */}
            <div className="cc-hero__annotation cc-hero__annotation--top-right">
              <span>Same Components,</span>
              <strong>Bigger Possibilities ⚡</strong>
            </div>

            {/* Hardware Cards Collage */}
            <div className="cc-hero__board-card cc-hero__board-card--uno">
              <img
                src="/images/realistic/arduino_uno.jpg"
                alt="Arduino Uno Board"
                className="cc-hero__board-img"
              />
              <div className="cc-hero__chip-tag">Arduino Uno R3</div>
            </div>

            <div className="cc-hero__board-card cc-hero__board-card--esp">
              <img
                src="/images/realistic/esp32.jpg"
                alt="ESP32 Wireless MCU"
                className="cc-hero__board-img"
              />
              <div className="cc-hero__chip-tag">ESP32 Dual Core</div>
            </div>

            {/* OLED Display badge */}
            <div className="cc-hero__oled-display">
              <div className="cc-hero__oled-screen">
                <span className="cc-hero__oled-text">Ideas</span>
                <span className="cc-hero__oled-text">Into</span>
                <span className="cc-hero__oled-accent">Reality</span>
              </div>
            </div>

            {/* Annotation 2 */}
            <div className="cc-hero__annotation cc-hero__annotation--bottom-right">
              <span>For Students</span>
              <strong>By Builders ♡</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
