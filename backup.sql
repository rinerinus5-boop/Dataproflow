


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."generate_ticket_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_ticket_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Create profile (use ON CONFLICT to handle duplicates)
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create trial subscription (use ON CONFLICT to handle duplicates)
  INSERT INTO public.subscriptions (user_id, plan, status, trial_end)
  VALUES (
    NEW.id,
    'starter',
    'trialing',
    NOW() + INTERVAL '14 days'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_admin_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."notify_admin_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_admin_subscription_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."notify_admin_subscription_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "user_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "admin_notifications_type_check" CHECK (("type" = ANY (ARRAY['new_registration'::"text", 'subscription_created'::"text", 'subscription_cancelled'::"text", 'subscription_upgraded'::"text", 'subscription_downgraded'::"text", 'trial_ending'::"text", 'payment_failed'::"text"])))
);


ALTER TABLE "public"."admin_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audience_demographics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "connected_account_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "platform" "text" NOT NULL,
    "recorded_at" "date" NOT NULL,
    "age_distribution" "jsonb" DEFAULT '{}'::"jsonb",
    "gender_distribution" "jsonb" DEFAULT '{}'::"jsonb",
    "country_distribution" "jsonb" DEFAULT '{}'::"jsonb",
    "city_distribution" "jsonb" DEFAULT '{}'::"jsonb",
    "active_hours" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "audience_demographics_platform_check" CHECK (("platform" = ANY (ARRAY['instagram'::"text", 'facebook'::"text", 'tiktok'::"text"])))
);


ALTER TABLE "public"."audience_demographics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."booking_availability" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_user_id" "uuid" NOT NULL,
    "day_of_week" integer NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "booking_availability_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6)))
);


ALTER TABLE "public"."booking_availability" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."booking_blocked_dates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_user_id" "uuid" NOT NULL,
    "blocked_date" "date" NOT NULL,
    "reason" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."booking_blocked_dates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calendar_bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "guest_name" character varying(255) NOT NULL,
    "guest_email" character varying(255) NOT NULL,
    "booking_date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "timezone" character varying(100) DEFAULT 'UTC'::character varying,
    "meeting_type" character varying(50) DEFAULT 'support_call'::character varying,
    "subject" character varying(500),
    "description" "text",
    "google_event_id" character varying(255),
    "google_meet_link" "text",
    "status" character varying(50) DEFAULT 'scheduled'::character varying,
    "ticket_id" "uuid",
    "conversation_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."calendar_bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."connected_accounts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "platform" "text" NOT NULL,
    "platform_user_id" "text" NOT NULL,
    "platform_username" "text",
    "access_token" "text" NOT NULL,
    "refresh_token" "text",
    "token_expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "connector_id" character varying(255),
    CONSTRAINT "connected_accounts_platform_check" CHECK (("platform" = ANY (ARRAY['instagram'::"text", 'facebook'::"text", 'tiktok'::"text"])))
);


ALTER TABLE "public"."connected_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dashboards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "input_id" "uuid",
    "looker_url" "text",
    "embed_url" "text",
    "status" character varying(50) DEFAULT 'pending'::character varying,
    "error_message" "text",
    "generated_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."dashboards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."google_calendar_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "access_token" "text" NOT NULL,
    "refresh_token" "text",
    "expiry_date" timestamp with time zone,
    "scope" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."google_calendar_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."platform_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "connected_account_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "platform" "text" NOT NULL,
    "metric_date" "date" NOT NULL,
    "followers_count" integer DEFAULT 0,
    "following_count" integer DEFAULT 0,
    "posts_count" integer DEFAULT 0,
    "total_likes" integer DEFAULT 0,
    "total_comments" integer DEFAULT 0,
    "total_shares" integer DEFAULT 0,
    "total_views" integer DEFAULT 0,
    "total_reach" integer DEFAULT 0,
    "total_impressions" integer DEFAULT 0,
    "engagement_rate" numeric(5,2) DEFAULT 0,
    "platform_data" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "platform_metrics_platform_check" CHECK (("platform" = ANY (ARRAY['instagram'::"text", 'facebook'::"text", 'tiktok'::"text"])))
);


