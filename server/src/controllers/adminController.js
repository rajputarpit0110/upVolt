import { AuditLog } from '../models/AuditLog.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

// GET /api/admin/audit-logs (Restricted to Master Admin)
export const getAuditLogs = async (req, res) => {
  try {
    const { action, adminEmail, page = 1, limit = 100 } = req.query;
    const query = {};

    if (action) {
      query.action = action;
    }

    if (adminEmail) {
      query.adminEmail = adminEmail.toLowerCase().trim();
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 100));
    const skipNum = (pageNum - 1) * limitNum;

    const totalCount = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      count: logs.length,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      logs
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/stats (Admin & Master Admin)
export const getAdminStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'completed' });

    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // All 3 admins can see the full administrator roster
    const admins = await User.find({ role: { $in: ['admin', 'master_admin'] } })
      .select('name email username role createdAt')
      .sort({ role: -1, createdAt: 1 });

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        admins
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
