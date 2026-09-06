import React from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../product/ProductCard';
import { ArrowRight } from 'lucide-react';
import './FeaturedSection.css';

export const FeaturedSection = ({ products = [] }) => {
  // Show first 5 or all featured products
  const displayProducts = products.slice(0, 5);

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

        <div className="cc-featured-grid">
          {displayProducts.map((product, index) => (
            <ProductCard
              key={product._id || product.id || product.sku || `featured-${index}`}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