ALTER TABLE "public"."platform_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."platform_posts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "connected_account_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "platform" "text" NOT NULL,
    "platform_post_id" "text" NOT NULL,
    "post_type" "text",
    "caption" "text",
    "media_url" "text",
    "thumbnail_url" "text",
    "permalink" "text",
    "likes_count" integer DEFAULT 0,
    "comments_count" integer DEFAULT 0,
    "shares_count" integer DEFAULT 0,
    "views_count" integer DEFAULT 0,
    "reach_count" integer DEFAULT 0,
    "impressions_count" integer DEFAULT 0,
    "saves_count" integer DEFAULT 0,
    "posted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "platform_data" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "platform_posts_platform_check" CHECK (("platform" = ANY (ARRAY['instagram'::"text", 'facebook'::"text", 'tiktok'::"text"])))
);


ALTER TABLE "public"."platform_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "email_verified" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "notification_preferences" "jsonb" DEFAULT '{"email": true, "weekly": true, "marketing": false}'::"jsonb",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "plan" "text" DEFAULT 'starter'::"text" NOT NULL,
    "status" "text" DEFAULT 'trialing'::"text" NOT NULL,
    "billing_period" "text" DEFAULT 'monthly'::"text" NOT NULL,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean DEFAULT false NOT NULL,
    "trial_end" timestamp with time zone DEFAULT ("now"() + '14 days'::interval),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "subscriptions_billing_period_check" CHECK (("billing_period" = ANY (ARRAY['monthly'::"text", 'annual'::"text"]))),
    CONSTRAINT "subscriptions_plan_check" CHECK (("plan" = ANY (ARRAY['starter'::"text", 'professional'::"text", 'enterprise'::"text"]))),
    CONSTRAINT "subscriptions_status_check" CHECK (("status" = ANY (ARRAY['trialing'::"text", 'active'::"text", 'canceled'::"text", 'past_due'::"text", 'unpaid'::"text", 'incomplete'::"text"])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_attachments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "message_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "file_size" integer NOT NULL,
    "file_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."support_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_conversations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "guest_email" "text",
    "guest_name" "text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "assigned_agent_id" "uuid",
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ended_at" timestamp with time zone,
    "last_message_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "support_conversations_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'waiting_for_human'::"text", 'with_human'::"text", 'ended'::"text", 'resolved'::"text"])))
);


