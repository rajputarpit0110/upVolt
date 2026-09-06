import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (c, next) => {
  let token;
  const authHeader = c.req.header('authorization');

  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return c.json({
      success: false,
      message: 'Access denied. Authentication token required.'
    }, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_campus_circuit');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return c.json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      }, 401);
    }

    c.set('user', user);
    await next();
  } catch (error) {
    return c.json({
      success: false,
      message: 'Invalid or expired token.',
      error: error.message
    }, 401);
  }
};

// Authorize specific user roles (e.g. 'admin', 'master_admin')
export const authorize = (...roles) => {
  return async (c, next) => {
    const user = c.get('user');
    if (!user || !roles.includes(user.role)) {
      return c.json({
        success: false,
        message: `Permission denied. Access restricted to roles: [${roles.join(', ')}]. Your role: ${user ? user.role : 'none'}`
      }, 403);
    }
    await next();
  };
};

// Restrict to Master Admin only (returns 404 so regular admins cannot detect this endpoint)
export const requireMasterAdmin = async (c, next) => {
  const user = c.get('user');
  if (!user || user.role !== 'master_admin') {
    return c.json({
      success: false,
      message: 'Cannot find requested route.'
    }, 404);
  }
  await next();
};
