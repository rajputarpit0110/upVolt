import { Message } from '../models/Message.js';

/**
 * POST /api/messages
 * Public submission from Contact Page
 */
export const createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your name.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide an inquiry subject.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Please describe your inquiry or project requirement.' });
    }

    const ip = req.socket?.remoteAddress || req.headers['x-forwarded-for'] || '';

    const newMessage = await Message.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ip: typeof ip === 'string' ? ip.split(',')[0].trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! Our team will get back to you soon.',
      data: newMessage
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message. Please try again or reach out on WhatsApp.'
    });
  }
};

/**
 * GET /api/messages
 * Protected: Admin & Master Admin
 */
export const getMessages = async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    const query = {};

    if (status && ['unread', 'read', 'replied'].includes(status)) {
      query.status = status;
    }

    const [messages, total, unreadCount] = await Promise.all([
      Message.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit)),
      Message.countDocuments(),
      Message.countDocuments({ status: 'unread' })
    ]);

    res.status(200).json({
      success: true,
      messages,
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/messages/:id/status
 * Protected: Admin & Master Admin
 */
export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: unread, read, replied'
      });
    }

    const message = await Message.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after', runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({
      success: true,
      message: `Message marked as ${status}`,
      data: message
    });
  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/messages/:id
 * Protected: Admin & Master Admin
 */
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