ALTER TABLE "public"."support_conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_type" "text" NOT NULL,
    "sender_id" "uuid",
    "content" "text" NOT NULL,
    "message_type" "text" DEFAULT 'text'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "support_messages_message_type_check" CHECK (("message_type" = ANY (ARRAY['text'::"text", 'file'::"text", 'form'::"text", 'booking'::"text", 'rating'::"text"]))),
    CONSTRAINT "support_messages_sender_type_check" CHECK (("sender_type" = ANY (ARRAY['user'::"text", 'ai'::"text", 'agent'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."support_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_ratings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "rating" integer NOT NULL,
    "feedback" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "support_ratings_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."support_ratings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_tickets" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "conversation_id" "uuid",
    "user_id" "uuid",
    "ticket_number" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "help_type" "text" NOT NULL,
    "destination" "text",
    "data_source" "text",
    "user_name" "text" NOT NULL,
    "user_email" "text" NOT NULL,
    "priority" "text" DEFAULT 'normal'::"text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "assigned_agent_id" "uuid",
    "meeting_link" "text",
    "meeting_scheduled_at" timestamp with time zone,
    "resolved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "support_tickets_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "support_tickets_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'in_progress'::"text", 'waiting_for_customer'::"text", 'resolved'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."support_tickets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sync_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "connected_account_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "platform" "text" NOT NULL,
    "sync_type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "error_message" "text",
    "records_synced" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "sync_logs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'running'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."sync_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(255) NOT NULL,
    "description" "text",
    "category" character varying(100) NOT NULL,
    "thumbnail_url" "text",
    "preview_images" "text"[],
    "required_platforms" "text"[] NOT NULL,
    "metrics_included" "text"[],
    "looker_studio_template_id" character varying(255),
    "looker_studio_url" "text",
    "is_featured" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_inputs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "email" character varying(255) NOT NULL,
    "name" character varying(255) NOT NULL,
    "company_name" character varying(255),
    "industry" character varying(255),
    "business_size" character varying(100),
    "monthly_revenue" character varying(100),
    "marketing_channels" "jsonb" DEFAULT '[]'::"jsonb",
    "main_goals" "jsonb" DEFAULT '[]'::"jsonb",
    "current_challenges" "text",
    "answers" "jsonb" DEFAULT '{}'::"jsonb",
    "status" character varying(50) DEFAULT 'pending'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_inputs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "template_id" "uuid" NOT NULL,
    "looker_studio_report_url" "text",
    "last_accessed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_templates" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_notifications"
    ADD CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audience_demographics"
    ADD CONSTRAINT "audience_demographics_connected_account_id_recorded_at_key" UNIQUE ("connected_account_id", "recorded_at");



ALTER TABLE ONLY "public"."audience_demographics"
    ADD CONSTRAINT "audience_demographics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."booking_availability"
    ADD CONSTRAINT "booking_availability_admin_user_id_day_of_week_key" UNIQUE ("admin_user_id", "day_of_week");



ALTER TABLE ONLY "public"."booking_availability"
    ADD CONSTRAINT "booking_availability_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."booking_blocked_dates"
    ADD CONSTRAINT "booking_blocked_dates_admin_user_id_blocked_date_key" UNIQUE ("admin_user_id", "blocked_date");



ALTER TABLE ONLY "public"."booking_blocked_dates"
    ADD CONSTRAINT "booking_blocked_dates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calendar_bookings"
    ADD CONSTRAINT "calendar_bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."connected_accounts"
    ADD CONSTRAINT "connected_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."connected_accounts"
    ADD CONSTRAINT "connected_accounts_user_id_platform_platform_user_id_key" UNIQUE ("user_id", "platform", "platform_user_id");



ALTER TABLE ONLY "public"."dashboards"
    ADD CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."google_calendar_tokens"
    ADD CONSTRAINT "google_calendar_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."google_calendar_tokens"
    ADD CONSTRAINT "google_calendar_tokens_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."platform_metrics"
    ADD CONSTRAINT "platform_metrics_connected_account_id_metric_date_key" UNIQUE ("connected_account_id", "metric_date");



ALTER TABLE ONLY "public"."platform_metrics"
    ADD CONSTRAINT "platform_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_posts"
    ADD CONSTRAINT "platform_posts_connected_account_id_platform_post_id_key" UNIQUE ("connected_account_id", "platform_post_id");



ALTER TABLE ONLY "public"."platform_posts"
    ADD CONSTRAINT "platform_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."support_attachments"
    ADD CONSTRAINT "support_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_conversations"
    ADD CONSTRAINT "support_conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_messages"
    ADD CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_ratings"
    ADD CONSTRAINT "support_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_ticket_number_key" UNIQUE ("ticket_number");



ALTER TABLE ONLY "public"."sync_logs"
    ADD CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."user_inputs"
    ADD CONSTRAINT "user_inputs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_templates"
    ADD CONSTRAINT "user_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_templates"
    ADD CONSTRAINT "user_templates_user_id_template_id_key" UNIQUE ("user_id", "template_id");



CREATE INDEX "idx_admin_notifications_created_at" ON "public"."admin_notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_admin_notifications_is_read" ON "public"."admin_notifications" USING "btree" ("is_read");



CREATE INDEX "idx_admin_notifications_type" ON "public"."admin_notifications" USING "btree" ("type");



CREATE INDEX "idx_audience_demographics_account" ON "public"."audience_demographics" USING "btree" ("connected_account_id");



CREATE INDEX "idx_booking_availability_day" ON "public"."booking_availability" USING "btree" ("day_of_week");



CREATE INDEX "idx_calendar_bookings_date" ON "public"."calendar_bookings" USING "btree" ("booking_date");



CREATE INDEX "idx_calendar_bookings_guest_email" ON "public"."calendar_bookings" USING "btree" ("guest_email");



CREATE INDEX "idx_calendar_bookings_status" ON "public"."calendar_bookings" USING "btree" ("status");



CREATE INDEX "idx_connected_accounts_platform" ON "public"."connected_accounts" USING "btree" ("platform");



CREATE INDEX "idx_connected_accounts_user_id" ON "public"."connected_accounts" USING "btree" ("user_id");



CREATE INDEX "idx_dashboards_input_id" ON "public"."dashboards" USING "btree" ("input_id");



CREATE INDEX "idx_dashboards_status" ON "public"."dashboards" USING "btree" ("status");



CREATE INDEX "idx_dashboards_user_id" ON "public"."dashboards" USING "btree" ("user_id");



CREATE INDEX "idx_platform_metrics_account" ON "public"."platform_metrics" USING "btree" ("connected_account_id");



CREATE INDEX "idx_platform_metrics_date" ON "public"."platform_metrics" USING "btree" ("metric_date");



CREATE INDEX "idx_platform_metrics_platform" ON "public"."platform_metrics" USING "btree" ("platform");



CREATE INDEX "idx_platform_metrics_user" ON "public"."platform_metrics" USING "btree" ("user_id");



CREATE INDEX "idx_platform_posts_account" ON "public"."platform_posts" USING "btree" ("connected_account_id");



CREATE INDEX "idx_platform_posts_posted" ON "public"."platform_posts" USING "btree" ("posted_at");



CREATE INDEX "idx_platform_posts_user" ON "public"."platform_posts" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_subscriptions_status" ON "public"."subscriptions" USING "btree" ("status");



CREATE INDEX "idx_subscriptions_stripe_customer_id" ON "public"."subscriptions" USING "btree" ("stripe_customer_id");



CREATE INDEX "idx_subscriptions_user_id" ON "public"."subscriptions" USING "btree" ("user_id");



CREATE INDEX "idx_support_conversations_assigned_agent" ON "public"."support_conversations" USING "btree" ("assigned_agent_id");



CREATE INDEX "idx_support_conversations_status" ON "public"."support_conversations" USING "btree" ("status");



CREATE INDEX "idx_support_conversations_user_id" ON "public"."support_conversations" USING "btree" ("user_id");



CREATE INDEX "idx_support_messages_conversation_id" ON "public"."support_messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_support_messages_created_at" ON "public"."support_messages" USING "btree" ("created_at");



CREATE INDEX "idx_support_tickets_status" ON "public"."support_tickets" USING "btree" ("status");



CREATE INDEX "idx_support_tickets_ticket_number" ON "public"."support_tickets" USING "btree" ("ticket_number");



CREATE INDEX "idx_support_tickets_user_id" ON "public"."support_tickets" USING "btree" ("user_id");



CREATE INDEX "idx_sync_logs_account" ON "public"."sync_logs" USING "btree" ("connected_account_id");



CREATE INDEX "idx_user_inputs_email" ON "public"."user_inputs" USING "btree" ("email");



CREATE INDEX "idx_user_inputs_status" ON "public"."user_inputs" USING "btree" ("status");



CREATE INDEX "idx_user_inputs_user_id" ON "public"."user_inputs" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "on_new_user_notify_admin" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."notify_admin_new_user"();



CREATE OR REPLACE TRIGGER "on_subscription_change_notify_admin" AFTER INSERT OR UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."notify_admin_subscription_change"();



CREATE OR REPLACE TRIGGER "set_ticket_number" BEFORE INSERT ON "public"."support_tickets" FOR EACH ROW WHEN ((("new"."ticket_number" IS NULL) OR ("new"."ticket_number" = ''::"text"))) EXECUTE FUNCTION "public"."generate_ticket_number"();



CREATE OR REPLACE TRIGGER "update_audience_demographics_updated_at" BEFORE UPDATE ON "public"."audience_demographics" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_connected_accounts_updated_at" BEFORE UPDATE ON "public"."connected_accounts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_dashboards_updated_at" BEFORE UPDATE ON "public"."dashboards" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_platform_metrics_updated_at" BEFORE UPDATE ON "public"."platform_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_platform_posts_updated_at" BEFORE UPDATE ON "public"."platform_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_subscriptions_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_support_conversations_updated_at" BEFORE UPDATE ON "public"."support_conversations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_support_tickets_updated_at" BEFORE UPDATE ON "public"."support_tickets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_inputs_updated_at" BEFORE UPDATE ON "public"."user_inputs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admin_notifications"
    ADD CONSTRAINT "admin_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."audience_demographics"
    ADD CONSTRAINT "audience_demographics_connected_account_id_fkey" FOREIGN KEY ("connected_account_id") REFERENCES "public"."connected_accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audience_demographics"
    ADD CONSTRAINT "audience_demographics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."booking_availability"
    ADD CONSTRAINT "booking_availability_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."booking_blocked_dates"
    ADD CONSTRAINT "booking_blocked_dates_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calendar_bookings"
    ADD CONSTRAINT "calendar_bookings_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."support_conversations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."calendar_bookings"
    ADD CONSTRAINT "calendar_bookings_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."calendar_bookings"
    ADD CONSTRAINT "calendar_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."connected_accounts"
    ADD CONSTRAINT "connected_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dashboards"
    ADD CONSTRAINT "dashboards_input_id_fkey" FOREIGN KEY ("input_id") REFERENCES "public"."user_inputs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dashboards"
    ADD CONSTRAINT "dashboards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."google_calendar_tokens"
    ADD CONSTRAINT "google_calendar_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."platform_metrics"
    ADD CONSTRAINT "platform_metrics_connected_account_id_fkey" FOREIGN KEY ("connected_account_id") REFERENCES "public"."connected_accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."platform_metrics"
    ADD CONSTRAINT "platform_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."platform_posts"
    ADD CONSTRAINT "platform_posts_connected_account_id_fkey" FOREIGN KEY ("connected_account_id") REFERENCES "public"."connected_accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."platform_posts"
    ADD CONSTRAINT "platform_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_attachments"
    ADD CONSTRAINT "support_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."support_messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_conversations"
    ADD CONSTRAINT "support_conversations_assigned_agent_id_fkey" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."support_conversations"
    ADD CONSTRAINT "support_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."support_messages"
    ADD CONSTRAINT "support_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."support_conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_messages"
    ADD CONSTRAINT "support_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."support_ratings"
    ADD CONSTRAINT "support_ratings_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."support_conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_ratings"
    ADD CONSTRAINT "support_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_assigned_agent_id_fkey" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."support_conversations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."sync_logs"
    ADD CONSTRAINT "sync_logs_connected_account_id_fkey" FOREIGN KEY ("connected_account_id") REFERENCES "public"."connected_accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sync_logs"
    ADD CONSTRAINT "sync_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_inputs"
    ADD CONSTRAINT "user_inputs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_templates"
    ADD CONSTRAINT "user_templates_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_templates"
    ADD CONSTRAINT "user_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage all attachments" ON "public"."support_attachments" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage all conversations" ON "public"."support_conversations" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage all messages" ON "public"."support_messages" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage all tickets" ON "public"."support_tickets" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage availability" ON "public"."booking_availability" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage blocked dates" ON "public"."booking_blocked_dates" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can update all profiles" ON "public"."profiles" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can update all subscriptions" ON "public"."subscriptions" USING ((("auth"."uid"() = "user_id") OR "public"."is_admin"()));



CREATE POLICY "Admins can update bookings" ON "public"."calendar_bookings" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can update notifications" ON "public"."admin_notifications" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all bookings" ON "public"."calendar_bookings" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all connected accounts" ON "public"."connected_accounts" FOR SELECT USING ((("auth"."uid"() = "user_id") OR "public"."is_admin"()));



CREATE POLICY "Admins can view all demographics" ON "public"."audience_demographics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all metrics" ON "public"."platform_metrics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all notifications" ON "public"."admin_notifications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all posts" ON "public"."platform_posts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view all ratings" ON "public"."support_ratings" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all subscriptions" ON "public"."subscriptions" FOR SELECT USING ((("auth"."uid"() = "user_id") OR "public"."is_admin"()));



CREATE POLICY "Anyone can create bookings" ON "public"."calendar_bookings" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can create conversations" ON "public"."support_conversations" FOR INSERT WITH CHECK ((("user_id" IS NULL) OR ("auth"."uid"() = "user_id") OR ("auth"."uid"() IS NOT NULL)));



CREATE POLICY "Anyone can create messages" ON "public"."support_messages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."support_conversations"
  WHERE (("support_conversations"."id" = "support_messages"."conversation_id") AND (("support_conversations"."user_id" = "auth"."uid"()) OR ("support_conversations"."user_id" IS NULL) OR ("auth"."uid"() IS NOT NULL))))));



CREATE POLICY "Anyone can insert inputs" ON "public"."user_inputs" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can view active templates" ON "public"."templates" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view availability" ON "public"."booking_availability" FOR SELECT USING (true);



CREATE POLICY "Anyone can view blocked dates" ON "public"."booking_blocked_dates" FOR SELECT USING (true);



CREATE POLICY "Service can manage demographics" ON "public"."audience_demographics" USING (true) WITH CHECK (true);



CREATE POLICY "Service can manage metrics" ON "public"."platform_metrics" USING (true) WITH CHECK (true);



CREATE POLICY "Service can manage posts" ON "public"."platform_posts" USING (true) WITH CHECK (true);



CREATE POLICY "Service can manage sync logs" ON "public"."sync_logs" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can insert notifications" ON "public"."admin_notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Service role can manage dashboards" ON "public"."dashboards" USING (true);



CREATE POLICY "Users can create tickets" ON "public"."support_tickets" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)));



