import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { getWhatsAppLink } from '../../utils/constants';
import { Truck, Headphones, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './Hero.css';

export const Hero = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
              href={getWhatsAppLink('Hi UPVOLT! I have a doubt about selecting components for my project.')}
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
            <span>Have a doubt? Just ask our makers!</span>
          </div>
        </div>

        {/* Right Visual Showcase Column with Seamless Blending */}
        <div className="cc-hero__visual">
          <div className="cc-hero__glow-bg" />
          
          <div className="cc-hero__showcase">
            {/* Main Seamless Blended Image (Light & Dark theme aware) */}
            <div className="cc-hero__image-blend-wrap">
              <picture>
                <source
                  srcSet={isDark ? '/images/hero_hardware_nano_dark.webp' : '/images/hero_hardware_nano_light.webp'}
                  type="image/webp"
                />
                <img
                  src={isDark ? '/images/hero_hardware_nano_dark.webp' : '/images/hero_hardware_nano_light.webp'}
                  alt="Arduino Uno R3 Development Board, Arduino Nano, and ESP32 Microcontrollers for Robotics and IoT Projects"
                  className="cc-hero__blend-image"
                  width="600"
                  height="450"
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </div>

            {/* Unified Precision Vector Pointer Lines Overlay (2-part L-shaped elbow lines with single bend) */}
            <svg
              className="cc-hero__pointers-svg"
              viewBox="0 0 1000 750"
              preserveAspectRatio="xMidYMid meet"
              fill="none"
              aria-hidden="true"
            >
              {/* Uno Pointer: Tag (Top Right) -> Horizontal Left -> 90° Elbow Bend -> Vertical Down to Uno Board */}
              <g className="cc-hero__pointer-group cc-hero__pointer-group--uno">
                <path d="M 625 75 H 510 V 470" className="cc-hero__pointer-path" />
                <circle cx="510" cy="470" r="10" className="cc-hero__pointer-halo" />
                <circle cx="510" cy="470" r="5" className="cc-hero__pointer-dot" />
              </g>

              {/* Nano Pointer: Tag (Left) -> Horizontal Right -> 90° Elbow Bend -> Vertical Down to Nano Board */}
              <g className="cc-hero__pointer-group cc-hero__pointer-group--nano">
                <path d="M 165 232 H 250 V 415" className="cc-hero__pointer-path" />
                <circle cx="250" cy="415" r="10" className="cc-hero__pointer-halo" />
                <circle cx="250" cy="415" r="5" className="cc-hero__pointer-dot" />
              </g>

              {/* ESP32 Pointer: Tag (Right) -> Horizontal Left -> 90° Elbow Bend -> Vertical Down to ESP32 Board */}
              <g className="cc-hero__pointer-group cc-hero__pointer-group--esp">
                <path d="M 805 172 H 745 V 540" className="cc-hero__pointer-path" />
                <circle cx="745" cy="540" r="10" className="cc-hero__pointer-halo" />
                <circle cx="745" cy="540" r="5" className="cc-hero__pointer-dot" />
              </g>
            </svg>

            {/* Hardware Chip Tag 1: Arduino Uno R3 (Top Center) */}
            <div className="cc-hero__chip-tag cc-hero__chip-tag--uno">
              <span className="cc-hero__pulse-dot" />
              Arduino Uno R3
            </div>

            {/* Hardware Chip Tag 2: Arduino Nano (Left Podium) */}
            <div className="cc-hero__chip-tag cc-hero__chip-tag--nano">
              <span className="cc-hero__pulse-dot" />
              Arduino Nano
            </div>

            {/* Hardware Chip Tag 3: ESP32 Dual Core (Right Podium) */}
            <div className="cc-hero__chip-tag cc-hero__chip-tag--esp">
              <span className="cc-hero__pulse-dot" />
              ESP32 Dual Core
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
