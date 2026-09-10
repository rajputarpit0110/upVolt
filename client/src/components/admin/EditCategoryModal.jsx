import React, { useState, useEffect, useRef } from 'react';
import { X, Layers, AlertCircle, CheckCircle, Loader2, Save, Image as ImageIcon, Upload, Link as LinkIcon } from 'lucide-react';
import { updateCategory } from '../../services/categoryService';
import { uploadMediaFiles } from '../../services/uploadService';
import { useAuth } from '../../context/AuthContext';
import './CategoryModal.css';

export const EditCategoryModal = ({ isOpen, onClose, category, onCategoryUpdated }) => {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    order: 1,
    isActive: true
  });

  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        order: category.order ?? 1,
        isActive: category.isActive ?? true
      });
      setImageUrl(category.image || '');
      setImagePreview(category.image || '');
      setError('');
      setSuccess(false);
    }
  }, [category]);

  if (!isOpen || !category) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    try {
      setUploadingImage(true);
      setError('');
      const urls = await uploadMediaFiles([file]);
      if (urls && urls[0]) {
        setImageUrl(urls[0]);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Failed to upload image to Cloudinary: ' + (err.message || 'Unknown error'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let finalImageUrl = imageUrl;
      if (!finalImageUrl && imageFile) {
        setUploadingImage(true);
        const urls = await uploadMediaFiles([imageFile]);
        finalImageUrl = urls[0] || '';
        setUploadingImage(false);
      }

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim(),
        image: finalImageUrl || category.image,
        order: Number(formData.order) || 1,
        isActive: formData.isActive
      };

      const updated = await updateCategory(category._id, payload, token);
      setSuccess(true);
      setTimeout(() => {
        onCategoryUpdated(updated);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to update category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cc-modal-overlay" onClick={onClose}>
      <div className="cc-modal-card glass-panel cc-category-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cc-modal-header">
          <div className="cc-modal-header-left">
            <div className="cc-modal-icon-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#38BDF8' }}>
              <Layers size={22} />
            </div>
            <div className="cc-modal-title-group">
              <h3 className="cc-modal-title">Edit Category</h3>
              <p className="cc-modal-subtitle">
                Updating the category name will automatically sync linked products across the store
              </p>
            </div>
          </div>
          <button type="button" className="cc-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Feedback Notices */}
        {error && (
          <div className="cc-modal-alert cc-modal-alert--error" style={{ marginBottom: 18 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="cc-modal-alert cc-modal-alert--success" style={{ marginBottom: 18 }}>
            <CheckCircle size={18} />
            <span>Category updated successfully! Syncing live catalog...</span>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="cc-modal-form">
          {/* Category Name */}
          <div className="cc-form-group">
            <label className="cc-form-label">
              Category Name <span className="cc-required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Development Boards, Robotics, Sensors"
              className="cc-input"
              required
              autoFocus
            />
          </div>

          {/* URL Slug & Display Order */}
          <div className="cc-category-form-row">
            <div className="cc-form-group">
              <label className="cc-form-label">URL Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="slug"
                className="cc-input"
              />
            </div>
            <div className="cc-form-group">
              <label className="cc-form-label">Display Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="1"
                className="cc-input"
              />
            </div>
          </div>

          {/* Description */}
          <div className="cc-form-group">
            <label className="cc-form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Short description of products contained in this category..."
              className="cc-input cc-textarea"
            />
          </div>

          {/* Image Upload & URL */}
          <div className="cc-form-group">
            <label className="cc-form-label">Category Cover Image</label>
            <div className="cc-cat-image-box">
              {/* Preview Thumbnail */}
              <div className="cc-cat-preview-frame">
                {imagePreview || imageUrl ? (
                  <img
                    src={imagePreview || imageUrl}
                    alt="Category Preview"
                    className="cc-cat-preview-img"
                  />
                ) : (
                  <ImageIcon size={28} style={{ color: '#64748B' }} />
                )}
                {uploadingImage && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.65)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38BDF8'
                    }}
                  >
                    <Loader2 size={22} className="cc-spinner" />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="cc-cat-upload-controls">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="cc-btn cc-btn--outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  style={{ fontSize: '0.82rem', padding: '7px 14px', alignSelf: 'flex-start' }}
                >
                  <Upload size={14} />
                  <span>{uploadingImage ? 'Uploading...' : 'Replace Image (Cloudinary)'}</span>
                </button>

                <div className="cc-cat-url-wrapper">
                  <LinkIcon size={14} className="cc-cat-url-icon" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="Or paste Cloudinary / HTTPS image URL..."
                    className="cc-input cc-cat-url-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Status Switch Toggle */}
          <div className="cc-form-group" style={{ marginTop: 8 }}>
            <label className="cc-switch-label">
              <input
                type="checkbox"
                id="editIsActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="cc-switch-input"
              />
              <div className="cc-switch-slider" />
              <div className="cc-switch-text">
                <strong>Status: {formData.isActive ? 'Active (Live)' : 'Inactive (Hidden)'}</strong>
                <span>{formData.isActive ? 'Visible on storefront homepage and filter sidebar' : 'Hidden from storefront catalog'}</span>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="cc-modal-footer">
            <button
              type="button"
              className="cc-btn cc-btn--secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cc-btn cc-btn--primary"
              disabled={loading || uploadingImage}
              style={{ minWidth: 150 }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="cc-spinner" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
