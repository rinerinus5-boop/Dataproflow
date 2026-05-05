-- Create admin_notifications table for tracking important events
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('new_registration', 'subscription_created', 'subscription_cancelled', 'subscription_upgraded', 'subscription_downgraded', 'trial_ending', 'payment_failed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);

-- Enable RLS
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view notifications
DROP POLICY IF EXISTS "Admins can view all notifications" ON admin_notifications;
CREATE POLICY "Admins can view all notifications"
  ON admin_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update notifications (mark as read)
DROP POLICY IF EXISTS "Admins can update notifications" ON admin_notifications;
CREATE POLICY "Admins can update notifications"
  ON admin_notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can insert notifications (for API routes)
DROP POLICY IF EXISTS "Service role can insert notifications" ON admin_notifications;
CREATE POLICY "Service role can insert notifications"
  ON admin_notifications FOR INSERT
  WITH CHECK (true);

-- Function to create admin notification on new user signup
CREATE OR REPLACE FUNCTION notify_admin_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_notifications (type, title, message, user_id, metadata)
  VALUES (
    'new_registration',
    'New User Registration',
    'A new user has registered: ' || COALESCE(NEW.email, 'Unknown'),
    NEW.id,
    jsonb_build_object('email', NEW.email, 'full_name', COALESCE(NEW.full_name, ''))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration notification
DROP TRIGGER IF EXISTS on_new_user_notify_admin ON profiles;
CREATE TRIGGER on_new_user_notify_admin
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_user();

-- Function to create admin notification on subscription changes
CREATE OR REPLACE FUNCTION notify_admin_subscription_change()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  notification_type TEXT;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email FROM profiles WHERE id = NEW.user_id;
  
  -- Determine notification type based on change
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    notification_type := 'subscription_created';
    notification_title := 'New Subscription';
    notification_message := 'User ' || COALESCE(user_email, 'Unknown') || ' subscribed to ' || NEW.plan || ' plan';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check for status changes
    IF OLD.status != 'active' AND NEW.status = 'active' THEN
      notification_type := 'subscription_created';
      notification_title := 'New Subscription';
      notification_message := 'User ' || COALESCE(user_email, 'Unknown') || ' subscribed to ' || NEW.plan || ' plan';
    ELSIF OLD.status = 'active' AND NEW.status = 'canceled' THEN
      notification_type := 'subscription_cancelled';
      notification_title := 'Subscription Cancelled';
      notification_message := 'User ' || COALESCE(user_email, 'Unknown') || ' cancelled their ' || OLD.plan || ' subscription';
    ELSIF OLD.status = 'active' AND NEW.status = 'past_due' THEN
      notification_type := 'payment_failed';
      notification_title := 'Payment Failed';
      notification_message := 'Payment failed for user ' || COALESCE(user_email, 'Unknown');
    ELSIF OLD.plan != NEW.plan AND NEW.status = 'active' THEN
      -- Plan change
      IF (OLD.plan = 'starter' AND NEW.plan IN ('professional', 'enterprise')) OR
         (OLD.plan = 'professional' AND NEW.plan = 'enterprise') THEN
        notification_type := 'subscription_upgraded';
        notification_title := 'Subscription Upgraded';
        notification_message := 'User ' || COALESCE(user_email, 'Unknown') || ' upgraded from ' || OLD.plan || ' to ' || NEW.plan;
      ELSE
        notification_type := 'subscription_downgraded';
        notification_title := 'Subscription Downgraded';
        notification_message := 'User ' || COALESCE(user_email, 'Unknown') || ' downgraded from ' || OLD.plan || ' to ' || NEW.plan;
      END IF;
    ELSE
      -- No significant change, don't create notification
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;
  
  -- Insert notification
  INSERT INTO admin_notifications (type, title, message, user_id, metadata)
  VALUES (
    notification_type,
    notification_title,
    notification_message,
    NEW.user_id,
    jsonb_build_object(
      'plan', NEW.plan,
      'status', NEW.status,
      'billing_period', NEW.billing_period,
      'email', user_email
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for subscription changes
DROP TRIGGER IF EXISTS on_subscription_change_notify_admin ON subscriptions;
CREATE TRIGGER on_subscription_change_notify_admin
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_subscription_change();
