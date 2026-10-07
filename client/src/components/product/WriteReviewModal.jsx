import React, { useState, useEffect, useRef } from 'react';
import { X, Star, Upload, Trash2, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getEligibleProducts, createReview } from '../../services/reviewService';
import Toast from '../common/Toast';

const WriteReviewModal = ({ isOpen, onClose, initialProductId, onSuccess }) => {
  const { user } = useAuth();
  const [eligibleProducts, setEligibleProducts] = useState([]);
  const [loadingEligible, setLoadingEligible] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(initialProductId || '');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchEligibleProducts();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (initialProductId && eligibleProducts.some(p => p._id === initialProductId)) {
      setSelectedProduct(initialProductId);
    } else if (eligibleProducts.length > 0 && !selectedProduct) {
      setSelectedProduct('');
    }
  }, [initialProductId, eligibleProducts]);

  const fetchEligibleProducts = async () => {
    try {
      setLoadingEligible(true);
      const res = await getEligibleProducts(user.token);
      if (res.success) {
        setEligibleProducts(res.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEligible(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      setError('You can upload a maximum of 3 images.');
      return;
    }

    setError('');
    const newImages = [];

    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Each image must be less than 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        if (newImages.length === files.length) {
          setImages(prev => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError('Please select a product to review.');
      return;
    }
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a review comment.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const res = await createReview(user.token, {
        productId: selectedProduct,
        rating,
        comment,
        images
      });

      if (res.success) {
        setToast({ type: 'success', message: 'Review submitted successfully!' });
        setTimeout(() => {
          setToast(null);
          onSuccess && onSuccess(res.review);
          handleClose();
        }, 2000);
      } else {
        setError(res.message || 'Failed to submit review.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setImages([]);
    setError('');
    setSelectedProduct('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cc-modal-overlay">
      <div className="cc-modal glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '24px' }}>
        <button onClick={handleClose} className="cc-modal-close" aria-label="Close">
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', color: '#fff' }}>Write a Review</h2>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {!user ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.7)' }}>
            <p>Please login to write a review.</p>
          </div>
        ) : loadingEligible ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.7)' }}>
            Loading your eligible products...
          </div>
        ) : eligibleProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.7)' }}>
            <Info size={40} style={{ margin: '0 auto 15px', opacity: 0.5 }} />
            <p style={{ marginBottom: '10px' }}>You haven't ordered any products yet, or they haven't been delivered.</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>You can only review products that you have successfully received.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {error && <div className="cc-form-error" style={{ color: '#ff4d4d', fontSize: '0.9rem', padding: '10px', background: 'rgba(255,0,0,0.1)', borderRadius: '6px' }}>{error}</div>}

            {/* Product Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Select Product *</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem' }}
                required
              >
                <option value="" disabled>-- Choose a delivered product --</option>
                {eligibleProducts.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Rating *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Star
                      size={28}
                      fill={(hoverRating || rating) >= star ? "#ffc107" : "none"}
                      color={(hoverRating || rating) >= star ? "#ffc107" : "rgba(255,255,255,0.3)"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Your Review *</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike? How did you use it in your project?"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', minHeight: '100px', resize: 'vertical' }}
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Add Photos (up to 3)</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {images.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={img} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {images.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
                  >
                    <Upload size={20} style={{ marginBottom: '4px' }} />
                    <span style={{ fontSize: '0.7rem' }}>Add</span>
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedProduct || rating === 0 || !comment.trim()}
              className="cc-btn cc-btn--primary"
              style={{ width: '100%', marginTop: '10px', padding: '14px', fontSize: '1rem', fontWeight: 600 }}
            >
              {isSubmitting ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default WriteReviewModal;
