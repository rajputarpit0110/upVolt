import React from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../product/ProductCard';
import { ArrowRight } from 'lucide-react';
import './FeaturedSection.css';

export const FeaturedSection = ({ products = [], loading = false }) => {
  const getBadgeScore = (badge) => {
    if (!badge) return 4;
    const b = badge.toLowerCase();
    if (b === 'bestseller') return 1;
    if (b === 'hot') return 2;
    if (b === 'popular') return 3;
    return 4;
  };

  // Sort by badge and show first 5
  const sortedProducts = [...products].sort((a, b) => getBadgeScore(a.badge) - getBadgeScore(b.badge));
  const displayProducts = sortedProducts.slice(0, 5);

  return (
    <section className="cc-featured-section">
      <div className="container cc-featured-section__container">
        <div className="cc-section-header">
          <div>
            <h2 className="cc-section-title">Featured Products</h2>
            <p className="cc-section-subtitle">Popular among students like you.</p>
          </div>
          <Link to="/shop" className="cc-section-link">
            <span>View All Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading && products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', width: '100%' }}>
            <div className="animate-spin" style={{ width: 32, height: 32, margin: '0 auto 16px', border: '3px solid rgba(0,163,255,0.2)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Loading components...</h3>
          </div>
        ) : (
          <div className="cc-featured-grid">
            {displayProducts.map((product, index) => (
              <ProductCard
                key={product._id || product.id || product.sku || `featured-${index}`}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
