import React, { useState } from 'react';
import { X, UserPlus, Sparkles, CheckCircle, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { createMentor } from '../../services/mentorService';
import { useAuth } from '../../context/AuthContext';
import './AddMentorModal.css';

export const AddMentorModal = ({ isOpen, onClose, onMentorAdded }) => {
  const { user, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    whatsapp: '',
    linkedin: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAdmin) {
      setError('Access denied: Only an authorized Admin can add mentors.');
      return;
    }

    if (!formData.name.trim() || !formData.bio.trim()) {
      setError('Please provide Mentor Name and a short description.');
      return;
    }

    setLoading(true);

    try {
      const mentorPayload = {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        role: 'Hardware Mentor',
        college: '',
        whatsapp: formData.whatsapp.trim(),
        linkedin: formData.linkedin.trim()
      };

      await createMentor(mentorPayload);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onMentorAdded) onMentorAdded();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to add mentor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cc-modal-overlay" onClick={onClose}>
      <div
        className="cc-modal-card glass-panel"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-mentor-title"
        style={{ maxWidth: 540 }}
      >
        {/* Header */}
        <div className="cc-modal-header">
          <div className="cc-modal-header-left">
            <div className="cc-modal-icon-badge">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 id="add-mentor-title" className="cc-modal-title">
                Add New Mentor
              </h3>
              <p className="cc-modal-subtitle">
                Add mentor name, short bio, and direct WhatsApp & LinkedIn channels.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="cc-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback Notices */}
        {error && (
          <div className="cc-modal-alert cc-modal-alert--error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="cc-modal-alert cc-modal-alert--success">
            <CheckCircle size={18} />
            <span>Mentor added successfully! Updating live directory...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="cc-modal-form">
          <div className="cc-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Full Name */}
            <div className="cc-form-group cc-form-group--full">
              <label className="cc-form-label">
                Mentor Name <span className="cc-required">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="cc-input"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Short Description / Bio */}
            <div className="cc-form-group cc-form-group--full">
              <label className="cc-form-label">
                Short Description <span className="cc-required">*</span>
              </label>
              <textarea
                name="bio"
                required
                rows={3}
                className="cc-input cc-textarea"
                placeholder="Short 1-2 line description of the mentor's expertise (e.g. Guides students on ESP32, robotics rovers, and sensor circuits)..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>



            {/* WhatsApp */}
            <div className="cc-form-group cc-form-group--full">
              <label className="cc-form-label">WhatsApp Connection (Number or Link)</label>
              <input
                type="text"
                name="whatsapp"
                className="cc-input"
                placeholder="e.g. 919876543210 or https://wa.me/..."
                value={formData.whatsapp}
                onChange={handleChange}
              />
            </div>

            {/* LinkedIn */}
            <div className="cc-form-group cc-form-group--full">
              <label className="cc-form-label">LinkedIn Profile URL</label>
              <input
                type="url"
                name="linkedin"
                className="cc-input"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedin}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="cc-modal-footer">
            <button
              type="button"
              className="cc-btn cc-btn--outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cc-btn cc-btn--primary"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="cc-spinner" />
                  <span>Adding Mentor...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Register Mentor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
