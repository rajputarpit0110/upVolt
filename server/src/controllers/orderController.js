import { Order } from '../models/Order.js';
import { AuditLog } from '../models/AuditLog.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';

// POST /api/orders - Place a new order
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      paymentMethod,
      subtotal,
      shippingFee,
      totalAmount,
      deliveryType,
      razorpayPaymentId,
      utr,
      paymentScreenshot,
      couponCode
    } = req.body;

    if (!customerName || !customerPhone || !shippingAddress || !shippingAddress.address || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer details, full delivery address, and at least one item are required.'
      });
    }

    // Online payment validation: UTR and Payment Screenshot
    let validatedUtr = undefined;
    let validatedScreenshot = undefined;
    const isOnlinePayment = ['online', 'upi', 'razorpay'].includes(paymentMethod);

    if (isOnlinePayment || utr || razorpayPaymentId) {
      const rawUtr = String(utr || razorpayPaymentId || '').trim().replace(/\s+/g, '');

      if (!rawUtr) {
        return res.status(400).json({
          success: false,
          message: 'UTR / Transaction Reference Number is mandatory for online payment verification.'
        });
      }

      // Format validation: 12-digit numeric UPI Ref, or 12-22 alphanumeric bank transfer
      const is12DigitUpi = /^\d{12}$/.test(rawUtr);
      const isBankRef = /^[A-Za-z0-9]{12,22}$/.test(rawUtr);

      if (!is12DigitUpi && !isBankRef) {
        return res.status(400).json({
          success: false,
          message: 'Invalid UTR format. Please enter a valid 12-digit numeric UPI reference number from your payment app (e.g. PhonePe, GPay, Paytm).'
        });
      }

      // Check for bogus/repetitive/sequential numbers
      const isRepeated = /^(\d)\1{11}$/.test(rawUtr);
      const isDummySequential = rawUtr === '123456789012' || rawUtr === '012345678901';
      if (isRepeated || isDummySequential) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or dummy UTR detected. Please enter the genuine 12-digit reference number from your UPI payment receipt.'
        });
      }

      // Uniqueness check: Ensure this UTR has not been used previously
      const duplicateOrder = await Order.findOne({
        $or: [
          { utr: rawUtr },
          { razorpayPaymentId: rawUtr }
        ]
      });

      if (duplicateOrder) {
        return res.status(400).json({
          success: false,
          message: `This UTR / Transaction ID (${rawUtr}) has already been submitted for an earlier order. Reusing previous payment receipts is not allowed.`
        });
      }

      // Screenshot validation
      const screenshotStr = String(paymentScreenshot || '').trim();
      if (!screenshotStr) {
        return res.status(400).json({
          success: false,
          message: 'Payment screenshot proof is mandatory for online payment verification. Please upload the screenshot of your completed payment.'
        });
      }

      validatedUtr = rawUtr;
      validatedScreenshot = screenshotStr;
    }

    const orderId = 'CC-' + Math.floor(100000 + Math.random() * 900000);

    // Security Fix: Server-side validation of item quantities and recalculation of total from DB prices
    let serverSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 50) {
        return res.status(400).json({ success: false, message: 'Invalid quantity for one or more items.' });
      }

      const prodId = item._id || item.productId;
      if (!prodId) {
        return res.status(400).json({ success: false, message: 'Product ID is missing for an item.' });
      }

      const dbProduct = await Product.findById(prodId);
      if (!dbProduct) {
        return res.status(404).json({ success: false, message: `Product not found.` });
      }

      if (!dbProduct.inStock || dbProduct.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Item "${dbProduct.name}" is out of stock or does not have enough quantity available.` 
        });
      }
      
      serverSubtotal += (dbProduct.price * item.quantity);
      validatedItems.push({
        ...item,
        price: dbProduct.price // Override client price with authentic DB price
      });
    }

    const calculatedSubtotal = serverSubtotal;
    const calculatedShipping = deliveryType === 'fast' ? 100 : (calculatedSubtotal >= 499 ? 0 : 40); // Standardize shipping logic
    
    let calculatedDiscount = 0;
    let validatedCoupon = null;
    
    if (couponCode && typeof couponCode === 'string') {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.validUntil > new Date() && calculatedSubtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'fixed') {
          calculatedDiscount = coupon.discountValue;
        } else if (coupon.discountType === 'percentage') {
          calculatedDiscount = Math.floor((calculatedSubtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscountAmount && calculatedDiscount > coupon.maxDiscountAmount) {
            calculatedDiscount = coupon.maxDiscountAmount;
          }
        }
        validatedCoupon = coupon.code;
      }
    }
    
    const calculatedTotal = Math.max(0, calculatedSubtotal + calculatedShipping - calculatedDiscount);
    
    // Replace items with validated items
    req.body.items = validatedItems;

    const newOrder = new Order({
      orderId,
      user: req.user ? req.user._id : undefined,
      customerName,
      customerEmail: customerEmail || (req.user ? req.user.email : ''),
      customerPhone,
      shippingAddress: {
        address: shippingAddress.address,
        collegeName: shippingAddress.collegeName || '',
        hostelName: shippingAddress.hostelName || '',
        roomNo: shippingAddress.roomNo || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        pincode: shippingAddress.pincode || ''
      },
      deliveryType: deliveryType === 'fast' ? 'fast' : 'normal',
      items,
      subtotal: calculatedSubtotal,
      shippingFee: calculatedShipping,
      couponCode: validatedCoupon || undefined,
      discountAmount: calculatedDiscount,
      totalAmount: calculatedTotal,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'pending',
      razorpayPaymentId: validatedUtr || razorpayPaymentId || undefined,
      utr: validatedUtr || undefined,
      paymentScreenshot: validatedScreenshot || undefined,
      orderStatus: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedAt: new Date(),
          changedBy: customerName,
          note: isOnlinePayment ? `Order placed with UPI UTR: ${validatedUtr}` : 'Order placed by customer (COD)'
        }
      ]
    });

    const savedOrder = await newOrder.save();

    // Decrement stock quantities
    if (items && items.length > 0) {
      for (const item of items) {
        const prodId = item._id || item.productId;
        if (prodId) {
          try {
            const updated = await Product.findByIdAndUpdate(
              prodId,
              { $inc: { stockQuantity: -item.quantity } },
              { new: true }
            );
            if (updated && updated.stockQuantity <= 0 && updated.inStock) {
              updated.inStock = false;
              await updated.save();
            }
          } catch (err) {
            console.error(`Failed to update stock for product ${prodId}`, err);
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully and recorded in database',
      order: savedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/orders/:id/cancel - Cancel pending order
export const cancelMyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { orderId: id }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (
      !req.user || 
      (order.user?.toString() !== req.user._id.toString() && order.customerEmail !== req.user.email)
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order.' });
    }

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled.' });
    }

    order.orderStatus = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      changedAt: new Date(),
      changedBy: req.user ? req.user.name : (order.customerName || 'User'),
      note: 'Cancelled by user'
    });

    await order.save();

    // Restock items
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const prodId = item._id || item.productId;
        if (prodId) {
          try {
            const updated = await Product.findByIdAndUpdate(
              prodId,
              { $inc: { stockQuantity: item.quantity } },
              { new: true }
            );
            if (updated && updated.stockQuantity > 0 && !updated.inStock) {
              updated.inStock = true;
              await updated.save();
            }
          } catch (err) {
            console.error(`Failed to restock product ${prodId}`, err);
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Order #${order.orderId} cancelled successfully`,
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/my-orders - Get orders for current user or by phone/email
export const getMyOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to view orders.' });
    }

    const query = {
      $or: [
        { user: req.user._id },
        { customerEmail: req.user.email }
      ]
    };

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders - Get all orders (Admin / Master Admin)
export const getAllOrders = async (req, res) => {
  try {
    const { status, search, page, limit } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status.toLowerCase();
    }

    if (search && search.trim()) {
      const q = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderId: q },
        { customerName: q },
        { customerPhone: q },
        { customerEmail: q }
      ];
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const skipNum = (pageNum - 1) * limitNum;

    const totalCount = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/orders/:id/status - Update order status (Admin / Master Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { orderId: id }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = status.toLowerCase();
    if (status.toLowerCase() === 'completed') {
      order.paymentStatus = 'completed';
    }

    const publicAdminName = req.user?.role === 'master_admin' ? 'upVolt Support' : (req.user ? req.user.name : 'Admin');
    order.statusHistory.push({
      status: status.toLowerCase(),
      changedAt: new Date(),
      changedBy: publicAdminName,
      note: note || `Status changed from ${oldStatus} to ${status}`
    });

    const updatedOrder = await order.save();

    // Restock items if admin cancelled
    if (status.toLowerCase() === 'cancelled' && oldStatus !== 'cancelled') {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          const prodId = item._id || item.productId;
          if (prodId) {
            try {
              const updated = await Product.findByIdAndUpdate(
                prodId,
                { $inc: { stockQuantity: item.quantity } },
                { new: true }
              );
              if (updated && updated.stockQuantity > 0 && !updated.inStock) {
                updated.inStock = true;
                await updated.save();
              }
            } catch (err) {
              console.error(`Failed to restock product ${prodId}`, err);
            }
          }
        }
      }
    }

    // Log status update to AuditLog
    if (req.user) {
      try {
        await AuditLog.create({
          action: 'ORDER_STATUS_UPDATED',
          adminId: req.user._id,
          adminName: req.user.name,
          adminEmail: req.user.email,
          adminRole: req.user.role,
          targetType: 'Order',
          targetId: order.orderId,
          targetName: `Order #${order.orderId}`,
          details: {
            fromStatus: oldStatus,
            toStatus: status.toLowerCase(),
            customerName: order.customerName,
            totalAmount: order.totalAmount
          }
        });
      } catch (auditErr) {
        console.warn('Failed to write order audit log:', auditErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Order #${order.orderId} status updated to "${status}"`,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/orders/:id - Delete an order (Admin / Master Admin)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { orderId: id }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    
    await Order.findByIdAndDelete(order._id);
    
    // Log deletion to AuditLog
    if (req.user) {
      try {
        await AuditLog.create({
          action: 'ORDER_DELETED',
          adminId: req.user._id,
          adminName: req.user.name,
          adminEmail: req.user.email,
          adminRole: req.user.role,
          targetType: 'Order',
          targetId: order.orderId,
          targetName: `Order #${order.orderId}`,
          details: {
            customerName: order.customerName,
            totalAmount: order.totalAmount
          }
        });
      } catch (auditErr) {
        console.warn('Failed to write order deletion audit log:', auditErr.message);
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Order #${order.orderId} deleted successfully.`
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
