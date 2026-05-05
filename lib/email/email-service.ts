import nodemailer from 'nodemailer';

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'noreply@dataproflow.com';
const FROM_NAME = process.env.SMTP_FROM_NAME || 'DataProFlow Team';
const COMPANY_NAME = 'DataProFlow';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dataproflow.com';

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(SMTP_CONFIG);
  }
  return transporter;
}

// Email template wrapper
function createEmailTemplate(content: string, options?: { 
  showLogo?: boolean;
  headerText?: string;
  backgroundColor?: string;
  accentColor?: string;
}): string {
  const {
    showLogo = true,
    headerText = COMPANY_NAME,
    backgroundColor = '#f8fafc',
    accentColor = '#6366f1'
  } = options || {};

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${headerText}</title>
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: ${backgroundColor};
      margin: 0;
      padding: 20px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* Container */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, ${accentColor} 0%, #4f46e5 100%);
      padding: 40px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      opacity: 0.1;
    }
    
    .logo {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    
    .logo-icon {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    
    .tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      font-weight: 500;
      position: relative;
      z-index: 1;
    }
    
    /* Content */
    .content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
    }
    
    .message {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 32px;
      line-height: 1.7;
    }
    
    /* Card styles */
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    
    .info-card-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 15px;
    }
    
    .info-item:last-child {
      margin-bottom: 0;
    }
    
    .info-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    .info-label {
      font-weight: 600;
      color: #374151;
      min-width: 80px;
    }
    
    .info-value {
      color: #1f2937;
      flex: 1;
    }
    
    /* Button styles */
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    
    .button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      background: linear-gradient(135deg, ${accentColor} 0%, #4f46e5 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);
    }
    
    .button:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 8px -1px rgba(99, 102, 241, 0.4);
    }
    
    .button-secondary {
      background: #f3f4f6;
      color: #374151 !important;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    
    .button-secondary:hover {
      background: #e5e7eb;
    }
    
    /* Checklist */
    .checklist {
      margin: 24px 0;
    }
    
    .checklist-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
    }
    
    .checklist-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 15px;
      color: #4b5563;
    }
    
    .checklist-icon {
      width: 20px;
      height: 20px;
      background: #10b981;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 12px;
      font-weight: bold;
    }
    
    /* Footer */
    .footer {
      background: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    
    .footer-link {
      color: ${accentColor};
      text-decoration: none;
      font-weight: 500;
    }
    
    .footer-link:hover {
      text-decoration: underline;
    }
    
    .social-links {
      margin-top: 20px;
      display: flex;
      justify-content: center;
      gap: 16px;
    }
    
    .social-link {
      width: 36px;
      height: 36px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    
    .social-link:hover {
      background: ${accentColor};
      color: white;
      border-color: ${accentColor};
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      body {
        padding: 10px;
      }
      
      .email-container {
        border-radius: 12px;
      }
      
      .header {
        padding: 30px 20px;
      }
      
      .logo {
        font-size: 28px;
      }
      
      .content {
        padding: 30px 20px;
      }
      
      .greeting {
        font-size: 22px;
      }
      
      .info-card {
        padding: 20px;
      }
      
      .button {
        padding: 12px 24px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      ${showLogo ? `
        <div class="logo">
          <div class="logo-icon">📊</div>
          ${COMPANY_NAME}
        </div>
        <div class="tagline">Marketing Analytics Simplified</div>
      ` : `
        <div class="logo">${headerText}</div>
      `}
    </div>
    
    <div class="content">
      ${content}
    </div>
    
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
      <p class="footer-text">
        Need help? <a href="mailto:${FROM_EMAIL}" class="footer-link">Reply to this email</a> or visit our 
        <a href="${SITE_URL}" class="footer-link">website</a>
      </p>
      <div class="social-links">
        <a href="#" class="social-link">𝕏</a>
        <a href="#" class="social-link">in</a>
        <a href="#" class="social-link">📧</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// 1. Email Verification (handled by Supabase Auth)
// This is configured in Supabase dashboard

// 2. Welcome Email (After Verification)
export async function sendWelcomeEmail(
  email: string,
  firstName: string
): Promise<void> {
  const content = `
    <h2>Hi ${firstName},</h2>
    <p>Your account is now active.</p>
    <p>You can log in here:</p>
    <p style="text-align: center;">
      <a href="${SITE_URL}/login" class="button">Log In to ${COMPANY_NAME}</a>
    </p>
    <p>To get the most value from your trial, we recommend starting with:</p>
    <ul>
      <li>Connect your first data source (Instagram, Facebook, or TikTok)</li>
      <li>Open your dashboard to see live metrics</li>
      <li>Use the chat if you have any questions</li>
    </ul>
    <p>If you need help, just reply to this email — we're happy to assist.</p>
    <p>Best,<br>${COMPANY_NAME} Team</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Your account is ready - let\'s get started',
    html: createEmailTemplate(content),
  });
}

// 3. Trial Mid-Point Check-In (Day 6-7)
export async function sendTrialCheckInEmail(
  email: string,
  firstName: string
): Promise<void> {
  const content = `
    <h2>Hi ${firstName},</h2>
    <p>You're halfway through your ${COMPANY_NAME} trial.</p>
    <p>Most users notice by now how much time they save by having all their data in one dashboard.</p>
    <p>Have you already:</p>
    <ul>
      <li>Connected at least one platform?</li>
      <li>Compared this with your old reporting process?</li>
    </ul>
    <p>If you have questions or want help setting things up, just reply to this email.</p>
    <p>Best,<br>${COMPANY_NAME} Team</p>
  `;

  await sendEmail({
    to: email,
    subject: 'How is your trial going so far?',
    html: createEmailTemplate(content),
  });
}

// 4. Trial Ending Soon (Conversion Email)
export async function sendTrialEndingEmail(
  email: string,
  firstName: string,
  daysLeft: number
): Promise<void> {
  const content = `
    <h2>Hi ${firstName},</h2>
    <p>Your ${COMPANY_NAME} trial will end in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}.</p>
    <p>To keep your dashboards and data connections active, you can choose a subscription plan here:</p>
    <p style="text-align: center;">
      <a href="${SITE_URL}/dashboard/plans" class="button">View Plans</a>
    </p>
    <p>If you have questions or want to confirm which plan fits best, feel free to reply to this email.</p>
    <p>Thanks for trying ${COMPANY_NAME},<br>${COMPANY_NAME} Team</p>
  `;

  await sendEmail({
    to: email,
    subject: `Your trial ends in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`,
    html: createEmailTemplate(content),
  });
}

// 5. Password Reset (handled by Supabase Auth)
// This is configured in Supabase dashboard

// 6. Subscription Confirmation
export async function sendSubscriptionConfirmationEmail(
  email: string,
  firstName: string,
  planName: string,
  billingCycle: string
): Promise<void> {
  const content = `
    <h2>Hi ${firstName},</h2>
    <p>Your ${COMPANY_NAME} subscription is now active.</p>
    <p><strong>Plan:</strong> ${planName.charAt(0).toUpperCase() + planName.slice(1)}<br>
    <strong>Billing cycle:</strong> ${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}</p>
    <p>You can manage your subscription here:</p>
    <p style="text-align: center;">
      <a href="${SITE_URL}/dashboard/settings" class="button">Manage Subscription</a>
    </p>
    <p>Thanks for subscribing — we're excited to have you on board.</p>
    <p>Best,<br>${COMPANY_NAME} Team</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Your subscription is active',
    html: createEmailTemplate(content),
  });
}

// 7. Admin Notification Email (when new user signs up)
export async function sendAdminNotificationEmail(
  userEmail: string,
  userName: string,
  signupMethod: string
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@dataproflow.com';
  
  const content = `
    <h2>New User Signup</h2>
    <p>A new user has signed up for ${COMPANY_NAME}.</p>
    <p><strong>Name:</strong> ${userName}<br>
    <strong>Email:</strong> ${userEmail}<br>
    <strong>Signup Method:</strong> ${signupMethod}<br>
    <strong>Time:</strong> ${new Date().toLocaleString()}</p>
    <p style="text-align: center;">
      <a href="${SITE_URL}/admin/users" class="button">View in Admin Panel</a>
    </p>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `New User Signup: ${userName}`,
    html: createEmailTemplate(content),
  });
}

// Base email sending function
async function sendEmail({
  to,
  subject,
  html,
  from = `${FROM_NAME} <${FROM_EMAIL}>`,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<void> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('SMTP credentials not configured. Email not sent:', subject);
      return;
    }

    const transport = getTransporter();
    
    await transport.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully to ${to}: ${subject}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// 8. Booking Confirmation Email (to guest/user)
export async function sendBookingConfirmationEmail(
  email: string,
  guestName: string,
  bookingDetails: {
    date: string;
    time: string;
    subject: string;
    meetLink?: string;
  }
): Promise<void> {
  const formattedDate = new Date(bookingDetails.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formattedTime = formatTime(bookingDetails.time);

  const meetLinkButton = bookingDetails.meetLink
    ? `<div class="button-container">
        <a href="${bookingDetails.meetLink}" class="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="m7 8 5 3-5 3V8z"></path>
          </svg>
          Join Google Meet
        </a>
      </div>
      <p style="text-align: center; font-size: 14px; color: #6b7280; margin-top: 8px;">
        Can't click? Copy this link: <a href="${bookingDetails.meetLink}" style="color: #6366f1; text-decoration: none;">${bookingDetails.meetLink}</a>
      </p>`
    : '';

  const content = `
    <h2 class="greeting">Hi ${guestName},</h2>
    <p class="message">
      Your call with ${COMPANY_NAME} has been confirmed! We're excited to connect with you and help you achieve your marketing goals.
    </p>
    
    <div class="info-card">
      <div class="info-card-title">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        Booking Details
      </div>
      <div class="info-item">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span class="info-label">Date:</span>
        <span class="info-value">${formattedDate}</span>
      </div>
      <div class="info-item">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span class="info-label">Time:</span>
        <span class="info-value">${formattedTime}</span>
      </div>
      <div class="info-item">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span class="info-label">Subject:</span>
        <span class="info-value">${bookingDetails.subject}</span>
      </div>
      <div class="info-item">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span class="info-label">Duration:</span>
        <span class="info-value">30 minutes</span>
      </div>
    </div>

    ${meetLinkButton}

    <div class="checklist">
      <div class="checklist-title">Before Your Call</div>
      <div class="checklist-item">
        <div class="checklist-icon">✓</div>
        <span>Ensure you have a stable internet connection</span>
      </div>
      <div class="checklist-item">
        <div class="checklist-icon">✓</div>
        <span>Test your microphone and camera beforehand</span>
      </div>
      <div class="checklist-item">
        <div class="checklist-icon">✓</div>
        <span>Have any relevant questions or documents ready</span>
      </div>
      <div class="checklist-item">
        <div class="checklist-icon">✓</div>
        <span>Find a quiet space for the conversation</span>
      </div>
    </div>

    <p class="message" style="margin-top: 32px;">
      Need to reschedule or cancel? Please reply to this email at least 24 hours before your scheduled time.
    </p>

    <p class="message" style="margin-top: 24px;">
      We look forward to speaking with you and helping you grow your business!
    </p>

    <div class="button-container">
      <a href="${SITE_URL}" class="button button-secondary">
        Visit ${COMPANY_NAME}
      </a>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Your call is confirmed - ${formattedDate} at ${formattedTime}`,
    html: createEmailTemplate(content, {
      headerText: 'Booking Confirmed',
      accentColor: '#10b981'
    }),
  });
}

// 9. Admin Booking Notification Email
export async function sendAdminBookingNotificationEmail(
  bookingDetails: {
    id: string;
    guestName: string;
    guestEmail: string;
    date: string;
    time: string;
    subject: string;
    description?: string;
  }
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@dataproflow.com';

  const formattedDate = new Date(bookingDetails.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formattedTime = formatTime(bookingDetails.time);

  const content = `
    <h2 class="greeting">🗓️ New Booking Confirmed</h2>
    <p class="message">
      A new call has been scheduled. The booking details have been confirmed and added to your calendar.
    </p>
    
    <div class="info-card">
      <div class="info-card-title">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
        Guest Information
      </div>
      <div class="info-item">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span class="info-label">Name:</span>
        <span class="info-value">${bookingDetails.guestName}</span>
      </div>
      <div class="info-item">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <span class="info-label">Email:</span>
        <span class="info-value">
          <a href="mailto:${bookingDetails.guestEmail}" style="color: #6366f1; text-decoration: none;">${bookingDetails.guestEmail}</a>
        </span>
      </div>
    </div>

    <div class="info-card">
      <div class="info-card-title">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        Call Details
      </div>
      <div class="info-item">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span class="info-label">Date:</span>
        <span class="info-value">${formattedDate}</span>
      </div>
      <div class="info-item">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span class="info-label">Time:</span>
        <span class="info-value">${formattedTime}</span>
      </div>
      <div class="info-item">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span class="info-label">Subject:</span>
        <span class="info-value">${bookingDetails.subject}</span>
      </div>
      ${bookingDetails.description ? `
        <div class="info-item">
          <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          <span class="info-label">Notes:</span>
          <span class="info-value">${bookingDetails.description}</span>
        </div>
      ` : ''}
    </div>

    <div class="button-container">
      <a href="${SITE_URL}/admin/bookings" class="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        View All Bookings
      </a>
    </div>

    <div class="checklist">
      <div class="checklist-title">Next Steps</div>
      <div class="checklist-item">
        <div class="checklist-icon">✓</div>
        <span>Review the booking details in your calendar</span>
      </div>
      <div class="checklist-item">
        <div class="checklist-icon">✓</div>
        <span>Prepare for the call based on the subject</span>
      </div>
      <div class="checklist-item">
        <div class="checklist-icon">✓</div>
        <span>Join the call at the scheduled time</span>
      </div>
    </div>

    <p class="message" style="margin-top: 32px; color: #6b7280; font-size: 14px;">
      This booking has been automatically added to your calendar. Make sure to prepare for the call and join on time.
    </p>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `New Booking: ${bookingDetails.guestName} - ${formattedDate} at ${formattedTime}`,
    html: createEmailTemplate(content, {
      headerText: 'New Booking Alert',
      accentColor: '#f59e0b'
    }),
  });
}