CREATE POLICY "Users can delete own tokens" ON "public"."google_calendar_tokens" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own templates" ON "public"."user_templates" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own tokens" ON "public"."google_calendar_tokens" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own connected accounts" ON "public"."connected_accounts" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own ratings" ON "public"."support_ratings" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own conversations" ON "public"."support_conversations" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own templates" ON "public"."user_templates" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own tokens" ON "public"."google_calendar_tokens" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own inputs" ON "public"."user_inputs" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view attachments in own conversations" ON "public"."support_attachments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."support_messages" "m"
     JOIN "public"."support_conversations" "c" ON (("m"."conversation_id" = "c"."id")))
  WHERE (("m"."id" = "support_attachments"."message_id") AND ("c"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view messages in own conversations" ON "public"."support_messages" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."support_conversations"
  WHERE (("support_conversations"."id" = "support_messages"."conversation_id") AND (("support_conversations"."user_id" = "auth"."uid"()) OR ("support_conversations"."user_id" IS NULL))))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can view own bookings" ON "public"."calendar_bookings" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (("guest_email")::"text" = (( SELECT "users"."email"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())))::"text")));



CREATE POLICY "Users can view own connected accounts" ON "public"."connected_accounts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own conversations" ON "public"."support_conversations" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can view own demographics" ON "public"."audience_demographics" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own metrics" ON "public"."platform_metrics" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own posts" ON "public"."platform_posts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own subscription" ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own sync logs" ON "public"."sync_logs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own templates" ON "public"."user_templates" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own tickets" ON "public"."support_tickets" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own tokens" ON "public"."google_calendar_tokens" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own dashboards" ON "public"."dashboards" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)));



CREATE POLICY "Users can view their own inputs" ON "public"."user_inputs" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)));



