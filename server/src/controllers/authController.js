import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_for_campus_circuit', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and password.'
      });
    }

    const cleanInput = email.toLowerCase().trim();
    let user = await User.findOne({
      $or: [
        { email: cleanInput },
        { username: cleanInput }
      ]
    });
    
    // Also check by username prefix or matching email if not found directly
    if (!user && !cleanInput.includes('@')) {
      user = await User.findOne({
        $or: [
          { email: `${cleanInput}@campuscircuit.com` },
          { email: new RegExp(`^${cleanInput}@`, 'i') }
        ]
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username || user.email.split('@')[0],
        role: user.role,
        college: user.college
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, college } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      college: college || 'Engineering College',
      role: 'student'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};

// POST /api/auth/reset-password (Authenticated reset for current admin/user)
export const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (currentPassword) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match.'
        });
      }
    }

    user.password = newPassword;
    await user.save();

    // If this is an admin, log it
    if (['admin', 'master_admin'].includes(user.role)) {
      await AuditLog.create({
        action: 'ADMIN_PASSWORD_RESET',
        adminId: user._id,
        adminName: user.name,
        adminEmail: user.email,
        adminRole: user.role,
        targetType: 'User',
        targetId: user._id.toString(),
        targetName: user.name,
        details: { message: `Password reset successfully for ${user.email}` }
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
      token
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
