import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/mockProducts';
import { fetchCategories } from '../services/categoryService';
import { fetchProducts } from '../services/productService';
import { ArrowRight } from 'lucide-react';

export const Categories = () => {
  const [categories, setCategories] = useState(CATEGORIES);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchCategories().then((res) => {
      if (res && res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      }
    }).catch(err => {
      console.warn('Failed to load categories:', err);
    });

    fetchProducts().then(({ products: liveItems }) => {
      if (liveItems) setProducts(liveItems);
    }).catch(err => {
      console.warn('Failed to load products:', err);
    });
  }, []);

  return (
    <div className="cc-page cc-categories-page" style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>
            All Hardware Categories
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Find the right components for your IoT, robotics, and embedded electronics prototypes.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {categories.map((cat) => {
            const liveCount = products.filter(p => p.category === cat.name).length;
            const countToUse = liveCount > 0 ? liveCount : (cat.productCount ?? cat.count ?? 0);
            const displayCount = countToUse > 0 ? `${countToUse} components` : 'Browse components';

            return (
              <Link
                key={cat._id || cat.id}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="glass-panel"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ width: '100%', height: 180, overflow: 'hidden', background: 'var(--bg-surface)' }}>
                  <img
                    src={cat.image || '/images/realistic/arduino_uno.jpg'}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {cat.name}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {displayCount}
                    </span>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
