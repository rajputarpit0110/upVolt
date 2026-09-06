import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../data/mockProducts';
import { fetchProductById, fetchProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { ProductCard } from '../components/product/ProductCard';
import { getProductWhatsAppLink, PRIORITY_BUYING_NUMBERS } from '../utils/constants';
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Check,
  Sparkles,
  ArrowLeft,
  FileText,
  ExternalLink,
  Copy,
  BookOpen,
  Cpu,
  Layers,
  AlertTriangle,
  Download,
  Code2,
  Compass,
  Wrench,
  CheckCircle2,
  ZoomIn,
  Maximize2,
  X
} from 'lucide-react';
import './ProductDetail.css';

const YouTubeIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={{ flexShrink: 0 }}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}?rel=0&modestbranding=1`
    : null;
};

export const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [allProducts, setAllProducts] = useState(PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('how-to-use');
  const [copiedCode, setCopiedCode] = useState(false);

  // Amazon-style Image Zoom & Lightbox State
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomPos({ x: 50, y: 50 });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    // Fetch product from database
    fetchProductById(id)
      .then(item => {
        if (item) {
          setProduct(item);
          setActiveImage(item.images?.[0] || item.image);
        }
      })
      .finally(() => setLoading(false));

    // Fetch all products for dynamic related products
    fetchProducts().then(({ products: liveItems }) => {
      if (liveItems && liveItems.length > 0) {
        setAllProducts(liveItems);
      }
    });
  }, [id]);

  if (loading) {
    return (
      <div className="cc-page cc-detail-loading">
        <div className="cc-btn__spinner" style={{ width: 40, height: 40 }} />
        <p>Loading component details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="cc-page cc-detail-notfound">
        <h2>Component Not Found</h2>
        <p>The product you are looking for might have been moved or updated.</p>
        <Link to="/shop">
          <Button variant="primary">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id || product.id);
  const relatedProducts = allProducts.filter(
    p => p.category === product.category && (p._id !== product._id && p.id !== product.id)
  ).slice(0, 4);

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="cc-page cc-detail-page">
      <div className="container">
        {/* Breadcrumb navigation */}
        <div className="cc-detail-breadcrumb">
          <Link to="/shop" className="cc-detail-back">
            <ArrowLeft size={16} />
            <span>Back to Shop</span>
          </Link>
          <span className="cc-breadcrumb-sep">/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
          <span className="cc-breadcrumb-sep">/</span>
          <span className="cc-breadcrumb-current">{product.name}</span>
        </div>

        {/* Main Product Showcase Card */}
        <div className="cc-detail-card glass-panel">
          {/* Left Column: Image Gallery */}
          <div className="cc-detail-visual">
            <div
              className={`cc-detail-image-box ${isZoomed ? 'cc-detail-image-box--zoomed' : ''}`}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => setIsLightboxOpen(true)}
              title="Click for full-screen preview"
            >
              <img
                src={activeImage || product.image}
                alt={product.name}
                className="cc-detail-main-img"
                style={{
                  transformOrigin: isZoomed ? `${zoomPos.x}% ${zoomPos.y}%` : 'center center',
                  transform: isZoomed ? 'scale(2.35)' : 'scale(1)'
                }}
              />
              {product.badge && (
                <div className={`cc-detail-badge-pos ${isZoomed ? 'cc-detail-badge--hidden' : ''}`}>
                  <Badge variant={product.badge.toLowerCase()}>{product.badge}</Badge>
                </div>
              )}

              {/* Amazon-style Zoom Prompt Hint */}
              <div className={`cc-zoom-hint ${isZoomed ? 'cc-zoom-hint--hidden' : ''}`}>
                <ZoomIn size={14} className="cc-zoom-hint-icon" />
                <span>Roll over image to zoom in</span>
              </div>

              {/* Quick Full-Screen Trigger */}
              <button
                type="button"
                className={`cc-zoom-expand-btn ${isZoomed ? 'cc-zoom-expand-btn--hidden' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                title="View full screen"
                aria-label="Open full screen lightbox"
              >
                <Maximize2 size={15} />
              </button>
            </div>

            {/* Multiple Images Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="cc-detail-thumbnails">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`cc-detail-thumb ${activeImage === imgUrl ? 'cc-detail-thumb--active' : ''}`}
                    onClick={() => setActiveImage(imgUrl)}
                    title={`View image ${idx + 1}`}
                  >
                    <img src={imgUrl} alt={`${product.name} thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Info & Action */}
          <div className="cc-detail-info">
            <div className="cc-detail-header-row">
              <span className="cc-detail-category-tag">{product.category}</span>
              <button
                type="button"
                className={`cc-detail-wishlist-btn ${isWishlisted ? 'cc-detail-wishlist-btn--active' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label="Wishlist"
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            <h1 className="cc-detail-title">{product.name}</h1>

            {/* Rating */}
            <div className="cc-detail-rating">
              <div className="cc-detail-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="cc-star-icon" fill="currentColor" />
                ))}
              </div>
              <span className="cc-detail-rating-score">{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
              <span className="cc-detail-rating-count">({product.reviewsCount ?? product.numReviews ?? 0} student reviews)</span>
            </div>

            {/* Pricing */}
            <div className="cc-detail-price-box">
              <div className="cc-detail-price-main">₹{product.price}</div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="cc-detail-price-original">₹{product.originalPrice}</div>
              )}
              {discountPercent && (
                <div className="cc-detail-price-discount">{discountPercent}% OFF</div>
              )}
            </div>

            {/* Stock status */}
            <div className="cc-detail-stock">
              <span className="cc-stock-dot" />
              <span className="cc-stock-text">In Stock & Ready to Dispatch to Campus</span>
            </div>

            {/* Description excerpt */}
            <p className="cc-detail-desc">{product.description}</p>

            {/* Perfect For Tags */}
            {product.perfectFor && product.perfectFor.length > 0 && (
              <div className="cc-detail-perfect-for">
                <span className="cc-perfect-label">Perfect for:</span>
                <div className="cc-perfect-tags">
                  {product.perfectFor.map((item, idx) => (
                    <span key={idx} className="cc-perfect-chip">
                      <Sparkles size={12} />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links for Guide, Research & Video */}
            <div className="cc-detail-quick-links">
              {product.youtubeUrl && (
                <button
                  type="button"
                  className="cc-quick-badge cc-quick-badge--yt"
                  onClick={() => {
                    setActiveTab('how-to-use');
                    document.getElementById('product-guides-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <YouTubeIcon size={14} />
                  <span>Video Tutorial</span>
                </button>
              )}
              {product.whereToUse && product.whereToUse.length > 0 && (
                <button
                  type="button"
                  className="cc-quick-badge cc-quick-badge--use"
                  onClick={() => {
                    setActiveTab('where-to-use');
                    document.getElementById('product-guides-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Compass size={14} />
                  <span>Where to Use ({product.whereToUse.length} Projects)</span>
                </button>
              )}
              {product.researchUrl && (
                <button
                  type="button"
                  className="cc-quick-badge cc-quick-badge--research"
                  onClick={() => {
                    setActiveTab('research-docs');
                    document.getElementById('product-guides-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <BookOpen size={14} />
                  <span>Research Paper</span>
                </button>
              )}
              {product.datasheetUrl && (
                <button
                  type="button"
                  className="cc-quick-badge cc-quick-badge--doc"
                  onClick={() => {
                    setActiveTab('research-docs');
                    document.getElementById('product-guides-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <FileText size={14} />
                  <span>Datasheet</span>
                </button>
              )}
            </div>

            {/* Quantity Stepper & Actions */}
            <div className="cc-detail-buy-section">
              <div className="cc-qty-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="cc-qty-btn"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="cc-qty-value">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="cc-qty-btn"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={() => addToCart(product, quantity)}
                icon={<ShoppingCart size={18} />}
                className="cc-detail-add-btn"
              >
                Add to Cart
              </Button>
            </div>

            {/* Direct WhatsApp Order CTA & Priority Buying Lines */}
            <div className="cc-detail-whatsapp-box">
              <a
                href={getProductWhatsAppLink(product, PRIORITY_BUYING_NUMBERS[0].raw)}
                target="_blank"
                rel="noopener noreferrer"
                className="cc-detail-whatsapp-btn"
              >
                <WhatsAppIcon size={20} />
                <span>Buy / Order Directly on WhatsApp</span>
              </a>
              <span className="cc-detail-whatsapp-sub">Instant confirmation • Cash on Delivery or UPI Available</span>

              {/* Priority Direct Buying Lines (Students can buy from any) */}
              <div style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: '1px solid rgba(37, 211, 102, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                width: '100%'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  <span>⚡ Priority Direct Buying Lines:</span>
                  <span style={{ color: 'var(--color-whatsapp)', fontSize: '0.72rem', fontWeight: 600 }}>Fast Response</span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 8
                }}>
                  {PRIORITY_BUYING_NUMBERS.map((line, idx) => (
                    <a
                      key={idx}
                      href={getProductWhatsAppLink(product, line.raw)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        padding: '8px 12px',
                        background: idx === 0 ? 'rgba(37, 211, 102, 0.14)' : 'var(--bg-surface)',
                        border: idx === 0 ? '1px solid rgba(37, 211, 102, 0.45)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease'
                      }}
                      title={`Buy ${product.name} directly via ${line.label}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <WhatsAppIcon size={16} color="#25D366" />
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {line.display}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: idx === 0 ? 'var(--color-whatsapp)' : 'var(--text-muted)', fontWeight: 600 }}>
                            {line.label}
                          </span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '99px',
                        background: idx === 0 ? 'var(--color-whatsapp)' : 'rgba(255, 255, 255, 0.08)',
                        color: idx === 0 ? '#fff' : 'var(--text-secondary)'
                      }}>
                        {idx === 0 ? 'Priority 1 (Founder)' : `Priority ${idx + 1}`}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="cc-detail-perks">
              <div className="cc-perk-item">
                <Truck size={18} className="cc-perk-icon" />
                <span>Delivered to college & hostels across Delhi</span>
              </div>
              <div className="cc-perk-item">
                <ShieldCheck size={18} className="cc-perk-icon" />
                <span>100% Tested & Genuine ICs</span>
              </div>
              <div className="cc-perk-item">
                <RotateCcw size={18} className="cc-perk-icon" />
                <span>Easy replacement if damaged</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Guides, How/Where to Use, Research & Specs */}
        <div className="cc-detail-tabs-section" id="product-guides-section">
          <div className="cc-detail-tab-headers">
            <button
              type="button"
              className={`cc-detail-tab-btn ${activeTab === 'how-to-use' ? 'cc-detail-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('how-to-use')}
            >
              <BookOpen size={16} />
              <span>How to Use & Video</span>
            </button>

            <button
              type="button"
              className={`cc-detail-tab-btn ${activeTab === 'where-to-use' ? 'cc-detail-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('where-to-use')}
            >
              <Compass size={16} />
              <span>Where to Use ({product.whereToUse?.length || 3} Projects)</span>
            </button>

            <button
              type="button"
              className={`cc-detail-tab-btn ${activeTab === 'research-docs' ? 'cc-detail-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('research-docs')}
            >
              <FileText size={16} />
              <span>Research & Datasheets</span>
            </button>

            <button
              type="button"
              className={`cc-detail-tab-btn ${activeTab === 'specs' ? 'cc-detail-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              <Cpu size={16} />
              <span>Technical Specs</span>
            </button>
          </div>

          <div className="cc-detail-tab-content glass-panel">
            {/* TAB 1: HOW TO USE */}
            {activeTab === 'how-to-use' && (
              <div className="cc-guide-tab-pane">
                {/* Embedded YouTube Video Tutorial */}
                {product.youtubeUrl && (
                  <div className="cc-yt-embed-card">
                    <div className="cc-yt-header">
                      <div className="cc-yt-header__title">
                        <YouTubeIcon size={22} className="cc-yt-icon" />
                        <div>
                          <h4>Video Tutorial: How to Wire, Code & Use {product.name}</h4>
                          <span className="cc-yt-subtitle">Hands-on step-by-step video demonstration</span>
                        </div>
                      </div>
                      <a
                        href={product.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cc-btn cc-btn--sm cc-yt-external-btn"
                      >
                        <ExternalLink size={14} />
                        <span>Watch on YouTube</span>
                      </a>
                    </div>

                    <div className="cc-yt-video-wrapper">
                      {getYouTubeEmbedUrl(product.youtubeUrl) ? (
                        <iframe
                          src={getYouTubeEmbedUrl(product.youtubeUrl)}
                          title={`Tutorial video for ${product.name}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="cc-yt-iframe"
                        />
                      ) : (
                        <div className="cc-yt-fallback">
                          <p>Click below to watch the video tutorial on YouTube:</p>
                          <a
                            href={product.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cc-btn cc-btn--primary"
                          >
                            <YouTubeIcon size={18} />
                            <span>Open Video Tutorial</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Overview callout */}
                {product.howToUse?.overview && (
                  <div className="cc-guide-overview-card">
                    <div className="cc-guide-overview-badge">
                      <Wrench size={15} />
                      <span>Hardware Overview & Setup</span>
                    </div>
                    <p className="cc-guide-overview-text">{product.howToUse.overview}</p>
                  </div>
                )}

                {/* Step-by-Step Instructions */}
                {product.howToUse?.steps && product.howToUse.steps.length > 0 && (
                  <div className="cc-guide-steps-section">
                    <h3 className="cc-guide-section-title">
                      <span>Step-by-Step Setup Guide</span>
                    </h3>
                    <div className="cc-steps-grid">
                      {product.howToUse.steps.map((step, idx) => (
                        <div key={idx} className="cc-step-card">
                          <div className="cc-step-badge">
                            <span>Step {idx + 1}</span>
                          </div>
                          <p className="cc-step-text">{step.replace(/^\d+\.\s*/, '')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pinout and Wiring Map */}
                {product.howToUse?.pinoutSummary && (
                  <div className="cc-pinout-card">
                    <div className="cc-pinout-header">
                      <Cpu size={18} />
                      <h4>Pinout & Wiring Map</h4>
                    </div>
                    <p className="cc-pinout-text">{product.howToUse.pinoutSummary}</p>
                  </div>
                )}

                {/* Sample Starter Code Snippet with Copy Button */}
                {product.howToUse?.sampleCode && (
                  <div className="cc-code-card">
                    <div className="cc-code-header">
                      <div className="cc-code-header__left">
                        <Code2 size={16} />
                        <span>Ready-to-Upload Starter Code</span>
                      </div>
                      <button
                        type="button"
                        className="cc-code-copy-btn"
                        onClick={() => handleCopyCode(product.howToUse.sampleCode)}
                        title="Copy code to clipboard"
                      >
                        {copiedCode ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <pre className="cc-code-pre">
                      <code>{product.howToUse.sampleCode}</code>
                    </pre>
                  </div>
                )}

                {/* Safety Precautions & Common Pitfalls */}
                {product.safetyPrecautions && product.safetyPrecautions.length > 0 && (
                  <div className="cc-precautions-card">
                    <div className="cc-precautions-header">
                      <AlertTriangle size={18} />
                      <h4>Hardware Safety & Dos & Don'ts:</h4>
                    </div>
                    <ul className="cc-precautions-list">
                      {product.safetyPrecautions.map((item, idx) => (
                        <li key={idx}>
                          <span className="cc-precaution-bullet" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: WHERE TO USE & PROJECTS */}
            {activeTab === 'where-to-use' && (
              <div className="cc-where-tab-pane">
                <div className="cc-tab-intro">
                  <div className="cc-tab-intro__badge">
                    <Compass size={15} />
                    <span>Real-World Implementation Guide</span>
                  </div>
                  <h3>Where and How to Use {product.name}</h3>
                  <p>Explore practical projects, lab experiments, and engineering domains where this component is deployed:</p>
                </div>

                {product.whereToUse && product.whereToUse.length > 0 ? (
                  <div className="cc-applications-grid">
                    {product.whereToUse.map((app, idx) => (
                      <div key={idx} className="cc-application-card">
                        <span className="cc-app-category">{app.category || 'Engineering Application'}</span>
                        <h4 className="cc-app-title">{app.title}</h4>
                        <p className="cc-app-desc">{app.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="cc-ideas-content">
                    <h3>Recommended Engineering Projects:</h3>
                    <ul className="cc-ideas-list">
                      <li><strong>Smart IoT Weather Station:</strong> Read temperature & humidity, post sensor metrics to ThingSpeak cloud via Wi-Fi.</li>
                      <li><strong>Hostel Room Access System:</strong> Combine with RFID RC522 to automatically unlock door upon scanning student ID card.</li>
                      <li><strong>Automated Irrigation / Plant Monitor:</strong> Trigger water pump whenever soil moisture drops below calibrated threshold.</li>
                    </ul>
                  </div>
                )}

                {/* Project Guidance CTA */}
                <div className="cc-ideas-cta-card">
                  <div className="cc-ideas-cta-left">
                    <Sparkles size={22} className="cc-ideas-cta-icon" />
                    <div>
                      <h4>Need Project Guidance, Custom Circuit Diagrams, or Code?</h4>
                      <p>Connect with upVolt mentor network for thesis & lab troubleshooting.</p>
                    </div>
                  </div>
                  <a
                    href={getProductWhatsAppLink(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cc-ideas-cta-btn"
                  >
                    <WhatsAppIcon size={18} />
                    <span>Ask Guidance on WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {/* TAB 3: RESEARCH & DATASHEETS */}
            {activeTab === 'research-docs' && (
              <div className="cc-research-tab-pane">
                <div className="cc-tab-intro">
                  <div className="cc-tab-intro__badge">
                    <FileText size={15} />
                    <span>Academic & Technical Reference</span>
                  </div>
                  <h3>Research Papers, Datasheets & Developer Docs</h3>
                  <p>Official manufacturer documentation, technical pin characteristics, and academic research publications:</p>
                </div>

                <div className="cc-docs-grid">
                  {/* Official Datasheet Card */}
                  <div className="cc-doc-card">
                    <div className="cc-doc-card__top">
                      <div className="cc-doc-icon-wrap cc-doc-icon-wrap--red">
                        <FileText size={24} />
                      </div>
                      <span className="cc-doc-tag">PDF Datasheet</span>
                    </div>
                    <h4 className="cc-doc-title">Official Manufacturer Datasheet</h4>
                    <p className="cc-doc-desc">
                      Electrical voltage ratings, pinout diagrams, absolute maximum current limits, and thermal tolerances directly from the IC manufacturer.
                    </p>
                    <a
                      href={product.datasheetUrl || `https://www.google.com/search?q=${encodeURIComponent(`${product.name} datasheet pdf`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cc-doc-action-btn"
                    >
                      <Download size={15} />
                      <span>Download Official Datasheet</span>
                    </a>
                  </div>

                  {/* Academic Research Publication Card */}
                  <div className="cc-doc-card">
                    <div className="cc-doc-card__top">
                      <div className="cc-doc-icon-wrap cc-doc-icon-wrap--blue">
                        <BookOpen size={24} />
                      </div>
                      <span className="cc-doc-tag">Research Citation</span>
                    </div>
                    <h4 className="cc-doc-title">Academic & IEEE Research Paper</h4>
                    <p className="cc-doc-desc">
                      Peer-reviewed research and applied engineering experiments detailing how this component is utilized in published international research.
                    </p>
                    <a
                      href={product.researchUrl || `https://scholar.google.com/scholar?q=${encodeURIComponent(`${product.name} IoT research paper`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cc-doc-action-btn"
                    >
                      <ExternalLink size={15} />
                      <span>View Research Publication</span>
                    </a>
                  </div>

                  {/* Developer Documentation & GitHub Repository */}
                  <div className="cc-doc-card">
                    <div className="cc-doc-card__top">
                      <div className="cc-doc-icon-wrap cc-doc-icon-wrap--purple">
                        <Code2 size={24} />
                      </div>
                      <span className="cc-doc-tag">Open Source Code</span>
                    </div>
                    <h4 className="cc-doc-title">Official Driver & GitHub Library</h4>
                    <p className="cc-doc-desc">
                      Verified Arduino/ESP-IDF/Python libraries, sample sketches, and firmware drivers to get up and running quickly.
                    </p>
                    <a
                      href={product.documentationUrl || `https://github.com/search?q=${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cc-doc-action-btn"
                    >
                      <ExternalLink size={15} />
                      <span>View Documentation & Code</span>
                    </a>
                  </div>
                </div>

                <div className="cc-academic-note">
                  <CheckCircle2 size={16} />
                  <span>Verified academic citations and official datasheets curated by upVolt engineering team.</span>
                </div>
              </div>
            )}

            {/* TAB 4: TECHNICAL SPECS */}
            {activeTab === 'specs' && (
              <div className="cc-specs-table-wrapper">
                {product.specifications ? (
                  <table className="cc-specs-table">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, val]) => (
                        <tr key={key}>
                          <td className="cc-specs-key">{key}</td>
                          <td className="cc-specs-val">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No specifications available.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="cc-detail-related">
            <h2 className="cc-section-title">Related in {product.category}</h2>
            <div className="cc-detail-related-grid">
              {relatedProducts.map((p, idx) => (
                <ProductCard key={p._id || p.id || p.sku || `rel-${idx}`} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Full-Screen High-Resolution View */}
      {isLightboxOpen && (
        <div className="cc-lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <div className="cc-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="cc-lightbox-close"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close Preview"
            >
              <X size={20} />
            </button>
            <div className="cc-lightbox-img-wrap">
              <img
                src={activeImage || product.image}
                alt={product.name}
                className="cc-lightbox-img"
              />
            </div>
            <div className="cc-lightbox-footer">
              <span className="cc-lightbox-title">{product.name}</span>
              {product.images && product.images.length > 1 && (
                <div className="cc-lightbox-thumbs">
                  {product.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`cc-lightbox-thumb ${activeImage === imgUrl ? 'cc-lightbox-thumb--active' : ''}`}
                      onClick={() => setActiveImage(imgUrl)}
                      title={`View image ${idx + 1}`}
                    >
                      <img src={imgUrl} alt="Thumbnail" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
