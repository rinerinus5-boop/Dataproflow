-- Support Chat System Tables
-- Migration: 004_support_chat.sql

-- Create support_conversations table
CREATE TABLE IF NOT EXISTS support_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_email TEXT,
  guest_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waiting_for_human', 'with_human', 'ended', 'resolved')),
  assigned_agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai', 'agent', 'system')),
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'form', 'booking', 'rating')),
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create support_tickets table (for escalated issues)
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES support_conversations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  help_type TEXT NOT NULL,
  destination TEXT,
  data_source TEXT,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed')),
  assigned_agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  meeting_link TEXT,
  meeting_scheduled_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create support_attachments table
CREATE TABLE IF NOT EXISTS support_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES support_messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create support_ratings table
CREATE TABLE IF NOT EXISTS support_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_conversations_user_id ON support_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_support_conversations_status ON support_conversations(status);
CREATE INDEX IF NOT EXISTS idx_support_conversations_assigned_agent ON support_conversations(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_conversation_id ON support_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_support_conversations_updated_at ON support_conversations;
CREATE TRIGGER update_support_conversations_updated_at
  BEFORE UPDATE ON support_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ticket_number ON support_tickets;
CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL OR NEW.ticket_number = '')
  EXECUTE FUNCTION generate_ticket_number();

-- Enable RLS
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON support_conversations;
CREATE POLICY "Users can view own conversations"
  ON support_conversations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create conversations" ON support_conversations;
CREATE POLICY "Users can create conversations"
  ON support_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own conversations" ON support_conversations;
CREATE POLICY "Users can update own conversations"
  ON support_conversations FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all conversations" ON support_conversations;
CREATE POLICY "Admins can manage all conversations"
  ON support_conversations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for support_messages
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON support_messages;
CREATE POLICY "Users can view messages in own conversations"
  ON support_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create messages in own conversations" ON support_messages;
CREATE POLICY "Users can create messages in own conversations"
  ON support_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_conversations
      WHERE id = conversation_id AND (user_id = auth.uid() OR user_id IS NULL)
    )
  );

DROP POLICY IF EXISTS "Admins can manage all messages" ON support_messages;
CREATE POLICY "Admins can manage all messages"
  ON support_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for support_tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admins can manage all tickets" ON support_tickets;
CREATE POLICY "Admins can manage all tickets"
  ON support_tickets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for support_attachments
DROP POLICY IF EXISTS "Users can view attachments in own conversations" ON support_attachments;
CREATE POLICY "Users can view attachments in own conversations"
  ON support_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_messages m
      JOIN support_conversations c ON m.conversation_id = c.id
      WHERE m.id = message_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all attachments" ON support_attachments;
CREATE POLICY "Admins can manage all attachments"
  ON support_attachments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for support_ratings
DROP POLICY IF EXISTS "Users can manage own ratings" ON support_ratings;
CREATE POLICY "Users can manage own ratings"
  ON support_ratings FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all ratings" ON support_ratings;
CREATE POLICY "Admins can view all ratings"
  ON support_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
