import { BrevoClient } from '@getbrevo/brevo';

/**
 * Reusable Brevo Transactional Email Service for upVolt
 */

const getBrevoClient = () => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || apiKey === 'your_brevo_api_key_here') {
    return null;
  }
  return new BrevoClient({ apiKey });
};

/**
 * Generate HTML email content for OTP
 */
const generateOtpHtml = ({ name, otp, purpose = 'registration', expiryMinutes = 5 }) => {
  const purposeTitle = {
    registration: 'Verify Your Account',
    login: 'Login Verification Code',
    'password-reset': 'Password Reset Code',
    'email-verification': 'Verify Your Email'
  }[purpose] || 'Verification Code';

  const recipientName = name ? name.trim() : 'Student Builder';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${purposeTitle}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #06090e;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    .email-wrapper {
      width: 100%;
      background-color: #06090e;
      padding: 40px 15px;
      box-sizing: border-box;
    }
    .email-container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #0d131f;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 36px 32px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .brand-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .brand-logo {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .brand-logo span {
      color: #00f0ff;
    }
    .badge {
      display: inline-block;
      margin-top: 8px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.2);
      padding: 4px 12px;
      border-radius: 9999px;
    }
    .greeting {
      font-size: 17px;
      font-weight: 600;
      color: #f1f5f9;
      margin-bottom: 12px;
    }
    .message-text {
      font-size: 14px;
      line-height: 1.6;
      color: #94a3b8;
      margin-bottom: 24px;
    }
    .otp-card {
      background: #131c2e;
      border: 1px solid #00f0ff33;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 10px;
      color: #00f0ff;
      margin: 0;
      padding-left: 10px;
    }
    .otp-meta {
      font-size: 12px;
      color: #64748b;
      margin-top: 10px;
    }
    .security-notice {
      background: rgba(15, 23, 42, 0.6);
      border-left: 3px solid #0284c7;
      padding: 12px 14px;
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.5;
      color: #64748b;
      margin-top: 24px;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #475569;
      margin-top: 32px;
      border-top: 1px solid #1e293b;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="brand-header">
        <div class="brand-logo">⚡ up<span>Volt</span></div>
        <div><span class="badge">${purposeTitle}</span></div>
      </div>

      <div class="greeting">Hello, ${recipientName}</div>
      <div class="message-text">
        Please use the following 6-digit verification code to complete your ${purpose.replace('-', ' ')} on upVolt:
      </div>

      <div class="otp-card">
        <div class="otp-code">${otp}</div>
        <div class="otp-meta">Expires in ${expiryMinutes} minutes • One-time use only</div>
      </div>

      <div class="security-notice">
        <strong>Security Notice:</strong> Never share this verification code with anyone. upVolt support will never ask for your code or password. If you did not make this request, you can safely ignore this email.
      </div>

      <div class="footer">
        &copy; ${new Date().getFullYear()} upVolt Inc. Powering Ideas. Connecting Possibilities.<br/>
        This is an automated security notification. Please do not reply directly to this email.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Generate plain text email content for OTP
 */
const generateOtpText = ({ name, otp, purpose = 'registration', expiryMinutes = 5 }) => {
  const recipientName = name ? name.trim() : 'Student Builder';
  return `
⚡ upVolt Security Verification

Hello, ${recipientName}

Your 6-digit verification code is:

${otp}

This code will expire in ${expiryMinutes} minutes.

If you did not request this verification code, please disregard this email.
Never share this code with anyone. upVolt representatives will never ask for your code.

upVolt - Powering Ideas. Connecting Possibilities.
  `.trim();
};

/**
 * Send Transactional OTP Email via Brevo
 *
 * @param {Object} options
 * @param {string} options.email - Recipient email address
 * @param {string} [options.name] - Recipient name
 * @param {string} options.otp - 6-digit numeric OTP
 * @param {string} [options.purpose='registration'] - Purpose of OTP
 * @param {number} [options.expiryMinutes=5] - Expiry in minutes
 * @returns {Promise<{ success: boolean, messageId?: string, devMode?: boolean, error?: string }>}
 */
export const sendOtpEmail = async ({
  email,
  name = 'Student Builder',
  otp,
  purpose = 'registration',
  expiryMinutes = 5
}) => {
  if (!email || !otp) {
    return { success: false, error: 'Email and OTP are required to send notification.' };
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'support.upvolt@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'upVolt';

  const subjectMap = {
    registration: 'Verify your upVolt account',
    login: 'Your upVolt login verification code',
    'password-reset': 'Your upVolt password reset code',
    'email-verification': 'Verify your upVolt email'
  };

  const subject = subjectMap[purpose] || 'Verify your upVolt email';
  const htmlContent = generateOtpHtml({ name, otp, purpose, expiryMinutes });
  const textContent = generateOtpText({ name, otp, purpose, expiryMinutes });

  const brevoClient = getBrevoClient();

  // If no API key configured
  if (!brevoClient) {
    const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER || !!process.env.RENDER_EXTERNAL_URL;
    console.error(`[Brevo Service ERROR] Cannot send live OTP to ${email}: BREVO_API_KEY is missing in server environment variables.`);
    
    if (isProduction) {
      return {
        success: false,
        error: 'Email verification service is temporarily unavailable. Server administrator must set BREVO_API_KEY in hosting environment variables.',
        devMode: false
      };
    }

    console.warn(`[Brevo Service - Local Dev Fallback] OTP for ${email}: ${otp}`);
    return {
      success: true,
      devMode: true,
      otp,
      messageId: `dev-simulated-${Date.now()}`
    };
  }

  try {
    const response = await brevoClient.transactionalEmails.sendTransacEmail({
      subject,
      sender: {
        name: senderName,
        email: senderEmail
      },
      to: [
        {
          email: email.trim().toLowerCase(),
          name: name ? name.trim() : 'Student'
        }
      ],
      htmlContent,
      textContent
    });

    const messageId = response?.messageId || response?.messageIds?.[0] || 'sent';
    console.log(`[Brevo Service] Transactional OTP email sent successfully to ${email} (Purpose: ${purpose}, ID: ${messageId})`);

    return {
      success: true,
      messageId
    };
  } catch (err) {
    console.error(`[Brevo Service] Email delivery failed for ${email}:`, err.message || err);
    return {
      success: false,
      error: err.message || 'Brevo transactional delivery error'
    };
  }
};
