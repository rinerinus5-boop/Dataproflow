# Facebook & Instagram OAuth Setup Guide (New Meta UI 2024+)

This guide explains how to set up Facebook and Instagram OAuth with the **new Meta for Developers platform** (2024+ UI).

---

## 🎯 What Changed in the New Meta UI

The new Meta platform has significantly simplified the app creation process:

- **No separate "Products" section** - Everything is managed through "Use Cases"
- **Basic permissions only by default** - `email` and `public_profile`
- **Advanced permissions require App Review** - Pages, Instagram, etc.
- **Simplified permission model** - Fewer granular permissions

---

## 📋 Current Implementation Status

### ✅ What Works Now (Basic Permissions)

With your current setup, the OAuth flow will:
- ✅ Authenticate users via Facebook Login
- ✅ Get user's basic profile info (name, email, profile picture)
- ✅ Store the connection in your database
- ✅ Get a long-lived access token (60 days)

### ⚠️ What Requires App Review (Advanced Permissions)

To access full Instagram and Facebook Page features, you'll need:
- 📄 **Business Verification** - Verify your business with Meta
- 🔍 **App Review** - Submit your app for review to get:
  - `pages_show_list` - List Facebook Pages
  - `pages_read_engagement` - Read Page engagement data
  - `instagram_basic` - Access Instagram Business Account data
  - `instagram_manage_insights` - Read Instagram insights

---

## 🛠️ Setup Instructions

### Step 1: Configure Your Meta App

1. **Go to Meta for Developers**
   - Visit: https://developers.facebook.com/apps
   - Click your app: `1449382086600482` (Dataflow)

2. **Verify Use Case is Selected**
   - Left sidebar → **Use cases**
   - You should see: ✅ **"Authenticate and request data from users with Facebook Login"**

3. **Configure OAuth Redirect URI**
   - Left sidebar → **Use cases** → Click your use case
   - Click **"Customize"** tab
   - Click **"Settings"** in the left menu
   - Scroll to **"Valid OAuth Redirect URIs"**
   - Add:
     ```
     http://localhost:3000/api/oauth/facebook/callback
     ```
   - For production, also add:
     ```
     https://yourdomain.com/api/oauth/facebook/callback
     ```
   - Click **"Save Changes"**

4. **Get Your Credentials**
   - Left sidebar → **App settings** → **Basic**
   - Copy **App ID**: `1449382086600482` ✓
   - Click **"Show"** next to **App Secret** and copy it
   - Already added to your `.env.local` ✓

### Step 2: Environment Variables

Your `.env.local` is already configured:

```env
FACEBOOK_APP_ID=1449382086600482
FACEBOOK_APP_SECRET=8d59a8ca108b88909be1959725269905
```

✅ **Already set up correctly!**

---

## 🧪 Testing Instructions

### Test Facebook Connection

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Login to your app**
   - Go to: `http://localhost:3000/login`
   - Login with your account

3. **Go to Connections page**
   - Navigate to: `http://localhost:3000/dashboard/connections`

4. **Click "Connect" on Facebook**
   - You'll be redirected to Facebook
   - Login with a Facebook account (use a test user or your own)
   - Click **"Continue as [Your Name]"**
   - Authorize the app

5. **Expected Result**
   - Redirected back to `/dashboard/connections?success=facebook`
   - Facebook connection appears in your connected accounts
   - Shows your Facebook name and profile picture
   - Note in metadata: "Basic permissions only"

### Test Instagram Connection

1. **Same steps as Facebook**
   - Click "Connect" on Instagram
   - Same OAuth flow (uses Facebook Login)

2. **Expected Result**
   - Redirected back to `/dashboard/connections?success=instagram`
   - Instagram connection appears (using Facebook profile data)
   - Note in metadata: "Basic permissions only - requires App Review for full Instagram access"

---

## 📊 What Data You'll Get

### With Basic Permissions (Current)

```json
{
  "id": "facebook_user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "picture": {
    "data": {
      "url": "https://platform-lookaside.fbsbx.com/..."
    }
  }
}
```

### After App Review (Future)

Once you complete App Review, you'll be able to access:
- Facebook Pages the user manages
- Instagram Business Accounts linked to those pages
- Page insights and analytics
- Instagram media and insights

---

## 🚀 Next Steps for Production

### 1. Business Verification

Before submitting for App Review, you need to verify your business:

1. Go to **App settings** → **Basic**
2. Scroll to **Business Verification**
3. Click **"Start Verification"**
4. Provide:
   - Business documents
   - Business phone number
   - Business email
   - Website URL

### 2. App Review Submission

After business verification:

1. Go to **Use cases** → **Customize**
2. Click **"Permissions and features"**
3. Click **"+ Add"** next to the permissions you need:
   - `pages_show_list`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_manage_insights`

4. For each permission, provide:
   - **Screencast** - Video showing how you use the permission
   - **Step-by-step instructions** - Written guide
   - **Privacy Policy URL** - Required
   - **Terms of Service URL** - Required

5. Submit for review (typically takes 3-5 business days)

### 3. Switch to Live Mode

Once approved:

1. Go to **App settings** → **Basic**
2. Toggle **App Mode** from "Development" to "Live"
3. Update your redirect URIs to production URLs
4. Test with real users

---

## 🐛 Troubleshooting

### Error: "oauth_denied"
- User clicked "Cancel" during OAuth flow
- Solution: Try connecting again

### Error: "missing_params"
- OAuth callback missing code or state parameter
- Solution: Check redirect URI configuration

### Error: "save_failed"
- Database error when saving connection
- Solution: Check Supabase connection and RLS policies

### Error: "callback_failed"
- General OAuth error
- Solution: Check browser console and server logs for details

---

## 📝 Important Notes

1. **Development Mode Limitations**
   - Only you (app admin) and test users can use the app
   - Add test users in **App roles** → **Roles**

2. **Token Expiration**
   - Short-lived tokens: 1-2 hours
   - Long-lived tokens: ~60 days
   - Implement token refresh logic for production

3. **Rate Limits**
   - Development mode: Lower rate limits
   - Production mode: Higher limits after going live

4. **Privacy Policy Required**
   - Required for App Review
   - Must be publicly accessible
   - Should explain data usage

---

## 🔗 Useful Links

- [Meta for Developers](https://developers.facebook.com/)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [App Review Guidelines](https://developers.facebook.com/docs/app-review/)
- [Business Verification](https://developers.facebook.com/docs/development/release/business-verification/)

---

## ✅ Summary

Your Facebook and Instagram OAuth is now configured to work with the **new Meta UI**. The current implementation uses **basic permissions** (`email`, `public_profile`) which work without App Review.

For full Instagram and Facebook Page access, you'll need to:
1. Complete Business Verification
2. Submit for App Review
3. Get approved for advanced permissions
4. Switch to Live mode

The basic implementation is ready for testing now! 🎉
