import mongoose from 'mongoose';
import { Coupon } from '../models/Coupon.js';
import { AuditLog } from '../models/AuditLog.js';

// Default starter coupons if collection is empty
const getStarterCoupons = () => {
  const today = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setDate(today.getDate() + 30);

  const endOfYear = new Date();
  endOfYear.setFullYear(today.getFullYear() + 1);

  return [
    {
      code: 'CAMPUS10',
      discountType: 'percentage',
      discountValue: 10,
      validFrom: today,
      validUntil: endOfYear,
      minOrderAmount: 0,
      maxDiscountAmount: 250,
      description: '10% Student Welcome Discount across all components',
      isActive: true,
      createdByName: 'CampusCircuit System'
    },
    {
      code: 'MAKER50',
      discountType: 'fixed',
      discountValue: 50,
      validFrom: today,
      validUntil: oneMonthLater,
      minOrderAmount: 399,
      description: 'Flat ₹50 OFF on orders above ₹399',
      isActive: true,
      createdByName: 'CampusCircuit System'
    }
  ];
};

// Compute dynamic status string based on dates
const getCouponStatus = (coupon) => {
  if (!coupon.isActive) return 'Disabled';
  const now = new Date();
  const from = new Date(coupon.validFrom);
  const until = new Date(coupon.validUntil);

  if (now < from) return 'Upcoming';
  if (now > until) return 'Expired';
  return 'Active';
};

// GET /api/coupons - List all coupons (Admin protected)
export const getCoupons = async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const count = await Coupon.countDocuments();
      if (count === 0) {
        await Coupon.insertMany(getStarterCoupons());
      }

      const rawCoupons = await Coupon.find().sort({ createdAt: -1 });
      const coupons = rawCoupons.map(c => {
        const obj = c.toObject();
        obj.computedStatus = getCouponStatus(c);
        return obj;
      });

      return res.status(200).json({
        success: true,
        count: coupons.length,
        coupons
      });
    }

    // Fallback if database disconnected
    const fallback = getStarterCoupons().map((c, idx) => ({
      ...c,
      _id: `fallback-coupon-${idx + 1}`,
      computedStatus: getCouponStatus(c)
    }));
    return res.status(200).json({
      success: true,
      count: fallback.length,
      coupons: fallback
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/coupons - Create new coupon (Admin protected)
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      description
    } = req.body;

    if (!code || !discountValue || !validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code, discount value, and valid until date are required.'
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code "${cleanCode}" already exists. Please use a unique code.`
      });
    }

    const fromDate = validFrom ? new Date(validFrom) : new Date();
    const untilDate = new Date(validUntil);

    if (isNaN(untilDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expiry / valid until date format.'
      });
    }

    if (untilDate < fromDate) {
      return res.status(400).json({
        success: false,
        message: 'Valid until date must be after or equal to valid from date.'
      });
    }

    const adminUser = req.user || {
      _id: new mongoose.Types.ObjectId(),
      name: 'CampusCircuit Admin',
      email: 'admin@campuscircuit.com',
      role: 'admin'
    };

    const publicAdminName = adminUser.role === 'master_admin' ? 'CampusCircuit Operations' : adminUser.name;

    const newCoupon = new Coupon({
      code: cleanCode,
      discountType: discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: Number(discountValue),
      validFrom: fromDate,
      validUntil: untilDate,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      description: description?.trim() || '',
      isActive: true,
      createdBy: adminUser._id,
      createdByName: publicAdminName
    });

    const savedCoupon = await newCoupon.save();

    // Audit Logging
    try {
      await AuditLog.create({
        action: 'COUPON_CREATED',
        adminId: adminUser._id,
        adminName: adminUser.name,
        adminEmail: adminUser.email,
        adminRole: adminUser.role || 'admin',
        targetType: 'Coupon',
        targetId: savedCoupon._id.toString(),
        targetName: savedCoupon.code,
        details: {
          code: savedCoupon.code,
          discountType: savedCoupon.discountType,
          discountValue: savedCoupon.discountValue,
          validFrom: savedCoupon.validFrom,
          validUntil: savedCoupon.validUntil
        }
      });
    } catch (auditErr) {
      console.warn('Failed to write coupon audit log:', auditErr.message);
    }

    const couponObj = savedCoupon.toObject();
    couponObj.computedStatus = getCouponStatus(savedCoupon);

    res.status(201).json({
      success: true,
      message: `Coupon "${savedCoupon.code}" created successfully.`,
      coupon: couponObj
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/coupons/:id - Remove coupon (Admin protected)
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    let coupon = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      coupon = await Coupon.findById(id);
    }
    if (!coupon) {
      coupon = await Coupon.findOne({ code: id.toUpperCase() });
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.'
      });
    }

    const adminUser = req.user || {
      _id: new mongoose.Types.ObjectId(),
      name: 'CampusCircuit Admin',
      email: 'admin@campuscircuit.com',
      role: 'admin'
    };

    const deletedCode = coupon.code;
    const deletedId = coupon._id.toString();

    await Coupon.findByIdAndDelete(coupon._id);

    // Audit Logging
    try {
      await AuditLog.create({
        action: 'COUPON_DELETED',
        adminId: adminUser._id,
        adminName: adminUser.name,
        adminEmail: adminUser.email,
        adminRole: adminUser.role || 'admin',
        targetType: 'Coupon',
        targetId: deletedId,
        targetName: deletedCode,
        details: { code: deletedCode }
      });
    } catch (auditErr) {
      console.warn('Failed to write coupon delete audit log:', auditErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Coupon "${deletedCode}" removed successfully.`,
      deletedCode
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/coupons/validate - Validate coupon for cart/checkout (Public)
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartSubtotal = 0 } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a coupon code.'
      });
    }

    const cleanCode = code.trim().toUpperCase();

    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      const count = await Coupon.countDocuments();
      if (count === 0) {
        await Coupon.insertMany(getStarterCoupons());
      }
    }

    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: `Coupon "${cleanCode}" is not recognized.`
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" is currently inactive.`
      });
    }

    const now = new Date();
    const fromDate = new Date(coupon.validFrom);
    const untilDate = new Date(coupon.validUntil);

    if (now < fromDate) {
      const fromStr = fromDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" is valid starting from ${fromStr}.`
      });
    }

    if (now > untilDate) {
      const untilStr = untilDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" expired on ${untilStr}.`
      });
    }

    const subtotal = Number(cartSubtotal) || 0;
    if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart value of ₹${coupon.minOrderAmount} required for coupon "${cleanCode}".`
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" has reached its maximum usage limit.`
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      // Flat amount
      discount = Math.min(coupon.discountValue, subtotal);
    }

    res.status(200).json({
      success: true,
      message: `Coupon "${cleanCode}" applied successfully! You saved ₹${discount}.`,
      discountAmount: discount,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        validUntil: coupon.validUntil
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