ALTER TABLE "public"."admin_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audience_demographics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."booking_availability" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."booking_blocked_dates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calendar_bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."connected_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dashboards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."google_calendar_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_tickets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sync_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_inputs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_templates" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."generate_ticket_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_ticket_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_ticket_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_admin_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_admin_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_admin_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_admin_subscription_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_admin_subscription_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_admin_subscription_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_notifications" TO "anon";
GRANT ALL ON TABLE "public"."admin_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."audience_demographics" TO "anon";
GRANT ALL ON TABLE "public"."audience_demographics" TO "authenticated";
GRANT ALL ON TABLE "public"."audience_demographics" TO "service_role";



GRANT ALL ON TABLE "public"."booking_availability" TO "anon";
GRANT ALL ON TABLE "public"."booking_availability" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_availability" TO "service_role";



GRANT ALL ON TABLE "public"."booking_blocked_dates" TO "anon";
GRANT ALL ON TABLE "public"."booking_blocked_dates" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_blocked_dates" TO "service_role";



GRANT ALL ON TABLE "public"."calendar_bookings" TO "anon";
GRANT ALL ON TABLE "public"."calendar_bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."calendar_bookings" TO "service_role";



GRANT ALL ON TABLE "public"."connected_accounts" TO "anon";
GRANT ALL ON TABLE "public"."connected_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."connected_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."dashboards" TO "anon";
GRANT ALL ON TABLE "public"."dashboards" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboards" TO "service_role";



