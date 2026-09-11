import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Maximize2,
  X,
  Wrench
} from 'lucide-react';
import { fetchReels, DEFAULT_REELS } from '../../services/reelService';
import { WHATSAPP_NUMBER } from '../../utils/constants';
import './MakerReels.css';

export const MakerReels = () => {
  const [reels, setReels] = useState(DEFAULT_REELS);
  const [pausedMap, setPausedMap] = useState({});
  const [activeModalReel, setActiveModalReel] = useState(null);

  const getPosterUrl = (reel) => {
    if (reel.posterUrl) return reel.posterUrl;
    if (reel.videoUrl && reel.videoUrl.includes('res.cloudinary.com')) {
      return reel.videoUrl
        .replace(/\/video\/upload\/(?:[^/]+\/)?/, '/video/upload/so_0,f_auto,q_auto,w_400/')
        .replace(/\.[^.]+$/, '.jpg');
    }
    return '/images/realistic/arduino_uno.jpg';
  };

  const getOptimizedVideoUrl = (videoUrl) => {
    if (!videoUrl) return '';
    if (videoUrl.includes('res.cloudinary.com') && !videoUrl.includes('q_auto')) {
      return videoUrl.replace(
        '/video/upload/',
        '/video/upload/c_limit,w_360,q_auto:eco,vc_h264,br_350k/'
      );
    }
    return videoUrl;
  };

  useEffect(() => {
    let isMounted = true;
    fetchReels().then((res) => {
      if (isMounted && res && res.reels && res.reels.length > 0) {
        setReels(res.reels);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const videoRefs = useRef({});
  const carouselRef = useRef(null);

  // IntersectionObserver to only autoplay videos that are currently visible on screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector('video');
          const reelId = entry.target.getAttribute('data-reel-id');
          if (!video) return;

          if (entry.isIntersecting && !pausedMap[reelId]) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    const cards = document.querySelectorAll('.cc-reel-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [reels, pausedMap]);

  const togglePlay = (id, e) => {
    e.stopPropagation();
    const video = videoRefs.current[id];
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setPausedMap((prev) => ({ ...prev, [id]: false }));
    } else {
      video.pause();
      setPausedMap((prev) => ({ ...prev, [id]: true }));
    }
  };

  const scroll = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = 340;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Close modal on escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModalReel(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section className="cc-reels-section">
      <div className="container cc-reels-container">
        {/* Header Strip */}
        <div className="cc-reels-header">
          <div className="cc-reels-header__left">
            <div className="cc-reels-badge">
              <span className="cc-reels-badge__dot" />
              <Sparkles size={13} />
              <span>COMMUNITY IN ACTION • REAL BUILDERS</span>
            </div>
            <h2 className="cc-reels-title">
              Watch Makers <span className="gradient-text-blue">Build in Loop.</span>
            </h2>
            <p className="cc-reels-subtitle">
              Short, live build reels of students and makers soldering, assembling, and coding IoT hardware prototypes.
            </p>
          </div>

          <div className="cc-reels-header__controls">
            <button
              type="button"
              className="cc-reels-nav-btn"
              onClick={() => scroll('left')}
              aria-label="Previous Reels"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="cc-reels-nav-btn"
              onClick={() => scroll('right')}
              aria-label="Next Reels"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Horizontal Reels Carousel */}
        <div className="cc-reels-carousel" ref={carouselRef}>
          {reels.map((reel) => {
            const reelId = reel.id || reel._id;
            const isManuallyPaused = pausedMap[reelId];
            const posterUrl = getPosterUrl(reel);
            const optimizedUrl = getOptimizedVideoUrl(reel.videoUrl);

            return (
              <div
                key={reelId}
                data-reel-id={reelId}
                className="cc-reel-card"
                onClick={() => setActiveModalReel(reel)}
                title="Click to view full build details"
              >
                {/* Video / Poster Wrap */}
                <div className="cc-reel-card__video-wrap">
                  <video
                    ref={(el) => (videoRefs.current[reelId] = el)}
                    src={optimizedUrl}
                    poster={posterUrl}
                    className="cc-reel-card__video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />

                  {/* Dark gradient overlay for typography readability */}
                  <div className="cc-reel-card__overlay-top" />
                  <div className="cc-reel-card__overlay-bottom" />

                  {/* Top Bar: Controls (Expand) */}
                  <div className="cc-reel-card__top-bar">
                    <button
                      type="button"
                      className="cc-reel-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalReel(reel);
                      }}
                      title="Expand reel"
                      aria-label="Expand reel"
                    >
                      <Maximize2 size={14} />
                    </button>
                  </div>

                  {/* Center Play/Pause Overlay Indicator on Hover or when manually paused */}
                  <button
                    type="button"
                    className={`cc-reel-play-btn ${isManuallyPaused ? 'cc-reel-play-btn--paused' : ''}`}
                    onClick={(e) => togglePlay(reelId, e)}
                    aria-label={isManuallyPaused ? "Play video" : "Pause video"}
                  >
                    {isManuallyPaused ? <Play size={20} /> : <Pause size={20} />}
                  </button>

                  {/* Bottom Content Area */}
                  <div className="cc-reel-card__info">
                    {/* Reel Title */}
                    <h3 className="cc-reel-card__title">{reel.title}</h3>

                    {/* Components Pills */}
                    <div className="cc-reel-components">
                      <span className="cc-reel-comp-label">
                        <Wrench size={11} /> Kit:
                      </span>
                      {reel.components.slice(0, 2).map((comp, i) => (
                        <span key={i} className="cc-reel-comp-pill">{comp}</span>
                      ))}
                      {reel.components.length > 2 && (
                        <span className="cc-reel-comp-pill cc-reel-comp-pill--more">
                          +{reel.components.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Quick Action Button */}
                    <Link
                      to="/shop"
                      className="cc-reel-cta-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ShoppingCart size={14} />
                      <span>Get Project Components</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Reel Modal */}
      {activeModalReel && (
        <div className="cc-reel-modal-backdrop" onClick={() => setActiveModalReel(null)}>
          <div className="cc-reel-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="cc-reel-modal__close"
              onClick={() => setActiveModalReel(null)}
              aria-label="Close Reel Modal"
            >
              <X size={20} />
            </button>

            <div className="cc-reel-modal__grid">
              {/* Left Video Player */}
              <div className="cc-reel-modal__player-wrap">
                <video
                  src={activeModalReel.videoUrl}
                  poster={getPosterUrl(activeModalReel)}
                  className="cc-reel-modal__video"
                  autoPlay
                  loop
                  muted
                  controls
                  playsInline
                />
              </div>

              {/* Right Project Details */}
              <div className="cc-reel-modal__details">
                <div className="cc-reel-modal__badge">
                  <Sparkles size={14} />
                  <span>PROJECT BUILD REEL</span>
                </div>

                <h3 className="cc-reel-modal__title">{activeModalReel.title}</h3>

                <p className="cc-reel-modal__desc">{activeModalReel.description}</p>

                <div className="cc-reel-modal__components-block">
                  <h4>Components Used in This Project:</h4>
                  <div className="cc-reel-modal__comp-list">
                    {activeModalReel.components.map((comp, idx) => (
                      <div key={idx} className="cc-reel-modal__comp-card">
                        <Wrench size={14} className="cc-reel-modal__comp-icon" />
                        <span>{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cc-reel-modal__actions">
                  <Link
                    to="/shop"
                    className="cc-btn cc-btn--glow cc-reel-modal__shop-btn"
                    onClick={() => setActiveModalReel(null)}
                  >
                    <ShoppingCart size={16} />
                    <span>Browse Components in Shop</span>
                  </Link>

                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi upVolt! I watched the reel on "${activeModalReel.title}" and want guidance/components for this project.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cc-btn cc-btn--whatsapp"
                  >
                    <span>Ask Guidance on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MakerReels;
