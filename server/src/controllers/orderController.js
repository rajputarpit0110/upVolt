import { Order } from '../models/Order.js';
import { AuditLog } from '../models/AuditLog.js';

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
      deliveryType
    } = req.body;

    if (!customerName || !customerPhone || !shippingAddress || !shippingAddress.address || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer details, full delivery address, and at least one item are required.'
      });
    }

    const orderId = 'CC-' + Math.floor(100000 + Math.random() * 900000);

    const calculatedSubtotal = subtotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const calculatedShipping = shippingFee !== undefined ? Number(shippingFee) : (calculatedSubtotal >= 499 ? 0 : 40);
    const calculatedTotal = totalAmount || (calculatedSubtotal + calculatedShipping);

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
        city: shippingAddress.city || 'Delhi',
        state: shippingAddress.state || 'Delhi',
        pincode: shippingAddress.pincode || ''
      },
      deliveryType: deliveryType === 'fast' ? 'fast' : 'normal',
      items,
      subtotal: calculatedSubtotal,
      shippingFee: calculatedShipping,
      totalAmount: calculatedTotal,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      orderStatus: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedAt: new Date(),
          changedBy: customerName,
          note: 'Order placed by customer'
        }
      ]
    });

    const savedOrder = await newOrder.save();

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

// GET /api/orders/my-orders - Get orders for current user or by phone/email
export const getMyOrders = async (req, res) => {
  try {
    const query = {};

    if (req.user) {
      query.$or = [
        { user: req.user._id },
        { customerEmail: req.user.email }
      ];
    } else if (req.query.phone) {
      query.customerPhone = req.query.phone;
    } else if (req.query.email) {
      query.customerEmail = req.query.email;
    }

    // If no user or query, return recent orders so students can see their orders
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
    const { status, search } = req.query;
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

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
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
