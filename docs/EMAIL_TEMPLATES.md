# DataFlow Email Templates for Supabase

This document contains all the beautifully designed email templates you need to configure in Supabase.

## How to Add Email Templates in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Email Templates**
3. Copy and paste the templates below for each email type
4. **Replace the logo placeholder** with your actual logo URL

---

## 1. Email Verification (Confirm Signup)

**Template Name:** Confirm signup  
**Subject:** Verify your email to activate your account

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #152a44 0%, #1e3a5f 100%); padding: 40px 40px 30px; text-align: center;">
              <!-- REPLACE THIS WITH YOUR LOGO -->
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Verify Your Email</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>{{ .Data.full_name }}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Welcome to DataFlow! To activate your account and start managing your social media analytics, please verify your email address.
              </p>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #152a44 0%, #1e3a5f 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(21, 42, 68, 0.4);">Verify Email Address</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; padding: 12px 16px; background-color: #f3f4f6; border-radius: 8px; word-break: break-all; color: #4b5563; font-size: 13px; font-family: monospace;">
                {{ .ConfirmationURL }}
              </p>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px;">
                <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  This link will expire in <strong>24 hours</strong> for security reasons.
                </p>
                <p style="margin: 12px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  If you didn't create an account, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Best regards,<br><strong>The DataFlow Team</strong>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2024 DataFlow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Password Reset

**Template Name:** Reset password  
**Subject:** Reset your password

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #152a44 0%, #1e3a5f 100%); padding: 40px 40px 30px; text-align: center;">
              <!-- REPLACE THIS WITH YOUR LOGO -->
              <img src="YOUR_LOGO_URL_HERE" alt="DataFlow" style="height: 40px; margin-bottom: 16px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Reset Your Password</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>{{ .Data.full_name }}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password for your account.
              </p>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #152a44 0%, #1e3a5f 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(21, 42, 68, 0.4);">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; padding: 12px 16px; background-color: #f3f4f6; border-radius: 8px; word-break: break-all; color: #4b5563; font-size: 13px; font-family: monospace;">
                {{ .ConfirmationURL }}
              </p>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px;">
                <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  This link will expire in <strong>1 hour</strong> for security reasons.
                </p>
                <p style="margin: 12px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Best regards,<br><strong>The DataFlow Team</strong>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2024 DataFlow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Magic Link (Passwordless Login)

**Template Name:** Magic link  
**Subject:** Your login link

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Login Link</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #152a44 0%, #1e3a5f 100%); padding: 40px 40px 30px; text-align: center;">
              <!-- REPLACE THIS WITH YOUR LOGO -->
              <img src="YOUR_LOGO_URL_HERE" alt="DataFlow" style="height: 40px; margin-bottom: 16px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Your Login Link</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>{{ .Data.full_name }}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Click the button below to securely log in to your DataFlow account. No password needed!
              </p>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #152a44 0%, #1e3a5f 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(21, 42, 68, 0.4);">Log In to DataFlow</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; padding: 12px 16px; background-color: #f3f4f6; border-radius: 8px; word-break: break-all; color: #4b5563; font-size: 13px; font-family: monospace;">
                {{ .ConfirmationURL }}
              </p>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px;">
                <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  This link will expire in <strong>1 hour</strong> for security reasons.
                </p>
                <p style="margin: 12px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  If you didn't request this login link, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Best regards,<br><strong>The DataFlow Team</strong>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2024 DataFlow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Email Change Confirmation

**Template Name:** Change email address  
**Subject:** Confirm your new email address

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Email Change</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #152a44 0%, #1e3a5f 100%); padding: 40px 40px 30px; text-align: center;">
              <!-- REPLACE THIS WITH YOUR LOGO -->
              <img src="YOUR_LOGO_URL_HERE" alt="DataFlow" style="height: 40px; margin-bottom: 16px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Confirm Email Change</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>{{ .Data.full_name }}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                You requested to change your email address to this one. Please confirm this change by clicking the button below.
              </p>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #152a44 0%, #1e3a5f 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(21, 42, 68, 0.4);">Confirm Email Change</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; padding: 12px 16px; background-color: #f3f4f6; border-radius: 8px; word-break: break-all; color: #4b5563; font-size: 13px; font-family: monospace;">
                {{ .ConfirmationURL }}
              </p>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px; background-color: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                  <strong>Security Notice:</strong> If you didn't request this email change, please contact our support team immediately as your account may be compromised.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Best regards,<br><strong>The DataFlow Team</strong>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2024 DataFlow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 5. Invite User

**Template Name:** Invite user  
**Subject:** You've been invited to DataFlow

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #152a44 0%, #1e3a5f 100%); padding: 40px 40px 30px; text-align: center;">
              <!-- REPLACE THIS WITH YOUR LOGO -->
              <img src="YOUR_LOGO_URL_HERE" alt="DataFlow" style="height: 40px; margin-bottom: 16px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">You're Invited!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                You've been invited to join <strong>DataFlow</strong> — the all-in-one platform for managing your social media analytics across Instagram, Facebook, and TikTok.
              </p>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #152a44 0%, #1e3a5f 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(21, 42, 68, 0.4);">Accept Invitation</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; padding: 12px 16px; background-color: #f3f4f6; border-radius: 8px; word-break: break-all; color: #4b5563; font-size: 13px; font-family: monospace;">
                {{ .ConfirmationURL }}
              </p>
              <!-- Features Box -->
              <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin-top: 24px;">
                <p style="margin: 0 0 12px; color: #0369a1; font-size: 14px; font-weight: 600;">What you'll get with DataFlow:</p>
                <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                  <li>Unified dashboard for all your social accounts</li>
                  <li>Real-time analytics and insights</li>
                  <li>Performance tracking across platforms</li>
                </ul>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Best regards,<br><strong>The DataFlow Team</strong>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2024 DataFlow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Supabase Configuration Notes

### Redirect URLs
Make sure to add these redirect URLs in **Authentication** → **URL Configuration**:

- Site URL: `https://dataflow-gray.vercel.app`
- Redirect URLs:
  - `https://dataflow-gray.vercel.app/auth/callback`
  - `https://dataflow-gray.vercel.app/auth/verify-success`
  - `https://dataflow-gray.vercel.app/auth/reset-password`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/verify-success`
  - `http://localhost:3000/auth/reset-password`

### Email Settings
In **Authentication** → **Email Templates** → **SMTP Settings**:
- Enable custom SMTP if using Postmark/SendGrid
- Set "From" email to: `noreply@yourdomain.com`
- Set "From" name to: `DataFlow`

### Logo Setup
Replace `YOUR_LOGO_URL_HERE` in each template with your actual logo URL. You can:
1. Upload your logo to your website's public folder
2. Use a CDN like Cloudinary or imgbb
3. Host it on your Supabase storage bucket

---

## Implementation Notes

The admin notifications are handled automatically via database triggers when:
- New user registers
- Subscription is created/cancelled/upgraded/downgraded
- Payment fails