// Send dashboard generated email
export async function sendDashboardGeneratedEmail(
  email: string,
  name: string,
  details: {
    dashboardUrl: string;
    companyName?: string;
    industry?: string;
  }
): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dataproflow.com';
  const firstName = name.split(' ')[0];

  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h1 style="font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 12px; line-height: 1.3;">
        Your Dashboard is Ready!
      </h1>
      <p style="color: #6b7280; font-size: 16px; margin: 0; line-height: 1.6;">
        Hi ${firstName}, your personalized marketing analytics dashboard<br/>has been successfully generated.
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #7a71eb 0%, #6366f1 100%); border-radius: 16px; padding: 40px 32px; text-align: center; margin-bottom: 32px;">
      <p style="color: rgba(255,255,255,0.9); font-size: 15px; margin-bottom: 20px; font-weight: 500;">
        Your dashboard is ready to view
      </p>
      <a href="${details.dashboardUrl}" style="display: inline-block; background: white; color: #7a71eb; padding: 16px 40px; border-radius: 12px; font-weight: 600; text-decoration: none; font-size: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
        Open My Dashboard
      </a>
      <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 16px; margin-bottom: 0;">
        No login required - click to view instantly
      </p>
    </div>

    <div style="background: #f8fafc; border-radius: 16px; padding: 28px; margin-bottom: 28px; border: 1px solid #e2e8f0;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #7a71eb 0%, #6366f1 100%); border-radius: 10px; margin-right: 14px; display: flex; align-items: center; justify-content: center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        </div>
        <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">
          Dashboard Summary
        </h3>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        ${details.companyName ? `
        <tr>
          <td style="padding: 12px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Company</td>
          <td style="padding: 12px 0; color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0;">${details.companyName}</td>
        </tr>
        ` : ''}
        ${details.industry ? `
        <tr>
          <td style="padding: 12px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Industry</td>
          <td style="padding: 12px 0; color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0;">${details.industry}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Status</td>
          <td style="padding: 12px 0; text-align: right;">
            <span style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;">
              Ready to View
            </span>
          </td>
        </tr>
      </table>
    </div>

    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 24px; margin-bottom: 28px; border: 1px solid #fcd34d;">
      <div style="display: flex; align-items: flex-start;">
        <div style="width: 32px; height: 32px; background: #f59e0b; border-radius: 8px; margin-right: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div>
          <h4 style="font-size: 15px; font-weight: 600; color: #92400e; margin: 0 0 6px 0;">
            Quick Tip
          </h4>
          <p style="color: #a16207; font-size: 14px; margin: 0; line-height: 1.5;">
            Bookmark your dashboard link for easy access anytime. Create a free account to connect your real marketing data and unlock advanced analytics.
          </p>
        </div>
      </div>
    </div>

    <div style="text-align: center; padding: 28px 0; border-top: 1px solid #e5e7eb;">
      <p style="color: #64748b; font-size: 15px; margin-bottom: 20px; font-weight: 500;">
        Ready to unlock the full potential?
      </p>
      <a href="${siteUrl}/signup" style="display: inline-block; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 14px 32px; border-radius: 10px; font-weight: 600; text-decoration: none; font-size: 15px;">
        Create Free Account
      </a>
      <p style="color: #94a3b8; font-size: 13px; margin-top: 16px; margin-bottom: 0;">
        Connect your marketing platforms • Get real-time insights • AI-powered recommendations
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Your Marketing Dashboard is Ready - ${details.companyName || 'DataProFlow'}`,
    html: createEmailTemplate(content, {
      headerText: 'Dashboard Ready',
      accentColor: '#7a71eb'
    }),
  });
}

// Verify SMTP connection
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    const transport = getTransporter();
    await transport.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return false;
  }
}
