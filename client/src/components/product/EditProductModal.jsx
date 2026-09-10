import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Sparkles, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, Trash2, ShieldAlert, Upload, Link as LinkIcon, Star } from 'lucide-react';
import { CATEGORIES } from '../../data/mockProducts';
import { updateProduct } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { uploadMediaFiles } from '../../services/uploadService';
import { useAuth } from '../../context/AuthContext';
import './AddProductModal.css';

export const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
  const { user, isAdmin, token } = useAuth();

  const [categories, setCategories] = useState(CATEGORIES);
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0]?.name || 'Development Boards',
    price: '',
    originalPrice: '',
    sku: '',
    badge: '',
    description: '',
    specificationsStr: '',
    tagsStr: '',
    perfectForStr: '',
    youtubeUrl: '',
    researchUrl: '',
    datasheetUrl: '',
    documentationUrl: '',
    howToUseOverview: '',
    howToUseStepsStr: '',
    whereToUseStr: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories().then(res => {
        if (res && res.categories && res.categories.length > 0) {
          setCategories(res.categories);
        }
      }).catch(err => console.warn('Failed to load categories in edit modal:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || CATEGORIES[0]?.name || 'Development Boards',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        sku: product.sku || '',
        badge: product.badge || '',
        description: product.description || '',
        specificationsStr: product.specifications ? Object.entries(product.specifications).map(([k, v]) => `${k}: ${v}`).join('\n') : '',
        tagsStr: product.tags ? product.tags.join(', ') : '',
        perfectForStr: product.perfectFor ? product.perfectFor.join(', ') : '',
        youtubeUrl: product.youtubeUrl || '',
        researchUrl: product.researchUrl || '',
        datasheetUrl: product.datasheetUrl || '',
        documentationUrl: product.documentationUrl || '',
        howToUseOverview: product.howToUse?.overview || '',
        howToUseStepsStr: product.howToUse?.steps ? product.howToUse.steps.join('\n') : '',
        whereToUseStr: product.whereToUse ? product.whereToUse.map(u => `${u.title}: ${u.description}`).join('\n') : ''
      });
      setImages(product.images || [product.image].filter(Boolean));
    }
  }, [product]);

  // Multiple images array - starts empty so NO default photo is pre-selected!
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Convert & optimize device image files to high-quality Data URLs
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
          const MAX_SIZE = 1200;
          let width = img.width;
          let height = img.height;

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
        img.onerror = () => {
          resolve(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeviceFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploadingFiles(true);
    setError('');

    const validFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setError('Please select valid image files (JPG, PNG, WEBP, or SVG).');
      setUploadingFiles(false);
      return;
    }

    try {
      const uploadedUrls = await uploadMediaFiles(validFiles);
      if (uploadedUrls.length > 0) {
        setImages(prev => [...prev, ...uploadedUrls]);
      }
    } catch (err) {
      console.error('File upload failed in EditProductModal:', err);
      setError(err.message || 'Failed to upload image files to server/CDN.');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      setImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleSetPrimary = (index) => {
    if (index === 0 || index >= images.length) return;
    const next = [...images];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    setImages(next);
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAdmin) {
      setError('Access denied: Only an authorized Admin can edit components.');
      return;
    }

    if (!formData.name.trim() || !formData.category || !formData.price) {
      setError('Please fill in the Product Name, Category, and Price.');
      return;
    }

    if (images.length === 0) {
      setError('Please choose or upload at least one product photo from your device.');
      return;
    }

    setLoading(true);

    try {
      const specifications = {};
      if (formData.specificationsStr) {
        formData.specificationsStr.split('\n').forEach(line => {
          const parts = line.split(':');
          if (parts.length >= 2) {
            const k = parts[0].trim();
            const v = parts.slice(1).join(':').trim();
            if (k && v) specifications[k] = v;
          }
        });
      }

      const tags = formData.tagsStr
        ? formData.tagsStr.split(',').map(t => t.trim()).filter(Boolean)
        : [];
      const perfectFor = formData.perfectForStr
        ? formData.perfectForStr.split(',').map(p => p.trim()).filter(Boolean)
        : [];

      const steps = formData.howToUseStepsStr?.trim()
        ? formData.howToUseStepsStr.split('\n').map(s => s.trim()).filter(Boolean)
        : (product.howToUse?.steps || undefined);

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        sku: formData.sku.trim() || undefined,
        image: images[0],
        images: images,
        badge: formData.badge || null,
        description: formData.description.trim() || `${formData.name} for electronics engineering projects.`,
        specifications,
        tags,
        perfectFor,
        youtubeUrl: formData.youtubeUrl.trim() || null,
        researchUrl: formData.researchUrl.trim() || null,
        datasheetUrl: formData.datasheetUrl.trim() || null,
        documentationUrl: formData.documentationUrl.trim() || null,
        howToUse: (formData.howToUseOverview.trim() || (steps && steps.length > 0)) ? {
          ...(product.howToUse || {}),
          overview: formData.howToUseOverview.trim() || undefined,
          steps: steps && steps.length > 0 ? steps : undefined
        } : null,
        whereToUse: formData.whereToUseStr.trim() ? formData.whereToUseStr.split('\n').filter(Boolean).map(item => {
          const parts = item.split(':');
          return {
            title: parts[0]?.trim() || item.trim(),
            description: parts.slice(1).join(':')?.trim() || 'Practical engineering use case',
            category: 'Engineering Project'
          };
        }) : [],
        inStock: true
      };

      const savedProduct = await updateProduct(product._id || product.id, payload, token);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onProductUpdated(savedProduct);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to save product to database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cc-modal-overlay" onClick={onClose}>
      <div className="cc-modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cc-modal-header">
          <div className="cc-modal-title-group">
            <div className="cc-modal-icon-badge">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="cc-modal-title">Edit Hardware Component</h2>
              <p className="cc-modal-subtitle">
                {isAdmin
                  ? `Logged in as ${user?.name}`
                  : 'Requires Admin privilege'}
              </p>
            </div>
          </div>
          <button type="button" className="cc-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {!isAdmin && (
          <div className="cc-modal-alert cc-modal-alert--error" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={20} />
            <div>
              <strong>Admin Authentication Required:</strong> You must be logged in as an authorized Admin to edit hardware components.
            </div>
          </div>
        )}

        {error && (
          <div className="cc-modal-alert cc-modal-alert--error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="cc-modal-alert cc-modal-alert--success">
            <CheckCircle size={18} />
            <span>Product & multiple images saved to MongoDB successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="cc-modal-form">
          <div className="cc-form-row">
            <div className="cc-form-group flex-2">
              <label className="cc-form-label">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                className="cc-input"
                placeholder="e.g., STM32 Blue Pill ARM Dev Board"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="cc-form-group flex-1">
              <label className="cc-form-label">Category *</label>
              <select
                name="category"
                className="cc-input cc-select"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map(cat => (
                  <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="cc-form-row">
            <div className="cc-form-group">
              <label className="cc-form-label">Price (₹) *</label>
              <input
                type="number"
                name="price"
                required
                min="1"
                className="cc-input"
                placeholder="e.g., 299"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div className="cc-form-group">
              <label className="cc-form-label">Original Price (₹)</label>
              <input
                type="number"
                name="originalPrice"
                min="1"
                className="cc-input"
                placeholder="e.g., 450"
                value={formData.originalPrice}
                onChange={handleChange}
              />
            </div>
            <div className="cc-form-group">
              <label className="cc-form-label">SKU (Auto if blank)</label>
              <input
                type="text"
                name="sku"
                className="cc-input"
                placeholder="e.g., CC-DEV-STM32"
                value={formData.sku}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Multiple Images Showcase & Device Upload */}
          <div className="cc-form-group cc-image-upload-section">
            <div className="cc-image-section-header">
              <label className="cc-form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                <ImageIcon size={16} />
                <span>Product Images {images.length > 0 ? `(${images.length} selected)` : ''} *</span>
              </label>
              <span className="cc-image-section-help">
                First photo is the primary showcase image
              </span>
            </div>

            {/* Hidden native file input for device selection */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleDeviceFiles(e.target.files)}
            />

            {/* Thumbnail Preview Gallery (shown when images exist) */}
            {images.length > 0 && (
              <div className="cc-thumbnails-gallery">
                {images.map((imgUrl, index) => (
                  <div
                    key={index}
                    className={`cc-thumbnail-card ${index === 0 ? 'is-primary' : ''}`}
                  >
                    <div className="cc-thumbnail-img-wrap">
                      <img
                        src={imgUrl}
                        alt={`Product preview ${index + 1}`}
                      />
                    </div>

                    {index === 0 ? (
                      <span className="cc-thumbnail-badge cc-badge-primary">
                        <Star size={10} fill="#fff" /> Primary
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="cc-thumbnail-set-primary-btn"
                        onClick={() => handleSetPrimary(index)}
                        title="Set as primary showcase image"
                      >
                        Set Primary
                      </button>
                    )}

                    <button
                      type="button"
                      className="cc-thumbnail-delete-btn"
                      onClick={() => handleRemoveImage(index)}
                      title="Remove this photo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Device Upload Drag-and-Drop Area */}
            <div
              className={`cc-device-upload-zone ${isDragging ? 'is-dragging' : ''} ${images.length > 0 ? 'is-compact' : ''}`}
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
                  {uploadingFiles
                    ? 'Processing photo(s) from device...'
                    : (images.length === 0 ? 'Choose photo from Device or drag & drop here' : 'Choose more photos from device')}
                </p>
                <p className="cc-upload-sub-text">
                  Supports JPG, PNG, WEBP, SVG • Click to open device file picker
                </p>
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

            {/* Optional URL toggle for external links */}
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
                    placeholder="https://example.com/hardware-component.png"
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
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="cc-form-row">
            <div className="cc-form-group flex-1">
              <label className="cc-form-label">Badge (Optional)</label>
              <select
                name="badge"
                className="cc-input cc-select"
                value={formData.badge}
                onChange={handleChange}
              >
                <option value="">None</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Popular">Popular</option>
                <option value="Hot">Hot</option>
                <option value="New">New</option>
              </select>
            </div>
          </div>

          <div className="cc-form-group">
            <label className="cc-form-label">Description</label>
            <textarea
              name="description"
              rows={3}
              className="cc-input cc-textarea"
              placeholder="Detailed description of features, pinouts, and campus projects..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="cc-form-row">
            <div className="cc-form-group flex-1">
              <label className="cc-form-label">Key Specifications (Key: Value per line)</label>
              <textarea
                name="specificationsStr"
                rows={3}
                className="cc-input cc-textarea cc-mono"
                placeholder={"Operating Voltage: 5V\nMicrocontroller: IC Chip\nInterface: I2C / SPI"}
                value={formData.specificationsStr}
                onChange={handleChange}
              />
            </div>
            <div className="cc-form-group flex-1">
              <label className="cc-form-label">Tags (comma-separated)</label>
              <input
                type="text"
                name="tagsStr"
                className="cc-input"
                placeholder="e.g., Electronics, College, Prototyping"
                value={formData.tagsStr}
                onChange={handleChange}
              />
              <div style={{ marginTop: 8 }}>
                <label className="cc-form-label">Perfect For (comma-separated)</label>
                <input
                  type="text"
                  name="perfectForStr"
                  className="cc-input"
                  placeholder="e.g., Mini Projects, Engineering Lab"
                  value={formData.perfectForStr}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Video Tutorial Link */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, marginTop: 8 }}>
            <div className="cc-form-group">
              <label className="cc-form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#EF4444', fontWeight: 'bold' }}>▶</span>
                <span>YouTube Video Tutorial Link (Optional)</span>
              </label>
              <input
                type="url"
                name="youtubeUrl"
                className="cc-input"
                placeholder="e.g., https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={formData.youtubeUrl}
                onChange={handleChange}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Yeh link product ke "How to Use & Video" tab me playable YouTube player banayega.
              </span>
            </div>
          </div>

          {/* Research & Datasheet Links (Alag Alag Options) */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, marginTop: 12 }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              Research & Datasheet Documentation Links (Alag-Alag Cards ke Links)
            </h4>

            {/* Option 1: Official Manufacturer Datasheet */}
            <div className="cc-form-group" style={{ marginBottom: 14 }}>
              <label className="cc-form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <span style={{ color: '#EF4444' }}>📄</span>
                  <span>1. Official Manufacturer Datasheet URL (PDF)</span>
                </span>
                <span style={{ fontSize: '0.75rem', color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  Card 1: Verified Datasheet
                </span>
              </label>
              <input
                type="url"
                name="datasheetUrl"
                className="cc-input"
                placeholder="https://example.com/datasheet.pdf (IC / Sensor manufacturer official PDF)"
                value={formData.datasheetUrl}
                onChange={handleChange}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                UI ke pehle card ("Official Manufacturer Datasheet") ke "Open Official Datasheet" button par yeh link open hoga.
              </span>
            </div>

            {/* Option 2: Academic & IEEE Research Paper */}
            <div className="cc-form-group" style={{ marginBottom: 14 }}>
              <label className="cc-form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <span style={{ color: '#3B82F6' }}>📖</span>
                  <span>2. Academic & IEEE Research Paper URL</span>
                </span>
                <span style={{ fontSize: '0.75rem', color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  Card 2: Academic Paper
                </span>
              </label>
              <input
                type="url"
                name="researchUrl"
                className="cc-input"
                placeholder="https://ieeexplore.ieee.org/document/... (IEEE / Google Scholar research paper)"
                value={formData.researchUrl}
                onChange={handleChange}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                UI ke doosre card ("Academic & IEEE Research Paper") ke "Open Research Publication" button par yeh link open hoga.
              </span>
            </div>

            {/* Option 3: GitHub & Developer Docs */}
            <div className="cc-form-group" style={{ marginBottom: 14 }}>
              <label className="cc-form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <span style={{ color: '#8B5CF6' }}>💻</span>
                  <span>3. GitHub Library & Driver Documentation URL</span>
                </span>
                <span style={{ fontSize: '0.75rem', color: '#8B5CF6', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  Card 3: GitHub / Docs
                </span>
              </label>
              <input
                type="url"
                name="documentationUrl"
                className="cc-input"
                placeholder="https://github.com/username/repository (Arduino / ESP32 driver repo)"
                value={formData.documentationUrl}
                onChange={handleChange}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                UI ke teesre card ("Official Driver & GitHub Library") ke "Open Documentation & Code" button par yeh link open hoga.
              </span>
            </div>
          </div>

          {/* How & Where to Use Guide */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, marginTop: 12 }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              Component Setup Guide & Practical Use Cases (Optional)
            </h4>

            <div className="cc-form-group">
              <label className="cc-form-label">How to Use (Brief Overview)</label>
              <textarea
                name="howToUseOverview"
                rows={2}
                className="cc-input cc-textarea"
                placeholder="e.g., Connect to PC via micro-USB, wire sensors to I2C pins, and upload code in Arduino IDE..."
                value={formData.howToUseOverview}
                onChange={handleChange}
              />
            </div>

            <div className="cc-form-group" style={{ marginTop: 6 }}>
              <label className="cc-form-label">How to Use (Step-by-Step Instructions, one step per line)</label>
              <textarea
                name="howToUseStepsStr"
                rows={2}
                className="cc-input cc-textarea cc-mono"
                placeholder={"1. Plug in USB cable to PC\n2. Open Arduino IDE and select board\n3. Click upload"}
                value={formData.howToUseStepsStr}
                onChange={handleChange}
              />
            </div>

            <div className="cc-form-group" style={{ marginTop: 6 }}>
              <label className="cc-form-label">Where to Use / Applications (Title: Description per line)</label>
              <textarea
                name="whereToUseStr"
                rows={2}
                className="cc-input cc-textarea cc-mono"
                placeholder={"IoT & Smart Home: Automated home appliances\nRobotics: Autonomous line following bot"}
                value={formData.whereToUseStr}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="cc-modal-footer">
            <button
              type="button"
              className="cc-btn cc-btn--secondary cc-modal-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cc-btn cc-btn--primary cc-modal-btn-save"
              disabled={loading || success || !isAdmin}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving to MongoDB...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle size={16} />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Save to Database</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
