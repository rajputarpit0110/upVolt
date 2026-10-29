import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag
} from 'lucide-react';
import { validateCouponCode } from '../services/couponService';
import { fetchDeliverySettings } from '../services/settingsService';
import { fetchProductById } from '../services/productService';
import './Cart.css';

export const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [isCheckingStock, setIsCheckingStock] = useState(true);
  const [stockAlerts, setStockAlerts] = useState([]);

  const [deliverySettings, setDeliverySettings] = useState({
    normalDeliveryFee: 49,
    freeDeliveryThreshold: 499
  });

  useEffect(() => {
    fetchDeliverySettings()
      .then(settings => {
        if (settings) {
          setDeliverySettings(settings);
        }
      })
      .catch(err => console.warn('Failed to load delivery settings:', err));
  }, []);

  useEffect(() => {
    const verifyCartStock = async () => {
      if (!cartItems || cartItems.length === 0) {
        setIsCheckingStock(false);
        return;
      }
      
      setIsCheckingStock(true);
      const alerts = [];
      let hasChanges = false;
      
      try {
        await Promise.all(cartItems.map(async (item) => {
          const id = item._id || item.id;
          const liveProduct = await fetchProductById(id);
          
          if (!liveProduct) {
            alerts.push(`"${item.name}" is no longer available and was removed.`);
            removeFromCart(id);
            hasChanges = true;
            return;
          }
          
          if (!liveProduct.inStock || liveProduct.stockQuantity <= 0) {
            alerts.push(`"${item.name}" is currently out of stock and was removed.`);
            removeFromCart(id);
            hasChanges = true;
          } else if (liveProduct.stockQuantity < item.quantity) {
            alerts.push(`"${item.name}" only has ${liveProduct.stockQuantity} units left. Quantity reduced.`);
            updateQuantity(id, liveProduct.stockQuantity);
            hasChanges = true;
          }
        }));
      } catch (error) {
        console.error('Failed to verify cart stock:', error);
      } finally {
        if (hasChanges) {
          setStockAlerts(alerts);
        }
        setIsCheckingStock(false);
      }
    };

    verifyCartStock();
    // We intentionally only run this on mount to avoid infinite loops with updateQuantity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shippingFee = cartSubtotal >= (deliverySettings.freeDeliveryThreshold ?? 499) || cartSubtotal === 0 
    ? 0 
    : Number(deliverySettings.normalDeliveryFee ?? 49);
  const finalTotal = Math.max(0, cartSubtotal + shippingFee - discountAmount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError('');
    setCouponMessage('');

    try {
      const data = await validateCouponCode(couponCode.trim(), cartSubtotal);
      setDiscountAmount(data.discountAmount);
      setCouponApplied(true);
      setCouponMessage(data.message || `Coupon "${data.coupon.code}" applied!`);
    } catch (err) {
      setCouponError(err.message || 'Invalid or expired coupon code.');
      setDiscountAmount(0);
      setCouponApplied(false);
    } finally {
      setValidatingCoupon(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cc-page cc-cart-empty-page">
        <div className="container">
          <div className="cc-cart-empty-box glass-panel">
            <div className="cc-cart-empty-icon">
              <ShoppingBag size={48} />
            </div>

            {stockAlerts.length > 0 && (
              <div className="cc-cart-stock-alerts glass-panel" style={{ marginBottom: 20, padding: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 12, textAlign: 'left' }}>
                <h4 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 0 }}>
                  <Tag size={16} /> Cart Updated Due to Stock Changes
                </h4>
                <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-secondary)' }}>
                  {stockAlerts.map((alert, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{alert}</li>
                  ))}
                </ul>
              </div>
            )}

            <h2>Your Cart is Empty</h2>
            <p>You haven't added any microcontrollers, sensors, or kits yet.</p>
            <Link to="/shop">
              <Button variant="glow" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
                Explore Components
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-page cc-cart-page">
      <SEO 
        title="Your Cart | upVolt" 
        description="Review items in your upVolt cart before checkout." 
      />
      <div className="container">
        <h1 className="cc-cart-title">Your Cart ({cartItems.length} items)</h1>

        {stockAlerts.length > 0 && (
          <div className="cc-cart-stock-alerts glass-panel" style={{ marginBottom: 20, padding: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 12 }}>
            <h4 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 0 }}>
              <Tag size={16} /> Cart Updated Due to Stock Changes
            </h4>
            <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-secondary)' }}>
              {stockAlerts.map((alert, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{alert}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="cc-cart-layout">
          {/* Items List Left */}
          <div className="cc-cart-items-wrapper">
            <div className="cc-cart-items-list">
              {cartItems.map((item) => {
                const id = item._id || item.id;
                return (
                  <div key={id} className="cc-cart-item glass-panel">
                    <Link to={`/product/${id}`} className="cc-cart-item__thumb">
                      <img src={item.image} alt={`Cart item: ${item.name}`} loading="lazy" />
                    </Link>

                    <div className="cc-cart-item__info">
                      <span className="cc-cart-item__category">{item.category}</span>
                      <h3 className="cc-cart-item__name">
                        <Link to={`/product/${id}`}>{item.name}</Link>
                      </h3>
                      <div className="cc-cart-item__unit-price">₹{item.price} each</div>
                    </div>

                    <div className="cc-cart-item__qty-actions">
                      <div className="cc-qty-stepper cc-qty-stepper--sm">
                        <button
                          type="button"
                          className="cc-qty-btn"
                          onClick={() => updateQuantity(id, item.quantity - 1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="cc-qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="cc-qty-btn"
                          disabled={item.stockQuantity !== undefined && item.quantity >= item.stockQuantity}
                          onClick={() => updateQuantity(id, item.quantity + 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cc-cart-item__remove"
                        onClick={() => removeFromCart(id)}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="cc-cart-item__subtotal">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cc-cart-footer-actions">
              <Link to="/shop" className="cc-continue-shopping">
                ← Continue Shopping
              </Link>
              <button
                type="button"
                className="cc-clear-cart-btn"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary Right */}
          <aside className="cc-cart-summary glass-panel">
            <h2 className="cc-summary-title">Order Summary</h2>

            {/* Coupon Code Form */}
            <form onSubmit={handleApplyCoupon} className="cc-coupon-form">
              <div className="cc-coupon-input-group">
                <Tag size={16} className="cc-coupon-icon" />
                <input
                  type="text"
                  placeholder="Coupon code (e.g. CAMPUS10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="cc-coupon-input"
                />
                <button type="submit" className="cc-coupon-submit-btn">Apply</button>
              </div>
              {couponApplied && (
                <span className="cc-coupon-success">{couponMessage || `₹${discountAmount} Discount Applied!`}</span>
              )}
              {couponError && (
                <span className="cc-coupon-error">{couponError}</span>
              )}
            </form>

            <div className="cc-summary-rows">
              <div className="cc-summary-row">
                <span>Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>

              <div className="cc-summary-row">
                <span>Delivery / Shipping</span>
                {shippingFee === 0 && cartSubtotal > 0 ? (
                  <span className="cc-free-shipping">FREE (Order &gt;= ₹{deliverySettings.freeDeliveryThreshold ?? 499})</span>
                ) : (
                  <span>{cartSubtotal === 0 ? '₹0' : `₹${shippingFee}`}</span>
                )}
              </div>

              {discountAmount > 0 && (
                <div className="cc-summary-row cc-summary-row--discount">
                  <span>Student Discount</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              <div className="cc-summary-divider" />

              <div className="cc-summary-row cc-summary-row--total">
                <span>Total Amount</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            {/* Checkout CTAs */}
            <div className="cc-summary-actions">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  const checkoutState = { couponCode: couponApplied ? couponCode : '', discountAmount };
                  if (!user) {
                    navigate('/login', { state: { returnUrl: '/checkout', checkoutState } });
                  } else {
                    navigate('/checkout', { state: checkoutState });
                  }
                }}
                icon={<ArrowRight size={18} />}
                iconPosition="right"
              >
                Proceed to Checkout
              </Button>
            </div>

            {/* Perks */}
            <div className="cc-summary-perks">
              <div className="cc-summary-perk">
                <ShieldCheck size={16} className="cc-perk-ico" />
                <span>Secure SSL Checkout</span>
              </div>
              <div className="cc-summary-perk">
                <Truck size={16} className="cc-perk-ico" />
                <span>Fast Hostel Delivery</span>
              </div>
              <div className="cc-summary-perk">
                <RotateCcw size={16} className="cc-perk-ico" />
                <span>Easy Component Returns</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
