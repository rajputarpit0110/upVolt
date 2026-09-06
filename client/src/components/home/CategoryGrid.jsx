import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/mockProducts';
import { ArrowRight } from 'lucide-react';
import './CategoryGrid.css';

export const CategoryGrid = () => {
  return (
    <section className="cc-category-section">
      <div className="container cc-category-section__container">
        {/* Section Header */}
        <div className="cc-section-header">
          <div>
            <h2 className="cc-section-title">Shop by Category</h2>
            <p className="cc-section-subtitle">Find exactly what you need for your next project.</p>
          </div>
          <Link to="/categories" className="cc-section-link">
            <span>View All Categories</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* 8-Card Grid */}
        <div className="cc-category-grid">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="cc-category-card"
            >
              <div className="cc-category-card__image-box">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="cc-category-card__img"
                  loading="lazy"
                />
              </div>
              <span className="cc-category-card__name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
