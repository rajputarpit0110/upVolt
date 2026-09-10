import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/mockProducts';
import { fetchCategories } from '../../services/categoryService';
import { ArrowRight } from 'lucide-react';
import './CategoryGrid.css';

export const CategoryGrid = () => {
  const [categories, setCategories] = useState(CATEGORIES);

  useEffect(() => {
    fetchCategories().then((res) => {
      if (res && res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      }
    }).catch(err => {
      console.warn('Failed to load categories on home grid:', err);
    });
  }, []);

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

        {/* Dynamic Category Cards */}
        <div className="cc-category-grid">
          {categories.map((cat) => (
            <Link
              key={cat._id || cat.id}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="cc-category-card"
            >
              <div className="cc-category-card__image-box">
                <img
                  src={cat.image || '/images/realistic/arduino_uno.jpg'}
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
