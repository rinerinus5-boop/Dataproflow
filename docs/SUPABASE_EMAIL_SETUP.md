# Supabase Email Configuration Guide

This guide explains how to configure custom SMTP for all transactional emails in your DataFlow application.

---

## 📧 Email Types Implemented

1. **Email Verification** (Supabase Auth) - Sent on signup
2. **Welcome Email** (Custom) - Sent after email verification
3. **Trial Check-In** (Custom) - Sent on day 6-7 of trial
4. **Trial Ending** (Custom) - Sent 2-3 days before trial ends
5. **Password Reset** (Supabase Auth) - Sent on password reset request
6. **Subscription Confirmation** (Custom) - Sent after successful payment
7. **Admin Notification** (Custom) - Sent to admin when new user signs up

---

## 🔧 Step 1: Configure SMTP in Supabase Dashboard

### Access SMTP Settings

1. Go to your Supabase project: https://supabase.com/dashboard/project/rgvroclnnfgwfdyhakli
2. Click **Authentication** in the left sidebar
3. Click **Email** tab
4. Scroll to **SMTP Settings**
5. Click **Enable Custom SMTP**

### Enter SMTP Credentials

Fill in the following details:

```
Sender email: info@dataproflow.com
Sender name: DataFlow Team

Host: smtp.gmail.com
Port: 465
Username: info@dataproflow.com
Password: ftluztzbecnxrlvv
```

**Important:** Make sure to click **Save** at the bottom!

---

## 📝 Step 2: Configure Email Templates in Supabase

### Email Verification Template

1. In Supabase Dashboard → **Authentication** → **Email Templates**
2. Select **Confirm signup** template
3. Replace with:

**Subject:**
```
Verify your email to activate your account
```

**Body:**
```html
<h2>Hi {{ .Name }},</h2>

<p>Welcome to DataFlow.</p>

<p>To activate your account, please verify your email address by clicking the link below:</p>

<p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>

<p>This link will expire in 15 minutes for security reasons.</p>

<p>If you didn't create an account, you can safely ignore this email.</p>

<p>Best regards,<br>DataFlow Team</p>
```

### Password Reset Template

1. Select **Reset password** template
2. Replace with:

**Subject:**
```
Reset your password
```

**Body:**
```html
<h2>Hi {{ .Name }},</h2>

<p>We received a request to reset your password.</p>

<p>Click the link below to set a new password:</p>

<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>

<p>This link will expire in 30 minutes.</p>

<p>If you didn't request this, you can safely ignore this email.</p>

<p>Best,<br>DataFlow Team</p>
```

### Magic Link Template

1. Select **Magic Link** template
2. Replace with:

**Subject:**
```
Your magic link to sign in
```

**Body:**
```html
<h2>Hi {{ .Name }},</h2>

<p>Click the link below to sign in to your DataFlow account:</p>

<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>

<p>This link will expire in 15 minutes.</p>

<p>If you didn't request this, you can safely ignore this email.</p>

<p>Best,<br>DataFlow Team</p>
```

---

## ⚙️ Step 3: Environment Variables

Your `.env.local` already has the SMTP credentials configured:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=info@dataproflow.com
SMTP_PASSWORD=ftluztzbecnxrlvv
SMTP_FROM_EMAIL=info@dataproflow.com
SMTP_FROM_NAME=DataFlow Team
```

✅ **Already configured!**

---

## 🧪 Step 4: Testing Email Delivery

### Test Welcome Email

1. Start your dev server: `npm run dev`
2. Sign up with a new account using Google OAuth
3. Check the email inbox for:
   - ✅ Email verification (from Supabase)
   - ✅ Welcome email (from custom service)
   - ✅ Admin notification (to info@dataproflow.com)

### Test Subscription Email

1. Login to your account
2. Go to `/dashboard/plans`
3. Click **Upgrade** and complete payment with test card: `4242 4242 4242 4242`
4. Check email for subscription confirmation

### Test Password Reset

1. Go to `/forgot-password`
2. Enter your email
3. Check email for password reset link

---

## 📅 Step 5: Set Up Trial Email Scheduler (Optional)

For trial check-in and trial ending emails, you need to set up a cron job or scheduled task.

### Option A: Vercel Cron Jobs (Production)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/trial-emails",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Option B: Manual Trigger (Development)

Call the API endpoint manually:
```bash
curl http://localhost:3000/api/cron/trial-emails
```

---

## 🔍 Troubleshooting

### Emails Not Sending

1. **Check SMTP credentials:**
   - Verify username and password are correct
   - For Gmail, use an App Password, not your regular password

2. **Check Supabase SMTP settings:**
   - Make sure "Enable Custom SMTP" is toggled ON
   - Click "Send test email" to verify connection

3. **Check server logs:**
   ```bash
   npm run dev
   ```
   Look for "Email sent successfully" or error messages

4. **Check spam folder:**
   - Emails might be filtered as spam initially
   - Mark as "Not Spam" to train filters

### Gmail App Password Setup

If using Gmail SMTP, you need an App Password:

1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate new app password for "Mail"
5. Use this password in SMTP_PASSWORD

---

## ✅ Email Checklist

- [x] SMTP configured in Supabase Dashboard
- [x] Email templates updated in Supabase
- [x] Environment variables set in `.env.local`
- [x] Welcome email implemented
- [x] Subscription confirmation email implemented
- [x] Admin notification email implemented
- [ ] Trial check-in email scheduler set up
- [ ] Trial ending email scheduler set up
- [ ] Test all email scenarios

---

## 📊 Email Sending Status

| Email Type | Trigger | Status | Notes |
|------------|---------|--------|-------|
| Email Verification | Signup | ✅ Configured | Handled by Supabase Auth |
| Welcome Email | After verification | ✅ Implemented | Sent via nodemailer |
| Trial Check-In | Day 6-7 | ⚠️ Needs Scheduler | Function ready, needs cron |
| Trial Ending | 2-3 days before end | ⚠️ Needs Scheduler | Function ready, needs cron |
| Password Reset | Password reset request | ✅ Configured | Handled by Supabase Auth |
| Subscription Confirmation | After payment | ✅ Implemented | Sent via webhook |
| Admin Notification | New signup | ✅ Implemented | Sent to admin email |

---

## 🎯 Next Steps

1. **Test all email flows** - Sign up, reset password, upgrade subscription
2. **Set up cron jobs** - For trial emails (optional but recommended)
3. **Monitor email delivery** - Check logs and user feedback
4. **Adjust templates** - Customize wording and branding as needed

---

## 📧 Support

If emails are not working:
- Check server logs for errors
- Verify SMTP credentials
- Test SMTP connection in Supabase Dashboard
- Contact support if issues persist
