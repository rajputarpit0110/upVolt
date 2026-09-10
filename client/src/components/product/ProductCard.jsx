import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Badge } from '../common/Badge';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { getProductWhatsAppLink } from '../../utils/constants';
import { Star, Heart, ShoppingCart, ArrowRight } from 'lucide-react';
import './ProductCard.css';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const id = product._id || product.id || product.sku;
  const isWishlisted = isInWishlist(id);
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
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
        {product.badge ? (
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
            src={product.image || '/logo-circuit.svg'}
            alt={product.name}
            className="cc-product-card__img"
            loading="lazy"
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

        {/* Action Buttons: Add to Cart + WhatsApp Buy */}
        <div className="cc-product-card__actions">
          <button
            type="button"
            className="cc-product-card__btn-cart"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={15} />
            <span>Add to Cart</span>
          </button>

          <a
            href={getProductWhatsAppLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="cc-product-card__btn-whatsapp"
            title="Buy or inquire on WhatsApp"
            aria-label="WhatsApp Order"
          >
            <WhatsAppIcon size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};
