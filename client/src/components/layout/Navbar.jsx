import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import { PRODUCTS } from '../../data/mockProducts';
import { fetchProducts } from '../../services/productService';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Star
} from 'lucide-react';
import './Navbar.css';


// Helper to highlight matching text inside product title
const highlightMatch = (text, query) => {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="cc-search-highlight">{part}</mark>
    ) : (
      part
    )
  );
};

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [allProducts, setAllProducts] = useState(PRODUCTS);

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // Sync with live products from MongoDB / backend
  useEffect(() => {
    fetchProducts().then(({ products: liveProducts }) => {
      if (liveProducts && liveProducts.length > 0) {
        setAllProducts(liveProducts);
      }
    }).catch(() => {});
  }, []);

  // Sync search input if URL changes (e.g. navigation)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (location.pathname === '/shop' && q !== null) {
      setSearchQuery(q);
    }
  }, [location]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target)
      ) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Escape to close dropdown
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Instant real-time filtering on every alphabet typed
  const matchingProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return allProducts
      .filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const catMatch = p.category?.toLowerCase().includes(q);
        const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(q));
        const skuMatch = p.sku?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        return nameMatch || catMatch || tagMatch || skuMatch || descMatch;
      })
      .sort((a, b) => {
        const aName = a.name?.toLowerCase() || '';
        const bName = b.name?.toLowerCase() || '';
        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });
  }, [searchQuery, allProducts]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setSearchDropdownOpen(val.trim().length > 0);

    // If currently on Shop page, update live grid immediately as you type
    if (location.pathname === '/shop') {
      const sp = new URLSearchParams(location.search);
      if (val.trim()) {
        sp.set('search', val.trim());
      } else {
        sp.delete('search');
      }
      navigate(`/shop?${sp.toString()}`, { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setSearchDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectProduct = (product) => {
    const id = product._id || product.id || product.sku;
    setSearchDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(`/product/${id}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchDropdownOpen(false);
    if (location.pathname === '/shop') {
      const sp = new URLSearchParams(location.search);
      sp.delete('search');
      navigate(`/shop?${sp.toString()}`, { replace: true });
    }
  };

  const handleChipClick = (term) => {
    handleSearchChange(term);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Categories', path: '/categories' },
    { label: 'IoT Kits', path: '/shop?category=IoT+Kits' },
    { label: 'About', path: '/about' },
    { label: 'Support', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname + location.search === path) return true;
    if (path.startsWith('/shop') && location.pathname === '/shop' && !path.includes('?')) return true;
    return false;
  };

  // Reusable live search suggestions dropdown
  const renderSearchDropdown = () => {
    if (!searchDropdownOpen || !searchQuery.trim()) return null;

    const topMatches = matchingProducts.slice(0, 6);

    return (
      <div className="cc-search-dropdown" role="listbox">
        <div className="cc-search-dropdown-header">
          <span>Matching Components ({matchingProducts.length})</span>
          <span className="cc-search-live-badge">
            <span className="cc-search-live-dot" />
            Live Search
          </span>
        </div>

        {matchingProducts.length > 0 ? (
          <>
            <ul className="cc-search-dropdown-list">
              {topMatches.map((product, idx) => {
                const discount =
                  product.originalPrice && product.originalPrice > product.price
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : null;

                return (
                  <li
                    key={product._id || product.id || product.sku || `search-res-${idx}`}
                    className="cc-search-item"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="cc-search-item-left">
                      <div className="cc-search-item-img-box">
                        <img
                          src={product.image || '/logo-circuit.svg'}
                          alt={product.name}
                          className="cc-search-item-img"
                          loading="lazy"
                        />
                      </div>
                      <div className="cc-search-item-info">
                        <div className="cc-search-item-title">
                          {highlightMatch(product.name, searchQuery.trim())}
                        </div>
                        <div className="cc-search-item-meta">
                          <span className="cc-search-item-cat">{product.category}</span>
                          <span className="cc-search-item-rating">
                            <Star size={11} fill="currentColor" />
                            {product.rating || 4.7}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="cc-search-item-right">
                      <span className="cc-search-item-price">₹{product.price}</span>
                      {discount && (
                        <span className="cc-search-item-discount">{discount}% OFF</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="cc-search-dropdown-footer">
              <button
                type="button"
                className="cc-search-view-all-btn"
                onClick={handleSearchSubmit}
              >
                <span>View all {matchingProducts.length} results in Catalog</span>
                <ArrowRight size={14} />
              </button>
              <span className="cc-search-esc-hint">ESC to close</span>
            </div>
          </>
        ) : (
          <div className="cc-search-empty-box">
            <Search size={22} className="cc-search-empty-icon" />
            <div className="cc-search-empty-text">
              No components matching "<strong>{searchQuery}</strong>"
            </div>
            <div className="cc-search-chips-title">Popular searches:</div>
            <div className="cc-search-chips">
              {['ESP32', 'Arduino', 'Ultrasonic', 'Relay', 'Robotics'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="cc-search-chip"
                  onClick={() => handleChipClick(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="cc-navbar-header glass-panel">
      <div className="container cc-navbar__container">
        {/* Brand Logo */}
        <Link to="/" className="cc-brand" onClick={() => setMobileMenuOpen(false)}>
          <img
            src="/images/upvolt-logo-dark.png"
            alt="upVolt - Powering Ideas. Connecting Possibilities."
            className="cc-brand__logo-img cc-brand__logo-img--dark"
          />
          <img
            src="/images/upvolt-logo-light.png"
            alt="upVolt - Powering Ideas. Connecting Possibilities."
            className="cc-brand__logo-img cc-brand__logo-img--light"
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="cc-nav-links hide-tablet">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`cc-nav-link ${isActive(item.path) ? 'cc-nav-link--active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Integrated Search Bar with Live Real-time Suggestions */}
        <div ref={desktopSearchRef} className="cc-search-form hide-mobile">
          <form onSubmit={handleSearchSubmit} role="search">
            <div className="cc-search-box">
              <Search size={16} className="cc-search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) setSearchDropdownOpen(true);
                }}
                className="cc-search-input"
                autoComplete="off"
                aria-label="Search components"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="cc-search-clear-btn"
                  onClick={handleClearSearch}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </form>
          {renderSearchDropdown()}
        </div>

        {/* Right Actions */}
        <div className="cc-navbar__actions">
          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="cc-action-icon cc-action-icon--wishlist hide-mobile"
            title="Your Wishlist"
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="cc-action-badge">{wishlistCount}</span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="cc-action-icon cc-action-icon--cart"
            title="Your Shopping Cart"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            <span className="cc-action-badge cc-action-badge--cart">{cartCount}</span>
          </Link>

          {/* Admin Portal Link */}
          {isAdmin && (
            <Link
              to="/admin"
              className="cc-admin-nav-btn"
              title="Open Admin Portal"
            >
              <ShieldCheck size={15} />
              <span className="hide-mobile">Admin</span>
            </Link>
          )}

          {/* User Account */}
          <Link
            to={user ? "/profile" : "/login"}
            className="cc-action-icon cc-action-icon--user"
            title={user ? `Profile (${user.name})` : "Student Login"}
            aria-label="Account"
          >
            {user ? (
              <div className="cc-avatar-circle">{user.name?.charAt(0) || 'U'}</div>
            ) : (
              <User size={20} />
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="cc-mobile-toggle show-tablet"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="cc-mobile-drawer glass-panel show-tablet">
          {/* Mobile Search with Live Suggestions */}
          <div ref={mobileSearchRef} className="cc-mobile-search">
            <form onSubmit={handleSearchSubmit} role="search">
              <div className="cc-search-box">
                <Search size={16} className="cc-search-icon" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim()) setSearchDropdownOpen(true);
                  }}
                  className="cc-search-input"
                  autoComplete="off"
                  aria-label="Search components"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="cc-search-clear-btn"
                    onClick={handleClearSearch}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>
            {renderSearchDropdown()}
          </div>

          <nav className="cc-mobile-nav">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`cc-mobile-nav-link ${isActive(item.path) ? 'cc-mobile-nav-link--active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/wishlist"
              className="cc-mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Wishlist ({wishlistCount})
            </Link>
            <Link
              to={user ? "/profile" : "/login"}
              className="cc-mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {user ? `Account (${user.name})` : "Student Login / Register"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
