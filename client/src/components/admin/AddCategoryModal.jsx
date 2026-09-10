import React, { useState, useRef } from 'react';
import { X, Layers, AlertCircle, CheckCircle, Loader2, Sparkles, Image as ImageIcon, Upload, Link as LinkIcon } from 'lucide-react';
import { createCategory } from '../../services/categoryService';
import { uploadMediaFiles } from '../../services/uploadService';
import { useAuth } from '../../context/AuthContext';
import './CategoryModal.css';

export const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded, nextOrder = 1 }) => {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    order: nextOrder,
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

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'name') {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: generatedSlug
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Upload directly to Cloudinary
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
        image: finalImageUrl || 'https://res.cloudinary.com/uzyiejkw/image/upload/v1789022736/upvolt/products/file_gt1k6x.jpg',
        order: Number(formData.order) || 1,
        isActive: formData.isActive
      };

      const newCategory = await createCategory(payload, token);
      setSuccess(true);
      setTimeout(() => {
        onCategoryAdded(newCategory);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to create category.');
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
              <h3 className="cc-modal-title">Create Product Category</h3>
              <p className="cc-modal-subtitle">
                Add a new category that immediately appears in store filters and homepage
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
            <span>Category created successfully! Syncing live catalog...</span>
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
              placeholder="e.g. Robotics & Drones, Wearables, AI Modules"
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
                placeholder="auto-generated-slug"
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
              placeholder="Brief description of products found in this category..."
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
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Image (Cloudinary)'}</span>
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
                id="addIsActive"
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Add Category</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
