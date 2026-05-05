# DataFlow SaaS Platform - Setup Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Stripe account (test mode for development)

## 1. Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and keys from Settings > API

### Run the Database Schema

1. Go to your Supabase Dashboard > SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Run the SQL to create all tables, triggers, and policies

### Enable Email Auth

1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email templates if desired

### Enable Google OAuth (Optional)

1. Go to Authentication > Providers > Google
2. Add your Google OAuth credentials
3. Add `http://localhost:3000/auth/callback` to redirect URLs

## 2. Stripe Setup

### Create Products and Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create 3 products: Starter, Professional, Enterprise
3. For each product, create 2 prices:
   - Monthly recurring price
   - Annual recurring price (with discount)
4. Copy the Price IDs to your `.env.local`

### Set Up Webhook (for production)

1. Go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to `.env.local`

### Local Webhook Testing

```bash
# Install Stripe CLI
# Then run:
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Supabase (from your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs
STRIPE_STARTER_MONTHLY_PRICE_ID=price_xxx
STRIPE_STARTER_ANNUAL_PRICE_ID=price_xxx
STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=price_xxx
STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_xxx
```

## 4. Run the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## 5. Create Admin User

1. Sign up with your email at `/signup`
2. Verify your email
3. Go to Supabase Dashboard > Table Editor > profiles
4. Find your user and change `role` from `user` to `admin`
5. Now you can access `/admin`

## Testing the Application

### Test Signup Flow

1. Go to `http://localhost:3000/signup`
2. Create an account with email/password
3. Check your email for verification link
4. Click the link to verify and be redirected to dashboard

### Test Login Flow

1. Go to `http://localhost:3000/login`
2. Enter your credentials
3. You should be redirected to `/dashboard`

### Test Admin Panel

1. Make sure your user has `role: admin` in the database
2. Go to `http://localhost:3000/admin`
3. You should see the admin dashboard with user list

### Test Stripe Checkout (Test Mode)

1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future expiry date and any CVC
3. The subscription should be created and user upgraded

## Project Structure

```
dataflow/
├── app/
│   ├── api/
│   │   ├── auth/           # Auth API routes
│   │   └── stripe/         # Stripe API routes
│   ├── admin/              # Admin panel
│   ├── dashboard/          # User dashboard
│   ├── auth/               # Auth callback & error pages
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   └── ...                 # Other pages
├── lib/
│   ├── supabase/           # Supabase client utilities
│   ├── stripe.ts           # Stripe configuration
│   └── types/              # TypeScript types
├── supabase/
│   └── schema.sql          # Database schema
└── middleware.ts           # Route protection
```

## Key Features Implemented

- **Authentication**: Email/password + Google OAuth via Supabase
- **Email Verification**: Required before full access
- **User Dashboard**: View connected accounts, subscription status
- **Admin Panel**: View all users, subscription status, manage accounts
- **Stripe Integration**: Checkout, webhooks, billing portal
- **Route Protection**: Middleware protects `/dashboard` and `/admin`
- **14-day Trial**: Automatic trial on signup

## Next Steps (Phase 2)

- [ ] Connect Instagram API
- [ ] Connect Facebook API
- [ ] Connect TikTok API
- [ ] Build analytics dashboard
- [ ] Add data visualization charts
- [ ] Export to Google Sheets/Looker Studio
