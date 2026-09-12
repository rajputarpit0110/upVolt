import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { EmailOtp } from '../models/EmailOtp.js';
import { sendOtpEmail } from '../services/brevoService.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_for_campus_circuit', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

/**
 * Mask email for privacy (e.g. arpit@gmail.com -> a***t@gmail.com)
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  const [localPart, domain] = email.trim().toLowerCase().split('@');
  if (!domain) return email;

  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }

  const first = localPart[0];
  const last = localPart[localPart.length - 1];
  const maskedMiddle = '*'.repeat(Math.min(Math.max(localPart.length - 2, 3), 5));
  return `${first}${maskedMiddle}${last}@${domain}`;
};

/**
 * Generate cryptographically secure 6-digit numeric OTP
 */
const generateSecureOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hash OTP with HMAC-SHA256
 */
const hashOtp = (otp) => {
  const secret = process.env.JWT_SECRET || 'upvolt_secure_otp_salt_secret';
  return crypto.createHmac('sha256', secret).update(String(otp)).digest('hex');
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
          { email: `${cleanInput}@upvolt.com` },
          { email: `${cleanInput}@upvolt.in` },
          { email: `${cleanInput}@campuscircuit.com` },
          { email: new RegExp(`^${cleanInput}@`, 'i') }
        ]
      });
    }

    // Also check by username prefix if an email was typed
    if (!user && cleanInput.includes('@')) {
      const prefix = cleanInput.split('@')[0];
      user = await User.findOne({
        $or: [
          { username: prefix },
          { email: `${prefix}@upvolt.com` },
          { email: `${prefix}@upvolt.in` },
          { email: `${prefix}@campuscircuit.com` }
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

    // Check email verification status for standard student accounts
    const isAdmin = ['admin', 'master_admin'].includes(user.role);
    if (!isAdmin && user.isVerified === false) {
      // User exists with valid password, but email is unverified
      const activeOtp = await EmailOtp.findOne({ email: user.email }).sort({ createdAt: -1 });
      const COOLDOWN_MS = 60 * 1000;

      if (!activeOtp || (Date.now() - new Date(activeOtp.lastSentAt).getTime() >= COOLDOWN_MS)) {
        await EmailOtp.deleteMany({ email: user.email });
        const otp = generateSecureOtp();
        const otpHash = hashOtp(otp);

        await EmailOtp.create({
          email: user.email,
          otpHash,
          purpose: 'login',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          attempts: 0,
          maxAttempts: 5,
          lastSentAt: new Date()
        });

        await sendOtpEmail({
          email: user.email,
          name: user.name,
          otp,
          purpose: 'login'
        });
      }

      return res.status(200).json({
        success: false,
        requiresOtp: true,
        email: maskEmail(user.email),
        fullEmail: user.email,
        message: 'Your email is not verified yet. A verification code has been sent to your email.'
      });
    }

    const token = generateToken(user._id);

    const cleanName = user.name ? user.name.replace(/CampusCircuit/gi, 'upVolt') : user.name;
    const cleanCollege = user.college ? user.college.replace(/CampusCircuit/gi, 'upVolt') : user.college;
    const cleanEmail = user.email ? user.email.replace(/@campuscircuit\.com/gi, '@upvolt.com') : user.email;

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: cleanName,
        email: cleanEmail,
        username: user.username || user.email.split('@')[0],
        role: user.role,
        college: cleanCollege
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

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });

    if (existing) {
      // If user account is already verified or is an administrator
      if (existing.isVerified !== false) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please sign in.'
        });
      }
      // If unverified from previous incomplete registration, update credentials
      existing.name = name.trim();
      existing.college = college || existing.college;
      existing.password = password; // Will be hashed by User pre-save hook
      await existing.save();
    } else {
      // Create user record in unverified state
      await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
        college: college || 'Engineering College',
        role: 'student',
        isVerified: false
      });
    }

    // Invalidate any existing OTP records for this email
    await EmailOtp.deleteMany({ email: cleanEmail });

    // Generate cryptographically secure 6-digit OTP
    const otp = generateSecureOtp();
    const otpHash = hashOtp(otp);

    // Save OTP hash with 5-minute expiry
    await EmailOtp.create({
      email: cleanEmail,
      otpHash,
      purpose: 'registration',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0,
      maxAttempts: 5,
      lastSentAt: new Date()
    });

    // Deliver via Brevo Transactional Email
    const emailResult = await sendOtpEmail({
      email: cleanEmail,
      name: name.trim(),
      otp,
      purpose: 'registration'
    });

    if (!emailResult.success && !emailResult.devMode) {
      return res.status(503).json({
        success: false,
        message: "We couldn't send the verification email. Please try again."
      });
    }

    res.status(200).json({
      success: true,
      requiresOtp: true,
      email: maskEmail(cleanEmail),
      fullEmail: cleanEmail,
      message: 'Verification code sent to your email.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose = 'registration' } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid code format. Verification code must be exactly 6 digits.'
      });
    }

    const otpRecord = await EmailOtp.findOne({ email: cleanEmail }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No active verification code found. Please request a new OTP.'
      });
    }

    // 1. Check expiration (5 minutes)
    if (new Date() > otpRecord.expiresAt) {
      await EmailOtp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // 2. Check maximum attempts (5 attempts limit)
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await EmailOtp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      });
    }

    // 3. Hash submitted OTP and compare securely
    const submittedHash = hashOtp(cleanOtp);
    const isValid = crypto.timingSafeEqual(
      Buffer.from(submittedHash, 'utf8'),
      Buffer.from(otpRecord.otpHash, 'utf8')
    );

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = Math.max(0, otpRecord.maxAttempts - otpRecord.attempts);

      if (remaining === 0) {
        await EmailOtp.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          success: false,
          message: 'Too many incorrect attempts. Please request a new OTP.'
        });
      }

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. Please try again. (${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining)`
      });
    }

    // 4. Valid OTP: Invalidate OTP record immediately to prevent reuse
    await EmailOtp.deleteMany({ email: cleanEmail });

    // 5. Activate user account and mark email as verified
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    user.isVerified = true;
    await user.save();

    // 6. Issue authenticated session token
    const token = generateToken(user._id);

    const cleanName = user.name ? user.name.replace(/CampusCircuit/gi, 'upVolt') : user.name;
    const cleanCollege = user.college ? user.college.replace(/CampusCircuit/gi, 'upVolt') : user.college;
    const cleanUserEmail = user.email ? user.email.replace(/@campuscircuit\.com/gi, '@upvolt.com') : user.email;

    res.status(200).json({
      success: true,
      verified: true,
      message: 'Email verified successfully.',
      token,
      user: {
        _id: user._id,
        name: cleanName,
        email: cleanUserEmail,
        username: user.username || user.email.split('@')[0],
        role: user.role,
        college: cleanCollege
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal error verifying code.' });
  }
};

// POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  try {
    const { email, purpose = 'registration' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required to resend verification code.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Enforce 60-second server-side cooldown
    const existingOtp = await EmailOtp.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
    if (existingOtp && existingOtp.lastSentAt) {
      const elapsedMs = Date.now() - new Date(existingOtp.lastSentAt).getTime();
      const COOLDOWN_MS = 60 * 1000;
      if (elapsedMs < COOLDOWN_MS) {
        const remainingSec = Math.ceil((COOLDOWN_MS - elapsedMs) / 1000);
        return res.status(429).json({
          success: false,
          cooldown: true,
          remainingSeconds: remainingSec,
          message: `Please wait ${remainingSec}s before requesting another verification code.`
        });
      }
    }

    // Invalidate old OTP records
    await EmailOtp.deleteMany({ email: cleanEmail });

    // Generate new OTP
    const otp = generateSecureOtp();
    const otpHash = hashOtp(otp);

    await EmailOtp.create({
      email: cleanEmail,
      otpHash,
      purpose,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0,
      maxAttempts: 5,
      lastSentAt: new Date()
    });

    const user = await User.findOne({ email: cleanEmail });
    const name = user ? user.name : 'Student Builder';

    const emailResult = await sendOtpEmail({
      email: cleanEmail,
      name,
      otp,
      purpose
    });

    if (!emailResult.success && !emailResult.devMode) {
      return res.status(503).json({
        success: false,
        message: "We couldn't send the verification email. Please try again."
      });
    }

    res.status(200).json({
      success: true,
      message: 'A new verification code has been sent to your email.'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to resend verification code.' });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  const u = req.user ? {
    ...(req.user.toObject ? req.user.toObject() : req.user),
    name: req.user.name ? req.user.name.replace(/CampusCircuit/gi, 'upVolt') : req.user.name,
    college: req.user.college ? req.user.college.replace(/CampusCircuit/gi, 'upVolt') : req.user.college,
    email: req.user.email ? req.user.email.replace(/@campuscircuit\.com/gi, '@upvolt.com') : req.user.email
  } : req.user;

  res.status(200).json({
    success: true,
    user: u
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
