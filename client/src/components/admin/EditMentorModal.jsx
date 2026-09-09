import React, { useState, useEffect } from 'react';
import { X, Edit, Sparkles, CheckCircle, AlertCircle, Loader2, ShieldAlert, Image as ImageIcon, Trash2, Upload, Link as LinkIcon } from 'lucide-react';
import { updateMentor } from '../../services/mentorService';
import { useAuth } from '../../context/AuthContext';
import './AddMentorModal.css';

export const EditMentorModal = ({ isOpen, onClose, mentor, onMentorUpdated }) => {
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

  const [image, setImage] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (mentor) {
      setFormData({
        name: mentor.name || '',
        bio: mentor.bio || mentor.description || '',
        whatsapp: mentor.socialLinks?.whatsapp || '',
        linkedin: mentor.socialLinks?.linkedin || ''
      });
      setImage(mentor.image || '');
    }
  }, [mentor]);

  if (!isOpen || !mentor) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const compressImageFile = (file) => {
    return new Promise((resolve) => {
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800; // Smaller size for mentor avatars
          let width = img.width;
          let height = img.height;

          // Make it a square if we want, or just preserve aspect ratio
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(dataUrl);
        };
        img.onerror = () => resolve(event.target.result);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeviceFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploadingFiles(true);
    setError('');

    const file = fileList[0]; // Single image for mentor
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP, or SVG).');
      setUploadingFiles(false);
      return;
    }

    try {
      const processed = await compressImageFile(file);
      setImage(processed);
    } catch (err) {
      setError('Failed to process image file.');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      handleDeviceFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrlImage = () => {
    if (newImageUrl.trim()) {
      setImage(newImageUrl.trim());
      setNewImageUrl('');
      setShowUrlInput(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAdmin) {
      setError('Access denied: Only an authorized Admin can edit mentors.');
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
        whatsapp: formData.whatsapp.trim(),
        linkedin: formData.linkedin.trim(),
        image: image || undefined
      };

      await updateMentor(mentor._id || mentor.id, mentorPayload);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onMentorUpdated) onMentorUpdated();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update mentor. Please try again.');
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
        aria-labelledby="edit-mentor-title"
        style={{ maxWidth: 540 }}
      >
        {/* Header */}
        <div className="cc-modal-header">
          <div className="cc-modal-header-left">
            <div className="cc-modal-icon-badge">
              <Edit size={20} />
            </div>
            <div>
              <h3 id="edit-mentor-title" className="cc-modal-title">
                Edit Mentor
              </h3>
              <p className="cc-modal-subtitle">
                Update mentor name, short bio, and direct channels.
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
            <span>Mentor updated successfully! Updating live directory...</span>
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
                placeholder="Short 1-2 line description of the mentor's expertise..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            {/* Image Upload Section */}
            <div className="cc-form-group cc-image-upload-section cc-form-group--full">
              <div className="cc-image-section-header">
                <label className="cc-form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                  <ImageIcon size={16} />
                  <span>Mentor Photo {image ? '(Selected)' : ''}</span>
                </label>
                <span className="cc-image-section-help">Upload a professional headshot</span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleDeviceFiles(e.target.files)}
              />

              {image ? (
                <div className="cc-thumbnails-gallery" style={{ justifyContent: 'center', margin: '12px 0' }}>
                  <div className="cc-thumbnail-card is-primary" style={{ width: 120, height: 120, borderRadius: '50%' }}>
                    <div className="cc-thumbnail-img-wrap" style={{ borderRadius: '50%' }}>
                      <img src={image} alt="Mentor preview" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <button
                      type="button"
                      className="cc-thumbnail-delete-btn"
                      onClick={() => setImage('')}
                      title="Remove photo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`cc-device-upload-zone ${isDragging ? 'is-dragging' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="cc-upload-icon-circle">
                    {uploadingFiles ? <Loader2 size={22} className="animate-spin" /> : <Upload size={22} />}
                  </div>
                  <div className="cc-upload-text-group">
                    <p className="cc-upload-main-text">
                      {uploadingFiles ? 'Processing photo...' : 'Choose photo or drag & drop here'}
                    </p>
                    <p className="cc-upload-sub-text">Supports JPG, PNG, WEBP, SVG</p>
                  </div>
                  <button
                    type="button"
                    className="cc-btn cc-btn--primary cc-browse-device-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload size={14} />
                    <span>Browse Device</span>
                  </button>
                </div>
              )}

              <div className="cc-url-toggle-bar">
                <button
                  type="button"
                  className="cc-url-toggle-btn"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                >
                  <LinkIcon size={12} />
                  <span>{showUrlInput ? 'Hide image URL input' : 'Or enter Image URL instead'}</span>
                </button>

                {showUrlInput && (
                  <div className="cc-url-input-row">
                    <input
                      type="url"
                      className="cc-input"
                      placeholder="https://example.com/photo.png"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrlImage();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="cc-btn cc-btn--secondary"
                      onClick={handleAddUrlImage}
                      disabled={!newImageUrl.trim()}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <span>Set URL</span>
                    </button>
                  </div>
                )}
              </div>
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
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Edit size={16} />
                  <span>Update Mentor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
