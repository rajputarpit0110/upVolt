import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
import { fetchMyOrders, cancelMyOrder } from '../services/orderService';
import { Package, Truck, CheckCircle2, Clock, RefreshCw, ShoppingBag, AlertCircle, XCircle } from 'lucide-react';
import './Orders.css';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchMyOrders();
      if (data && data.length > 0) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn('Could not fetch real orders, keeping view clean:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      try {
        await cancelMyOrder(orderId);
        // Refresh orders after successful cancellation
        loadOrders();
      } catch (err) {
        alert(err.message || 'Failed to cancel order');
      }
    }
  };

  const getStepForStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'completed': return 4;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  const getBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bestseller';
      case 'shipped': return 'popular';
      case 'processing': return 'hot';
      case 'cancelled': return 'discount';
      default: return 'new'; // pending
    }
  };

  const steps = ['Order Placed', 'Lab Processing', 'Shipped to Campus', 'Completed'];

  return (
    <div className="cc-page cc-orders-page">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
          <div>
            <h1 className="cc-orders-title">Your Hardware Orders</h1>
            <p className="cc-orders-subtitle">Track your project components and delivery to your college campus.</p>
          </div>
          <button
            type="button"
            className="cc-btn cc-btn--secondary"
            onClick={loadOrders}
            disabled={loading}
            style={{ padding: '8px 14px', fontSize: '0.88rem' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Status</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="animate-spin" style={{ width: 36, height: 36, margin: '0 auto 16px', border: '3px solid rgba(0,163,255,0.2)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading your campus orders from database...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShoppingBag size={30} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>No Orders Placed Yet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Explore our student hardware catalog and place your first order!</p>
            <Link to="/shop" className="cc-btn cc-btn--primary" style={{ display: 'inline-flex' }}>
              <span>Browse Shop Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="cc-orders-list">
            {orders.map((order) => {
              const currentStep = getStepForStatus(order.orderStatus);
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div key={order._id || order.orderId} className="cc-order-card glass-panel">
                  {/* Card Header */}
                  <div className="cc-order-header">
                    <div>
                      <span className="cc-order-id">Order #{order.orderId}</span>
                      <span className="cc-order-date">Placed on {formattedDate}</span>
                    </div>

                    <div className="cc-order-header-right">
                      <span className="cc-order-total">Total: <strong>₹{order.totalAmount}</strong></span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {order.orderStatus === 'pending' && (
                          <button 
                            className="cc-btn cc-btn--outline" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#EF4444', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleCancelOrder(order._id || order.orderId)}
                          >
                            <XCircle size={14} />
                            Cancel Order
                          </button>
                        )}
                        <Badge variant={getBadgeVariant(order.orderStatus)}>
                          {order.orderStatus ? order.orderStatus.toUpperCase() : 'PENDING'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Progress Timeline (if not cancelled) */}
                  {order.orderStatus !== 'cancelled' ? (
                    <div className="cc-order-timeline">
                      {steps.map((st, idx) => {
                        const isCompleted = idx + 1 <= currentStep;
                        const isCurrent = idx + 1 === currentStep;
                        return (
                          <div
                            key={st}
                            className={`cc-timeline-step ${isCompleted ? 'cc-timeline-step--done' : ''} ${isCurrent ? 'cc-timeline-step--current' : ''}`}
                          >
                            <div className="cc-timeline-dot">
                              {isCompleted ? <CheckCircle2 size={14} /> : <span>{idx + 1}</span>}
                            </div>
                            <span className="cc-timeline-label">{st}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EF4444', padding: '12px 16px', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)', margin: '14px 0' }}>
                      <AlertCircle size={18} />
                      <span>This order has been cancelled.</span>
                    </div>
                  )}

                  {/* Delivery details note */}
                  <div className="cc-order-delivery-note">
                    <Truck size={16} className="cc-delivery-icon" />
                    <span>
                      Delivery Address: <strong>{order.shippingAddress?.hostelName || 'Hostel'}, Room {order.shippingAddress?.roomNo || 'N/A'}, {order.shippingAddress?.collegeName || 'Campus'}</strong> ({order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid UPI'})
                    </span>
                  </div>

                  {/* Items in order */}
                  <div className="cc-order-items">
                    {order.items?.map((it, i) => (
                      <div key={i} className="cc-order-item-row">
                        <img src={it.image || '/images/realistic/arduino_uno.jpg'} alt={it.name} className="cc-order-item-img" />
                        <div className="cc-order-item-info">
                          <span className="cc-order-item-name">{it.name}</span>
                          <span className="cc-order-item-qty">Qty: {it.quantity} × ₹{it.price}</span>
                        </div>
                        <span className="cc-order-item-price">₹{it.quantity * it.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
