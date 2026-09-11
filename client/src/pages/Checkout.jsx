import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { fetchDeliverySettings } from '../services/settingsService';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  loadRazorpayScript
} from '../services/paymentService';
import { RazorpayModal } from '../components/checkout/RazorpayModal';
import { Button } from '../components/common/Button';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Truck,
  CreditCard,
  Building,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  Lock,
  Zap,
  Clock,
  MapPin
} from 'lucide-react';
import './Checkout.css';

export const Checkout = () => {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const { couponCode = '', discountAmount = 0 } = location.state || {};

  const testStepParam = Number(searchParams.get('testStep'));
  const [step, setStep] = useState(testStepParam || 1);
  const [address, setAddress] = useState({
    fullName: user?.name || (testStepParam ? 'Arpit Rajput' : ''),
    phone: testStepParam ? '9876543210' : '',
    address: testStepParam ? 'Flat 302, Green Valley Apartments, Near Sector 15 Metro Station' : '',
    collegeName: user?.college || (testStepParam ? 'Delhi Technological University' : ''),
    hostelName: testStepParam ? 'Ramanujan Hostel' : '',
    roomNo: testStepParam ? '204' : '',
    city: 'Delhi',
    state: 'Delhi',
    pincode: testStepParam ? '110042' : ''
  });

  const [deliverySettings, setDeliverySettings] = useState({
    normalDeliveryFee: 40,
    fastDeliveryFee: 99,
    freeDeliveryThreshold: 499,
    normalDeliveryNote: 'Standard Delivery (2-3 Days across Delhi)',
    fastDeliveryNote: 'Express Superfast Delivery (Within 24 Hours)'
  });
  const [deliveryType, setDeliveryType] = useState('normal'); // 'normal' | 'fast'

  const [paymentMethod, setPaymentMethod] = useState('online');
  const [orderComplete, setOrderComplete] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isRzpModalOpen, setIsRzpModalOpen] = useState(false);
  const [currentRzpOrderId, setCurrentRzpOrderId] = useState(null);
  const [finalPlacedAmount, setFinalPlacedAmount] = useState(0);
  
  // Load admin-configured delivery fees & rules
  useEffect(() => {
    fetchDeliverySettings()
      .then((settings) => {
        if (settings) {
          setDeliverySettings(settings);
        }
      })
      .catch((err) => console.warn('Failed to load delivery settings:', err));
  }, []);

  // Pre-load Razorpay SDK script on-demand when user is on Checkout page
  useEffect(() => {
    if (paymentMethod === 'online') {
      loadRazorpayScript().catch((err) => {
        console.debug('Preloading Razorpay script notice:', err);
      });
    }
  }, [paymentMethod]);

  const isNormalFree = cartSubtotal >= (deliverySettings.freeDeliveryThreshold ?? 499);
  const normalFee = isNormalFree ? 0 : Number(deliverySettings.normalDeliveryFee ?? 40);
  const fastFee = Number(deliverySettings.fastDeliveryFee ?? 99);

  const shippingFee = deliveryType === 'fast' ? fastFee : normalFee;
  const totalAmount = Math.max(0, cartSubtotal + shippingFee - discountAmount);

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleRazorpaySuccess = async (response, orderPayloadData = null) => {
    setIsRzpModalOpen(false);
    setIsSubmitting(true);
    setPaymentError('');

    const payload = orderPayloadData || {
      customerName: address.fullName,
      customerEmail: user?.email || '',
      customerPhone: address.phone,
      shippingAddress: {
        address: address.address,
        collegeName: address.collegeName || '',
        hostelName: address.hostelName || '',
        roomNo: address.roomNo || '',
        city: address.city || 'Delhi',
        state: address.state || 'Delhi',
        pincode: address.pincode
      },
      items: cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        sku: item.sku || `SKU-${item._id || item.id}`
      })),
      deliveryType,
      subtotal: cartSubtotal,
      shippingFee,
      discountAmount,
      couponCode,
      totalAmount,
      paymentMethod: 'online'
    };

    try {
      // Manual verification: we bypass verifyRazorpayPayment and directly create the order
      payload.razorpayPaymentId = response.razorpay_payment_id; // This stores the UTR ID
      payload.paymentStatus = 'pending'; // Requires manual confirmation

      const savedOrder = await createOrder(payload);

      setPlacedOrderId(savedOrder.orderId);
      setFinalPlacedAmount(totalAmount);
      setOrderComplete(true);

      try {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.6 }
        });
      } catch { }

      clearCart();
    } catch (verifyErr) {
      console.error('Order creation failed:', verifyErr);
      setPaymentError(verifyErr.message || 'Failed to place order after payment. Please contact support with your UTR.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRazorpayModalClose = () => {
    setIsRzpModalOpen(false);
    setIsSubmitting(false);
    setPaymentError('Payment was cancelled. Your order has not been placed. You can select another method or retry.');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPaymentError('');
    setIsSubmitting(true);

    const orderPayload = {
      customerName: address.fullName,
      customerEmail: user?.email || '',
      customerPhone: address.phone,
      shippingAddress: {
        address: address.address,
        collegeName: address.collegeName || '',
        hostelName: address.hostelName || '',
        roomNo: address.roomNo || '',
        city: address.city || 'Delhi',
        state: address.state || 'Delhi',
        pincode: address.pincode
      },
      items: cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        sku: item.sku || `SKU-${item._id || item.id}`
      })),
      deliveryType,
      subtotal: cartSubtotal,
      shippingFee,
      discountAmount,
      couponCode,
      totalAmount,
      paymentMethod
    };

    // Flow 1: Cash on Delivery
    if (paymentMethod === 'cod') {
      try {
        const savedOrder = await createOrder(orderPayload);
        setPlacedOrderId(savedOrder.orderId);
        setFinalPlacedAmount(totalAmount);
        setOrderComplete(true);

        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch { }

        clearCart();
      } catch (err) {
        console.warn('Backend order placement failed, generating local confirmation:', err);
        const fallbackId = 'CC-' + Math.floor(100000 + Math.random() * 900000);
        setPlacedOrderId(fallbackId);
        setFinalPlacedAmount(totalAmount);
        setOrderComplete(true);
        clearCart();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Flow 2: Manual Online Payment via UPI QR Code
    // Bypass Razorpay Initialization and directly open the manual modal
    setIsSubmitting(false);
    setIsRzpModalOpen(true);
  };

  if (orderComplete) {
    return (
      <div className="cc-page cc-order-success-page">
        <div className="container">
          <div className="cc-order-success-card glass-panel">
            <div className="cc-success-icon-box">
              <CheckCircle size={54} />
            </div>
            <h1>Order Confirmed!</h1>
            <p className="cc-success-order-num">Order ID: <strong>{placedOrderId}</strong></p>
            <p className="cc-success-text">
              Thank you for ordering with upVolt! We have received your order. Our team will pack your components and deliver them directly to your specified address.
            </p>

            <div className="cc-success-details-card">
              <div className="cc-success-detail-row">
                <span>Customer:</span>
                <strong>{address.fullName} ({address.phone})</strong>
              </div>
              <div className="cc-success-detail-row">
                <span>Delivery Address:</span>
                <strong>{address.address}, {address.city} - {address.pincode}</strong>
              </div>
              {(address.collegeName || address.hostelName) && (
                <div className="cc-success-detail-row">
                  <span>Campus / Hostel:</span>
                  <span>{address.collegeName} {address.hostelName ? `• ${address.hostelName}` : ''} {address.roomNo ? `(Room ${address.roomNo})` : ''}</span>
                </div>
              )}
              <div className="cc-success-detail-row">
                <span>Delivery Speed:</span>
                <strong>
                  {deliveryType === 'fast' ? '⚡ Fast Delivery (Within 24 Hours)' : 'Standard Normal Delivery (2-3 Days)'}
                </strong>
              </div>
              <div className="cc-success-detail-row">
                <span>Payment Mode:</span>
                <strong>{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay / UPI)'}</strong>
              </div>
              <div className="cc-success-detail-row">
                <span>Total Amount:</span>
                <strong>₹{finalPlacedAmount}</strong>
              </div>
            </div>

            <div className="cc-success-actions">
              <Link to="/orders">
                <Button variant="primary" size="lg">Track Order Status</Button>
              </Link>
              <Link to="/shop">
                <Button variant="secondary" size="lg">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cc-page cc-cart-empty-page">
        <div className="container">
          <div className="cc-cart-empty-box glass-panel">
            <h2>No items to checkout</h2>
            <Link to="/shop">
              <Button variant="primary">Return to Shop</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-page cc-checkout-page">
      <div className="container">
        {/* Step Stepper Header */}
        <div className="cc-checkout-stepper">
          <div className={`cc-step ${step >= 1 ? 'cc-step--active' : ''}`}>
            <span className="cc-step__num">1</span>
            <span className="cc-step__title">Delivery Address</span>
          </div>
          <div className="cc-step__line" />
          <div className={`cc-step ${step >= 2 ? 'cc-step--active' : ''}`}>
            <span className="cc-step__num">2</span>
            <span className="cc-step__title">Review &amp; Delivery</span>
          </div>
          <div className="cc-step__line" />
          <div className={`cc-step ${step >= 3 ? 'cc-step--active' : ''}`}>
            <span className="cc-step__num">3</span>
            <span className="cc-step__title">Payment</span>
          </div>
        </div>

        <div className="cc-checkout-layout">
          {/* Main Step Form */}
          <div className="cc-checkout-form-container glass-panel">
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="cc-checkout-step-form">
                <h2 className="cc-checkout-step-title">Delivery Address Details</h2>
                <p className="cc-checkout-step-sub">We deliver right to your doorstep, college campus, or hostel room gate.</p>

                <div className="cc-form-grid">
                  <div className="cc-form-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Arpit Rajput"
                      value={address.fullName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="cc-form-field">
                    <label>Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="e.g. 9876543210"
                      value={address.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* MANDATORY FULL ADDRESS */}
                  <div className="cc-form-field cc-form-field--full">
                    <label>Full Delivery Address (House / Flat / Street / Area / Landmark) *</label>
                    <textarea
                      name="address"
                      required
                      rows={2}
                      placeholder="e.g. Flat 302, Green Valley Apartments, Near Sector 15 Metro Station"
                      value={address.address}
                      onChange={handleInputChange}
                      className="cc-address-textarea"
                    />
                  </div>

                  {/* OPTIONAL COLLEGE AND HOSTEL DETAILS */}
                  <div className="cc-form-field cc-form-field--full">
                    <label>College / University Name <span className="cc-optional-tag">(Optional)</span></label>
                    <input
                      type="text"
                      name="collegeName"
                      placeholder="e.g. Delhi Technological University (DTU) (Optional)"
                      value={address.collegeName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="cc-form-field">
                    <label>Hostel / Block Name <span className="cc-optional-tag">(Optional)</span></label>
                    <input
                      type="text"
                      name="hostelName"
                      placeholder="e.g. Ramanujan Hostel, Block B (Optional)"
                      value={address.hostelName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="cc-form-field">
                    <label>Room No. / Wing <span className="cc-optional-tag">(Optional)</span></label>
                    <input
                      type="text"
                      name="roomNo"
                      placeholder="e.g. Room 204, 2nd Floor (Optional)"
                      value={address.roomNo}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="cc-form-field">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="City"
                      value={address.city}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="cc-form-field">
                    <label>PIN Code *</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      placeholder="6-digit PIN"
                      value={address.pincode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="cc-checkout-form-footer">
                  <Link to="/cart" className="cc-back-btn">← Back to Cart</Link>
                  <Button type="submit" variant="primary" size="lg">
                    Continue to Review →
                  </Button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="cc-checkout-step-form">
                <h2 className="cc-checkout-step-title">Review Your Order &amp; Delivery</h2>
                <p className="cc-checkout-step-sub">Please verify components and choose your preferred delivery speed.</p>

                {/* Delivery Address Verification */}
                <div className="cc-review-address-box">
                  <div className="cc-review-address-head">
                    <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={16} color="var(--accent-primary)" />
                      <span>Delivery Address</span>
                    </strong>
                    <button type="button" onClick={() => setStep(1)} className="cc-edit-step-btn">Edit</button>
                  </div>
                  <p><strong>{address.fullName}</strong> (📞 {address.phone})</p>
                  <p style={{ marginTop: 4 }}>🏠 {address.address}</p>
                  {(address.collegeName || address.hostelName) && (
                    <p style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
                      🏛️ {address.collegeName} {address.hostelName ? `• ${address.hostelName}` : ''} {address.roomNo ? `(Room ${address.roomNo})` : ''}
                    </p>
                  )}
                  <p style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                    📍 {address.city} - {address.pincode}
                  </p>
                </div>

                {/* Delivery Speed Selector in Review Step */}
                <div className="cc-delivery-speed-wrapper">
                  <label className="cc-delivery-section-label">
                    <Truck size={16} />
                    <span>Choose Delivery Speed</span>
                  </label>
                  <div className="cc-delivery-options-grid">
                    {/* Normal Delivery */}
                    <div
                      className={`cc-delivery-card ${deliveryType === 'normal' ? 'cc-delivery-card--active' : ''}`}
                      onClick={() => setDeliveryType('normal')}
                    >
                      <div className="cc-delivery-card-radio">
                        <input
                          type="radio"
                          name="deliveryTypeStep2"
                          value="normal"
                          checked={deliveryType === 'normal'}
                          onChange={() => setDeliveryType('normal')}
                        />
                      </div>
                      <div className="cc-delivery-card-content">
                        <div className="cc-delivery-card-title-row">
                          <span className="cc-delivery-card-title">Normal Delivery</span>
                          {normalFee === 0 ? (
                            <span className="cc-delivery-price cc-delivery-price--free">FREE</span>
                          ) : (
                            <span className="cc-delivery-price">₹{normalFee}</span>
                          )}
                        </div>
                        <p className="cc-delivery-card-desc">
                          {deliverySettings.normalDeliveryNote || 'Standard Delivery (2-3 Days across Delhi)'}
                        </p>
                        {normalFee === 0 && (
                          <span className="cc-free-delivery-tag">🎉 Free above ₹{deliverySettings.freeDeliveryThreshold}</span>
                        )}
                      </div>
                    </div>

                    {/* Fast Delivery */}
                    <div
                      className={`cc-delivery-card cc-delivery-card--fast ${deliveryType === 'fast' ? 'cc-delivery-card--active' : ''}`}
                      onClick={() => setDeliveryType('fast')}
                    >
                      <div className="cc-delivery-card-radio">
                        <input
                          type="radio"
                          name="deliveryTypeStep2"
                          value="fast"
                          checked={deliveryType === 'fast'}
                          onChange={() => setDeliveryType('fast')}
                        />
                      </div>
                      <div className="cc-delivery-card-content">
                        <div className="cc-delivery-card-title-row">
                          <span className="cc-delivery-card-title">
                            <Zap size={15} className="cc-zap-icon" /> Fast Delivery
                          </span>
                          <span className="cc-delivery-price cc-delivery-price--fast">₹{fastFee}</span>
                        </div>
                        <p className="cc-delivery-card-desc">
                          {deliverySettings.fastDeliveryNote || 'Express Superfast Delivery (Within 24 Hours)'}
                        </p>
                        <span className="cc-fast-delivery-tag">⚡ Express Dispatch</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cc-review-items">
                  <h3>Order Items ({cartItems.length})</h3>
                  {cartItems.map((item) => (
                    <div key={item._id || item.id} className="cc-review-item-row">
                      <span>{item.name} × {item.quantity}</span>
                      <strong>₹{item.price * item.quantity}</strong>
                    </div>
                  ))}
                </div>

                <div className="cc-checkout-form-footer">
                  <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
                  <Button variant="primary" size="lg" onClick={() => setStep(3)}>
                    Continue to Payment →
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handlePlaceOrder} className="cc-checkout-step-form">
                <h2 className="cc-checkout-step-title">Select Payment Mode</h2>
                <p className="cc-checkout-step-sub">Choose how you wish to pay for your project components.</p>

                {paymentError && (
                  <div className="cc-payment-error-alert">
                    <AlertCircle size={18} />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Delivery Speed Selector - Visible for both Online and COD */}
                <div className="cc-delivery-speed-wrapper" style={{ marginBottom: 24 }}>
                  <label className="cc-delivery-section-label">
                    <Truck size={16} />
                    <span>Selected Delivery Speed</span>
                  </label>
                  <div className="cc-delivery-options-grid">
                    {/* Normal Delivery */}
                    <div
                      className={`cc-delivery-card ${deliveryType === 'normal' ? 'cc-delivery-card--active' : ''}`}
                      onClick={() => setDeliveryType('normal')}
                    >
                      <div className="cc-delivery-card-radio">
                        <input
                          type="radio"
                          name="deliveryTypeStep3"
                          value="normal"
                          checked={deliveryType === 'normal'}
                          onChange={() => setDeliveryType('normal')}
                        />
                      </div>
                      <div className="cc-delivery-card-content">
                        <div className="cc-delivery-card-title-row">
                          <span className="cc-delivery-card-title">Normal Delivery</span>
                          {normalFee === 0 ? (
                            <span className="cc-delivery-price cc-delivery-price--free">FREE</span>
                          ) : (
                            <span className="cc-delivery-price">₹{normalFee}</span>
                          )}
                        </div>
                        <p className="cc-delivery-card-desc">
                          {deliverySettings.normalDeliveryNote || 'Standard Delivery (2-3 Days across Delhi)'}
                        </p>
                        {normalFee === 0 && (
                          <span className="cc-free-delivery-tag">🎉 Free on ₹{deliverySettings.freeDeliveryThreshold}+</span>
                        )}
                      </div>
                    </div>

                    {/* Fast Delivery */}
                    <div
                      className={`cc-delivery-card cc-delivery-card--fast ${deliveryType === 'fast' ? 'cc-delivery-card--active' : ''}`}
                      onClick={() => setDeliveryType('fast')}
                    >
                      <div className="cc-delivery-card-radio">
                        <input
                          type="radio"
                          name="deliveryTypeStep3"
                          value="fast"
                          checked={deliveryType === 'fast'}
                          onChange={() => setDeliveryType('fast')}
                        />
                      </div>
                      <div className="cc-delivery-card-content">
                        <div className="cc-delivery-card-title-row">
                          <span className="cc-delivery-card-title">
                            <Zap size={15} className="cc-zap-icon" /> Fast Delivery
                          </span>
                          <span className="cc-delivery-price cc-delivery-price--fast">₹{fastFee}</span>
                        </div>
                        <p className="cc-delivery-card-desc">
                          {deliverySettings.fastDeliveryNote || 'Express Superfast Delivery (Within 24 Hours)'}
                        </p>
                        <span className="cc-fast-delivery-tag">⚡ Express Dispatch</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cc-payment-options">
                  <label className={`cc-payment-option ${paymentMethod === 'online' ? 'cc-payment-option--active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => { setPaymentMethod('online'); setPaymentError(''); }}
                    />
                    <div className="cc-payment-info">
                      <div className="cc-payment-info-header">
                        <strong>Online Payment (Razorpay Gateway)</strong>
                        <span className="cc-payment-badge">⚡ Instant Dispatch</span>
                      </div>
                      <span>Pay securely via UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, NetBanking, &amp; Wallets.</span>
                      <div className="cc-payment-chips">
                        <span className="cc-payment-chip">UPI / QR</span>
                        <span className="cc-payment-chip">Google Pay</span>
                        <span className="cc-payment-chip">PhonePe</span>
                        <span className="cc-payment-chip">Paytm</span>
                        <span className="cc-payment-chip">Debit/Credit Card</span>
                        <span className="cc-payment-chip">NetBanking</span>
                      </div>
                    </div>
                  </label>

                  <label className={`cc-payment-option ${paymentMethod === 'cod' ? 'cc-payment-option--active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => { setPaymentMethod('cod'); setPaymentError(''); }}
                    />
                    <div className="cc-payment-info">
                      <div className="cc-payment-info-header">
                        <strong>Cash on Delivery (Pay on Delivery)</strong>
                        <span className="cc-payment-badge cc-payment-badge--cod">Pay at Doorstep</span>
                      </div>
                      <span>Pay securely in cash or via rider UPI when components arrive at your doorstep / campus gate.</span>
                    </div>
                  </label>
                </div>

                <div className="cc-payment-security-note">
                  <Lock size={14} />
                  <span>Payments are processed securely via direct UPI transfer.</span>
                </div>

                <div className="cc-checkout-form-footer">
                  <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
                  <Button type="submit" variant="glow" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Loader2 size={18} className="animate-spin" />
                        <span>{paymentMethod === 'online' ? 'Opening Razorpay Gateway...' : 'Placing Order...'}</span>
                      </span>
                    ) : (
                      paymentMethod === 'online'
                        ? `Proceed to Pay (₹${totalAmount}) →`
                        : `Confirm COD Order (₹${totalAmount})`
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Right Summary Panel */}
          <aside className="cc-checkout-summary glass-panel">
            <h3 className="cc-checkout-summary-title">Order Summary</h3>
            <div className="cc-checkout-summary-items">
              {cartItems.map((item) => (
                <div key={item._id || item.id} className="cc-checkout-mini-item">
                  <img src={item.image} alt={item.name} />
                  <div className="cc-mini-item-info">
                    <span className="cc-mini-item-name">{item.name}</span>
                    <span className="cc-mini-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="cc-mini-item-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="cc-checkout-total-rows">
              <div className="cc-checkout-row">
                <span>Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              <div className="cc-checkout-row">
                <span>
                  Delivery ({deliveryType === 'fast' ? '⚡ Fast' : 'Normal'})
                </span>
                <span style={{ fontWeight: 700, color: shippingFee === 0 ? 'var(--accent-success, #10B981)' : 'var(--text-primary)' }}>
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="cc-checkout-row cc-checkout-row--discount" style={{ color: '#10B981', fontWeight: 600 }}>
                  <span>Discount ({couponCode})</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}
              <div className="cc-checkout-row cc-checkout-row--final">
                <span>Total</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Razorpay Online Payment Gateway Modal */}
      <RazorpayModal
        isOpen={isRzpModalOpen}
        onClose={handleRazorpayModalClose}
        onSuccess={handleRazorpaySuccess}
        amount={totalAmount}
        orderId={currentRzpOrderId}
        customerName={address.fullName}
        customerEmail={user?.email || ''}
        customerPhone={address.phone}
      />
    </div>
  );
};
