import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { getOptimizedImageUrl, getOptimizedSrcSet } from '../../utils/imageHelper';
import { Star, Heart, ShoppingCart, ArrowRight, Zap } from 'lucide-react';
import './ProductCard.css';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const id = product._id || product.id || product.sku;
  const isWishlisted = isInWishlist(id);
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const rawImg = product.image || (product.images && product.images.length > 0 ? product.images[0] : null) || '/logo-circuit.svg';
  const optimizedImg = getOptimizedImageUrl(rawImg, { width: 400 });
  const srcSet = getOptimizedSrcSet(rawImg, [300, 500]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) return;
    addToCart(product, 1);
    if (!user) {
      navigate('/login', { state: { returnUrl: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="cc-product-card">
      {/* Top Bar: Badge & Wishlist */}
      <div className="cc-product-card__header">
        {product.badge && product.badge.toLowerCase() !== 'hot' ? (
          <Badge variant={product.badge.toLowerCase()}>{product.badge}</Badge>
        ) : discountPercent ? (
          <Badge variant="discount">{discountPercent}% OFF</Badge>
        ) : <span />}

        <button
          type="button"
          className={`cc-product-card__wishlist ${isWishlisted ? 'cc-product-card__wishlist--active' : ''}`}
          onClick={handleWishlistToggle}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-label="Wishlist"
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Image Showcase */}
      <Link to={`/product/${id}`} className="cc-product-card__image-link">
        <div className="cc-product-card__image-box">
          <img
            src={optimizedImg}
            srcSet={srcSet}
            sizes="(max-width: 600px) 240px, 380px"
            alt={`${product.name} - ${product.category || 'IoT Component'} | buy electronic components for engineering projects`}
            className="cc-product-card__img"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/logo-circuit.svg';
            }}
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="cc-product-card__body">
        {/* Rating */}
        <div className="cc-product-card__rating">
          <Star size={14} className="cc-star-icon" fill="currentColor" />
          <span className="cc-rating-val">{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
          <span className="cc-rating-reviews">({product.reviewsCount ?? product.numReviews ?? 0})</span>
        </div>

        {/* Title */}
        <h3 className="cc-product-card__title">
          <Link to={`/product/${id}`} title={product.name}>
            {product.name}
          </Link>
        </h3>

        {/* Price Row */}
        <div className="cc-product-card__price-row">
          <div className="cc-product-card__price-group">
            <span className="cc-product-card__price">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="cc-product-card__original-price">₹{product.originalPrice}</span>
            )}
          </div>
          {discountPercent && (
            <span className="cc-product-card__discount-tag">{discountPercent}% OFF</span>
          )}
        </div>

        {/* Action Buttons: Add to Cart & Buy Now */}
        <div className="cc-product-card__actions">
          {(!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) ? (
            <button
              type="button"
              className="cc-product-card__btn-cart cc-product-card__btn-cart--disabled cc-product-card__btn--full"
              disabled
            >
              <ShoppingCart size={14} />
              <span>Out of Stock</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                className="cc-product-card__btn-cart"
                onClick={handleAddToCart}
                title="Add to Cart"
              >
                <ShoppingCart size={14} />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                className="cc-product-card__btn-buynow"
                onClick={handleBuyNow}
                title="Buy Now directly"
              >
                <Zap size={14} />
                <span>Buy Now</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
