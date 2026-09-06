import React, { useState } from 'react';
import { X, Film, Sparkles, CheckCircle, AlertCircle, Loader2, Video, Wrench } from 'lucide-react';
import { createReel } from '../../services/reelService';
import { useAuth } from '../../context/AuthContext';
import './AddReelModal.css';

const PRESET_VIDEOS = [
  { label: 'Soldering Build', url: '/videos/reels/reel_soldering.mp4' },
  { label: '4WD Robot Car', url: '/videos/reels/reel_robot.mp4' },
  { label: 'IoT Sensor Node', url: '/videos/reels/reel_pcb.mp4' },
  { label: 'Microcontroller Pinout', url: '/videos/reels/reel_assembly.mp4' },
  { label: 'Multimeter Testing', url: '/videos/reels/reel_testing.mp4' }
];

const DIFFICULTY_OPTIONS = [
  'Beginner Friendly',
  'Beginner',
  'Intermediate',
  'Advanced'
];

export const AddReelModal = ({ isOpen, onClose, onReelAdded }) => {
  const { isAdmin, token } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    componentsInput: '',
    difficulty: 'Beginner Friendly',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectPreset = (url) => {
    setFormData(prev => ({ ...prev, videoUrl: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAdmin) {
      setError('Access denied: Only an authorized Admin can add reels.');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please provide a reel title.');
      return;
    }

    if (!formData.videoUrl.trim()) {
      setError('Please provide a video URL or select a preset video.');
      return;
    }

    setLoading(true);

    try {
      // Parse components from comma-separated string
      const components = formData.componentsInput
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

      const reelPayload = {
        title: formData.title.trim(),
        videoUrl: formData.videoUrl.trim(),
        components: components.length > 0 ? components : ['Custom Hardware Component'],
        difficulty: formData.difficulty || 'Beginner Friendly',
        description: formData.description.trim() || 'Watch makers assemble and test this hardware project build.'
      };

      await createReel(reelPayload, token);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setFormData({
          title: '',
          videoUrl: '',
          componentsInput: '',
          difficulty: 'Beginner Friendly',
          description: ''
        });
        onClose();
        if (onReelAdded) onReelAdded();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to add reel. Please try again.');
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
        aria-labelledby="add-reel-title"
        style={{ maxWidth: 560 }}
      >
        {/* Header */}
        <div className="cc-modal-header">
          <div className="cc-modal-header-left">
            <div className="cc-modal-icon-badge" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
              <Film size={20} />
            </div>
            <div>
              <h3 id="add-reel-title" className="cc-modal-title">
                Add Maker Reel
              </h3>
              <p className="cc-modal-subtitle">
                Publish a short project build reel to the community showcase.
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
            <span>Reel published successfully! Updating community feed...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="cc-modal-form">
          <div className="cc-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Reel Title */}
            <div className="cc-form-group cc-form-group--full">
              <label className="cc-form-label">
                Reel Title <span className="cc-required">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                className="cc-input"
                placeholder="e.g. Assembling IoT Smart Plant Monitor"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Video URL */}
            <div className="cc-form-group cc-form-group--full">
              <label className="cc-form-label">
                Video URL / Path <span className="cc-required">*</span>
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  name="videoUrl"
                  required
                  className="cc-input"
                  placeholder="e.g. /videos/reels/reel_soldering.mp4 or https://..."
                  value={formData.videoUrl}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                />
              </div>

              {/* Presets Row */}
              <div className="cc-reel-presets-row">
                <span className="cc-reel-preset-label">Local Presets:</span>
                {PRESET_VIDEOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`cc-reel-preset-btn ${formData.videoUrl === preset.url ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(preset.url)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty & Components in 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="cc-form-group">
                <label className="cc-form-label">
                  Skill Level
                </label>
                <select
                  name="difficulty"
                  className="cc-input"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  {DIFFICULTY_OPTIONS.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cc-form-group">
                <label className="cc-form-label">
                  Components Used (CSV)
                </label>
                <input
                  type="text"
                  name="componentsInput"
                  className="cc-input"
                  placeholder="e.g. ESP32, Relay, OLED"
                  value={formData.componentsInput}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Project Description */}
            <div className="cc-form-group cc-form-group--full">
              <label className="cc-form-label">
                Build Description
              </label>
              <textarea
                name="description"
                rows={3}
                className="cc-input cc-textarea"
                placeholder="Brief explanation of what makers are building, soldering, or testing in this reel..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Video Preview if URL provided */}
            {formData.videoUrl && (
              <div className="cc-reel-preview-wrap">
                <span className="cc-reel-preview-label">
                  <Video size={13} /> Video Preview:
                </span>
                <video
                  src={formData.videoUrl}
                  controls
                  muted
                  style={{
                    maxHeight: 140,
                    width: '100%',
                    borderRadius: 8,
                    background: '#000',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    // Video load error handling
                  }}
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="cc-modal-footer" style={{ marginTop: 20 }}>
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
              disabled={loading || !formData.title.trim() || !formData.videoUrl.trim()}
              style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                borderColor: 'transparent'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="cc-spinner" />
                  <span>Publishing Reel...</span>
                </>
              ) : (
                <>
                  <Film size={16} />
                  <span>Publish Reel</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
