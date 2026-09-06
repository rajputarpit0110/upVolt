import { Settings } from '../models/Settings.js';
import { AuditLog } from '../models/AuditLog.js';

// Helper to get or initialize default global settings
export const getOrCreateSettings = async () => {
  let settings = await Settings.findOne({ key: 'global' });
  if (!settings) {
    settings = await Settings.create({
      key: 'global',
      deliverySettings: {
        normalDeliveryFee: 40,
        fastDeliveryFee: 99,
        freeDeliveryThreshold: 499,
        normalDeliveryNote: 'Standard Delivery (2-3 Days across Delhi)',
        fastDeliveryNote: 'Express Superfast Delivery (Within 24 Hours)'
      },
      statsSettings: [
        { id: 'stat-1', icon: 'users', number: '5000+', label: 'Students Trust Us' },
        { id: 'stat-2', icon: 'graduation', number: '100+', label: 'Colleges Reached' },
        { id: 'stat-3', icon: 'package', number: '1000+', label: 'Products Delivered' },
        { id: 'stat-4', icon: 'heart', number: '4.8/5', label: 'Student Satisfaction' }
      ]
    });
  } else if (!settings.statsSettings || settings.statsSettings.length === 0) {
    settings.statsSettings = [
      { id: 'stat-1', icon: 'users', number: '5000+', label: 'Students Trust Us' },
      { id: 'stat-2', icon: 'graduation', number: '100+', label: 'Colleges Reached' },
      { id: 'stat-3', icon: 'package', number: '1000+', label: 'Products Delivered' },
      { id: 'stat-4', icon: 'heart', number: '4.8/5', label: 'Student Satisfaction' }
    ];
    await settings.save();
  }
  return settings;
};

// GET /api/settings/delivery - Public endpoint for checkout and frontend
export const getDeliverySettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json({
      success: true,
      deliverySettings: settings.deliverySettings
    });
  } catch (error) {
    console.error('Failed to get delivery settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery settings',
      deliverySettings: {
        normalDeliveryFee: 40,
        fastDeliveryFee: 99,
        freeDeliveryThreshold: 499,
        normalDeliveryNote: 'Standard Delivery (2-3 Days across Delhi)',
        fastDeliveryNote: 'Express Superfast Delivery (Within 24 Hours)'
      }
    });
  }
};

// PUT /api/settings/delivery - Admin only update delivery fees & config
export const updateDeliverySettings = async (req, res) => {
  try {
    const {
      normalDeliveryFee,
      fastDeliveryFee,
      freeDeliveryThreshold,
      normalDeliveryNote,
      fastDeliveryNote
    } = req.body;

    const settings = await getOrCreateSettings();

    if (normalDeliveryFee !== undefined) {
      settings.deliverySettings.normalDeliveryFee = Math.max(0, Number(normalDeliveryFee));
    }
    if (fastDeliveryFee !== undefined) {
      settings.deliverySettings.fastDeliveryFee = Math.max(0, Number(fastDeliveryFee));
    }
    if (freeDeliveryThreshold !== undefined) {
      settings.deliverySettings.freeDeliveryThreshold = Math.max(0, Number(freeDeliveryThreshold));
    }
    if (normalDeliveryNote !== undefined) {
      settings.deliverySettings.normalDeliveryNote = String(normalDeliveryNote);
    }
    if (fastDeliveryNote !== undefined) {
      settings.deliverySettings.fastDeliveryNote = String(fastDeliveryNote);
    }

    await settings.save();

    // Audit log if admin user is present
    if (req.user) {
      try {
        await AuditLog.create({
          action: 'DELIVERY_SETTINGS_UPDATED',
          adminId: req.user._id,
          adminName: req.user.name,
          adminEmail: req.user.email,
          adminRole: req.user.role,
          adminUsername: req.user.username || '',
          targetType: 'Settings',
          targetId: settings._id,
          targetName: 'Delivery Pricing Settings',
          details: {
            normalDeliveryFee: settings.deliverySettings.normalDeliveryFee,
            fastDeliveryFee: settings.deliverySettings.fastDeliveryFee,
            freeDeliveryThreshold: settings.deliverySettings.freeDeliveryThreshold,
            normalDeliveryNote: settings.deliverySettings.normalDeliveryNote,
            fastDeliveryNote: settings.deliverySettings.fastDeliveryNote
          }
        });
      } catch (auditErr) {
        console.warn('Could not record delivery settings update in audit log:', auditErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Delivery settings updated successfully',
      deliverySettings: settings.deliverySettings
    });
  } catch (error) {
    console.error('Failed to update delivery settings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update delivery settings'
    });
  }
};

// GET /api/settings/stats - Public endpoint for homepage StatsBar
export const getStatsSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json({
      success: true,
      stats: settings.statsSettings || []
    });
  } catch (error) {
    console.error('Failed to get stats settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch homepage stats',
      stats: [
        { id: 'stat-1', icon: 'users', number: '5000+', label: 'Students Trust Us' },
        { id: 'stat-2', icon: 'graduation', number: '100+', label: 'Colleges Reached' },
        { id: 'stat-3', icon: 'package', number: '1000+', label: 'Products Delivered' },
        { id: 'stat-4', icon: 'heart', number: '4.8/5', label: 'Student Satisfaction' }
      ]
    });
  }
};

// PUT /api/settings/stats - Admin only update homepage stats
export const updateStatsSettings = async (req, res) => {
  try {
    const { stats } = req.body;
    if (!Array.isArray(stats) || stats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Stats must be a non-empty array of stat items'
      });
    }

    const settings = await getOrCreateSettings();
    settings.statsSettings = stats.map((item, idx) => ({
      id: item.id || `stat-${idx + 1}`,
      icon: item.icon || 'users',
      number: String(item.number || ''),
      label: String(item.label || '')
    }));

    await settings.save();

    if (req.user) {
      try {
        await AuditLog.create({
          action: 'HOMEPAGE_STATS_UPDATED',
          adminId: req.user._id,
          adminName: req.user.name,
          adminEmail: req.user.email,
          adminRole: req.user.role,
          adminUsername: req.user.username || '',
          targetType: 'Settings',
          targetId: settings._id,
          targetName: 'Homepage Stats Bar',
          details: { stats: settings.statsSettings }
        });
      } catch (auditErr) {
        console.warn('Could not record stats update in audit log:', auditErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Homepage stats updated successfully',
      stats: settings.statsSettings
    });
  } catch (error) {
    console.error('Failed to update stats settings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update homepage stats'
    });
  }
};