GRANT ALL ON TABLE "public"."google_calendar_tokens" TO "anon";
GRANT ALL ON TABLE "public"."google_calendar_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."google_calendar_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."platform_metrics" TO "anon";
GRANT ALL ON TABLE "public"."platform_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."platform_posts" TO "anon";
GRANT ALL ON TABLE "public"."platform_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_posts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."support_attachments" TO "anon";
GRANT ALL ON TABLE "public"."support_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."support_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."support_conversations" TO "anon";
GRANT ALL ON TABLE "public"."support_conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."support_conversations" TO "service_role";



GRANT ALL ON TABLE "public"."support_messages" TO "anon";
GRANT ALL ON TABLE "public"."support_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."support_messages" TO "service_role";



GRANT ALL ON TABLE "public"."support_ratings" TO "anon";
GRANT ALL ON TABLE "public"."support_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."support_ratings" TO "service_role";



GRANT ALL ON TABLE "public"."support_tickets" TO "anon";
GRANT ALL ON TABLE "public"."support_tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."support_tickets" TO "service_role";



GRANT ALL ON TABLE "public"."sync_logs" TO "anon";
GRANT ALL ON TABLE "public"."sync_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."sync_logs" TO "service_role";



GRANT ALL ON TABLE "public"."templates" TO "anon";
GRANT ALL ON TABLE "public"."templates" TO "authenticated";
GRANT ALL ON TABLE "public"."templates" TO "service_role";



GRANT ALL ON TABLE "public"."user_inputs" TO "anon";
GRANT ALL ON TABLE "public"."user_inputs" TO "authenticated";
GRANT ALL ON TABLE "public"."user_inputs" TO "service_role";



GRANT ALL ON TABLE "public"."user_templates" TO "anon";
GRANT ALL ON TABLE "public"."user_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."user_templates" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































