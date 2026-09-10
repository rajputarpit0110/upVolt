import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/product/ProductCard';
import { AddProductModal } from '../components/product/AddProductModal';
import { PRODUCTS, CATEGORIES } from '../data/mockProducts';
import { fetchProducts } from '../services/productService';
import { fetchCategories } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { PRIORITY_BUYING_NUMBERS } from '../utils/constants';
import { Filter, Search, SlidersHorizontal, X, Plus, Database, RefreshCw, Zap } from 'lucide-react';
import './Shop.css';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [sortBy, setSortBy] = useState('featured');
  const [priceMax, setPriceMax] = useState(3000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearchQuery(searchParam);
  }, [categoryParam, searchParam]);

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      if (res && res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.warn('Failed to load live categories in Shop:', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { products: fetched, source } = await fetchProducts();
      if (fetched && fetched.length > 0) {
        setProducts(fetched);
        setDataSource(source);
      }
    } catch (err) {
      console.warn('Failed to load products from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const handleProductAdded = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }
        // Price filter
        if (p.price > priceMax) {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchTag = p.tags?.some(t => t.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchCat && !matchTag) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // featured
      });
  }, [products, selectedCategory, searchQuery, priceMax, sortBy]);

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    if (catName === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catName);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="cc-page cc-shop-page">
      <div className="container">
        {/* Shop Header */}
        <div className="cc-shop-header">
          <div>
            <h1 className="cc-shop-title" style={{ marginBottom: 6 }}>Component Catalog</h1>
            <p className="cc-shop-subtitle">
              Browse microcontrollers, robotics parts, sensors and kits for your engineering projects.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isAdmin && (
              <button
                type="button"
                className="cc-btn cc-btn--primary"
                onClick={() => setIsAddModalOpen(true)}
                style={{ padding: '10px 18px', fontSize: '0.9rem' }}
              >
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            )}

            <button
              type="button"
              className="cc-shop-filter-toggle show-tablet"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Direct WhatsApp Ordering Bar for Buyers */}
        <div style={{
          marginBottom: 24,
          padding: '12px 18px',
          background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1), rgba(0, 210, 255, 0.05))',
          border: '1px solid rgba(37, 211, 102, 0.3)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(37, 211, 102, 0.2)',
              color: 'var(--color-whatsapp)',
              flexShrink: 0
            }}>
              <WhatsAppIcon size={18} />
            </span>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ⚡ Direct Component Ordering on WhatsApp
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Need components delivered urgently to your college? Order directly via our priority lines:
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRIORITY_BUYING_NUMBERS.map((line, idx) => (
              <a
                key={idx}
                href={`https://wa.me/${line.raw}?text=${encodeURIComponent(`Hi upVolt! I am browsing the component catalog and would like to buy components directly via ${line.display}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: idx === 0 ? 'rgba(37, 211, 102, 0.18)' : 'var(--bg-surface)',
                  border: idx === 0 ? '1px solid rgba(37, 211, 102, 0.5)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
                title={`Order directly via ${line.label}`}
              >
                <WhatsAppIcon size={13} color="#25D366" />
                <span>{line.display}</span>
                <span style={{
                  fontSize: '0.66rem',
                  color: idx === 0 ? 'var(--color-whatsapp)' : 'var(--text-muted)',
                  fontWeight: 600
                }}>
                  ({idx === 0 ? 'Founder' : `P${idx + 1}`})
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Shop Layout: Sidebar + Grid */}
        <div className="cc-shop-layout">
          {/* Sidebar */}
          <aside className={`cc-shop-sidebar ${mobileFilterOpen ? 'cc-shop-sidebar--open' : ''}`}>
            <div className="cc-shop-sidebar__header show-tablet">
              <span className="cc-shop-sidebar__title">Filter Products</span>
              <button
                type="button"
                className="cc-shop-sidebar__close"
                onClick={() => setMobileFilterOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Category Filter */}
            <div className="cc-filter-group">
              <h3 className="cc-filter-group__title">Categories</h3>
              <div className="cc-filter-category-list">
                <button
                  type="button"
                  className={`cc-filter-cat-btn ${selectedCategory === 'All' ? 'cc-filter-cat-btn--active' : ''}`}
                  onClick={() => handleCategorySelect('All')}
                >
                  <span>All Products</span>
                  <span className="cc-filter-cat-count">{products.length}</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter(p => p.category === cat.name).length;
                  return (
                    <button
                      key={cat._id || cat.id}
                      type="button"
                      className={`cc-filter-cat-btn ${selectedCategory === cat.name ? 'cc-filter-cat-btn--active' : ''}`}
                      onClick={() => handleCategorySelect(cat.name)}
                    >
                      <span>{cat.name}</span>
                      <span className="cc-filter-cat-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="cc-filter-group">
              <div className="cc-filter-group__header">
                <h3 className="cc-filter-group__title">Max Price</h3>
                <span className="cc-price-filter-val">₹{priceMax}</span>
              </div>
              <input
                type="range"
                min="50"
                max="3000"
                step="50"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="cc-price-slider"
              />
              <div className="cc-price-slider-labels">
                <span>₹50</span>
                <span>₹3,000+</span>
              </div>
            </div>

            {/* Fast Reset */}
            {(selectedCategory !== 'All' || searchQuery || priceMax < 3000) && (
              <button
                type="button"
                className="cc-filter-reset-btn"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setPriceMax(3000);
                  setSearchParams({});
                }}
              >
                Reset All Filters
              </button>
            )}
          </aside>

          {/* Main Product Grid Content */}
          <main className="cc-shop-main">
            {/* Top Toolbar */}
            <div className="cc-shop-toolbar glass-panel">
              <div className="cc-shop-toolbar__info">
                Showing <strong>{filteredProducts.length}</strong> items
                {selectedCategory !== 'All' && <span> in <em>{selectedCategory}</em></span>}
              </div>

              {/* Live Real-time Search in Shop Toolbar */}
              <div className="cc-shop-inline-search">
                <Search size={15} className="cc-shop-inline-search__icon" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim()) {
                      searchParams.set('search', val.trim());
                    } else {
                      searchParams.delete('search');
                    }
                    setSearchParams(searchParams, { replace: true });
                  }}
                  className="cc-shop-inline-search__input"
                  aria-label="Filter components live"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="cc-shop-inline-search__clear"
                    onClick={() => {
                      setSearchQuery('');
                      searchParams.delete('search');
                      setSearchParams(searchParams, { replace: true });
                    }}
                    title="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button
                  type="button"
                  onClick={loadProducts}
                  className="cc-refresh-btn"
                  title="Refresh catalog"
                  disabled={loading}
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                </button>

                <div className="cc-shop-toolbar__sort">
                  <label htmlFor="shop-sort">Sort by:</label>
                  <select
                    id="shop-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="cc-sort-select"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid */}
            {loading && products.length === 0 ? (
              <div className="cc-shop-empty">
                <div className="animate-spin" style={{ width: 32, height: 32, margin: '0 auto 16px', border: '3px solid rgba(0,163,255,0.2)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }} />
                <h3>Loading components...</h3>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="cc-shop-grid">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product._id || product.id || product.sku || `shop-prod-${index}`} product={product} />
                ))}
              </div>
            ) : (
              <div className="cc-shop-empty">
                <h3>No components found</h3>
                <p>Try clearing filters or search for another microcontroller, sensor, or module.</p>
                <button
                  type="button"
                  className="cc-btn cc-btn--primary"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setPriceMax(3000);
                    setSearchParams({});
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
};
