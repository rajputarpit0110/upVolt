import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { getProductReviews } from '../../services/reviewService';
import WriteReviewModal from './WriteReviewModal';
import { useAuth } from '../../context/AuthContext';

const ProductReviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // For viewing uploaded images full screen
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [productId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getProductReviews(productId, page, 5);
      if (res.success) {
        setReviews(res.reviews || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = (newReview) => {
    // Refresh to show the newly added review
    fetchReviews();
  };

  return (
    <div className="cc-product-reviews glass-panel" style={{ padding: '30px', marginTop: '40px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={24} color="#00e5ff" />
          Customer Reviews
        </h3>

        <button
          onClick={() => setIsWriteModalOpen(true)}
          className="cc-btn cc-btn--primary"
          style={{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          Write a Review
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{ padding: '50px 0', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
          <Star size={48} style={{ margin: '0 auto 15px', opacity: 0.2 }} color="#fff" />
          <h4 style={{ margin: '0 0 10px', fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)' }}>No reviews yet</h4>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)' }}>Be the first to share your experience with this product!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviews.map(review => (
            <div key={review._id} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #00e5ff, #0055ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {review.user?.image || review.user?.avatar ? (
                      <img src={review.user.image || review.user.avatar} alt="User" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{review.user?.name || 'UpVolt User'}</h5>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={16}
                      fill={review.rating >= star ? "#ffc107" : "none"}
                      color={review.rating >= star ? "#ffc107" : "rgba(255,255,255,0.2)"}
                    />
                  ))}
                </div>
              </div>

              <p style={{ margin: '0 0 15px', lineHeight: '1.6', color: 'rgba(255,255,255,0.85)' }}>{review.comment}</p>

              {review.images && review.images.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {review.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <img src={img} alt="Review" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="cc-btn"
                style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)' }}
              >
                Prev
              </button>
              <span style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)' }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="cc-btn"
                style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        initialProductId={productId}
        onSuccess={handleReviewAdded}
      />

      {/* Image Lightbox */}
      {activeImage && (
        <div
          className="cc-modal-overlay"
          onClick={() => setActiveImage(null)}
          style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <img
            src={activeImage}
            alt="Review full screen"
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', objectFit: 'contain' }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setActiveImage(null)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

// Assuming X was imported but let's make sure it is for the lightbox
import { X } from 'lucide-react';

export default ProductReviews;
