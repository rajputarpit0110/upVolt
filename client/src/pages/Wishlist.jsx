import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/common/Button';
import { Heart, ArrowRight } from 'lucide-react';

export const Wishlist = () => {
  const { wishlistItems } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="cc-page cc-cart-empty-page">
        <div className="container">
          <div className="cc-cart-empty-box glass-panel">
            <div className="cc-cart-empty-icon">
              <Heart size={44} />
            </div>
            <h2>Your Wishlist is Empty</h2>
            <p>Save components, sensors, and dev boards you plan to use for upcoming college projects.</p>
            <Link to="/shop">
              <Button variant="glow" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
                Explore Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-page cc-wishlist-page">
      <div className="container">
        <h1 className="cc-cart-title">Your Saved Components ({wishlistItems.length})</h1>
        <div className="cc-shop-grid">
          {wishlistItems.map((product, idx) => (
            <ProductCard key={product._id || product.id || product.sku || `wish-${idx}`} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
