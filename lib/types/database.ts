export type UserRole = "user" | "admin";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "canceled"
  | "past_due"
  | "unpaid"
  | "incomplete";

export type PlanType = "starter" | "professional" | "enterprise";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanType;
  status: SubscriptionStatus;
  billing_period: "monthly" | "annual";
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  platform: "instagram" | "facebook" | "tiktok";
  platform_user_id: string;
  platform_username: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithSubscription extends Profile {
  subscription: Subscription | null;
}

export type AdminNotificationType =
  | "new_registration"
  | "subscription_created"
  | "subscription_cancelled"
  | "subscription_upgraded"
  | "subscription_downgraded"
  | "trial_ending"
  | "payment_failed";

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  user_id: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}
