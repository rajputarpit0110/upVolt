import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { getWhatsAppLink } from '../../utils/constants';
import { Truck, Headphones, ShieldCheck, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './Hero.css';

const MOBILE_SLIDES = [
  {
    badge: 'COLLEGE PROJECTS',
    title: 'Smart IoT Kits & Boards',
    subtitle: 'From Arduino to ESP32 with guided circuit diagrams & tested code.',
    btnText: 'Shop IoT Kits',
    link: '/shop?category=IoT+Kits',
    image: '/images/hero_hardware_nano_light.webp',
    darkImage: '/images/hero_hardware_nano_dark.webp',
    accentColor: '#38BDF8'
  },
  {
    badge: 'FRESH ARRIVALS',
    title: 'Microcontrollers & Sensors',
    subtitle: 'Original modules tested for student engineering & robotics.',
    btnText: 'Explore Sensors',
    link: '/shop?category=Sensors',
    image: '/images/realistic/esp32.webp',
    darkImage: '/images/realistic/esp32.webp',
    accentColor: '#10B981'
  },
  {
    badge: 'FAST CAMPUS DELIVERY',
    title: 'Hostel & College Ready',
    subtitle: 'Super fast delivery to your college gate with student-first pricing.',
    btnText: 'Shop All Products',
    link: '/shop',
    image: '/images/realistic/arduino_uno.webp',
    darkImage: '/images/realistic/arduino_uno.webp',
    accentColor: '#F59E0B'
  }
];

export const Hero = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-advance mobile carousel banner smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % MOBILE_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = MOBILE_SLIDES[activeSlide];

  return (
    <section className="cc-hero">
      <div className="container cc-hero__container">
        {/* MOBILE LANDSCAPE HERO BANNER (Shown only on Mobile/Tablet like reference UI) */}
        <div className="cc-hero__mobile-banner-wrapper">
          <div className="cc-hero__mobile-banner">
            <div className="cc-hero__mobile-banner-content">
              <span className="cc-hero__mobile-pill">
                <Sparkles size={11} />
                {slide.badge}
              </span>
              <h2 className="cc-hero__mobile-title">
                {slide.title}
              </h2>
              <p className="cc-hero__mobile-desc">
                {slide.subtitle}
              </p>
              <Link to={slide.link} className="cc-hero__mobile-btn">
                <span>{slide.btnText}</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="cc-hero__mobile-banner-visual">
              <div className="cc-hero__mobile-arc-bg" />
              <img
                src={isDark ? slide.darkImage : slide.image}
                alt={slide.title}
                className="cc-hero__mobile-banner-img"
                loading="eager"
              />
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="cc-hero__mobile-dots">
            {MOBILE_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`cc-hero__mobile-dot ${i === activeSlide ? 'cc-hero__mobile-dot--active' : ''}`}
                onClick={() => setActiveSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Left Content Column (Shown on Desktop, hidden/minimized on mobile so the landscape banner leads straight to Categories) */}
        <div className="cc-hero__content hide-on-mobile-banner">
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

        {/* Right Visual Showcase Column with Seamless Blending (Desktop) */}
        <div className="cc-hero__visual hide-on-mobile-banner">
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

            {/* Unified Precision Vector Pointer Lines Overlay */}
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
