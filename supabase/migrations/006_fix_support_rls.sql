-- Fix RLS policies for support_conversations to allow both logged-in users and guests

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own conversations" ON support_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON support_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON support_conversations;
DROP POLICY IF EXISTS "Admins can manage all conversations" ON support_conversations;

-- Recreate policies with proper checks

-- Allow users to view their own conversations
CREATE POLICY "Users can view own conversations"
  ON support_conversations FOR SELECT
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow anyone to create conversations (logged in or guest)
CREATE POLICY "Anyone can create conversations"
  ON support_conversations FOR INSERT
  WITH CHECK (
    user_id IS NULL 
    OR auth.uid() = user_id
    OR auth.uid() IS NOT NULL
  );

-- Allow users to update their own conversations
CREATE POLICY "Users can update own conversations"
  ON support_conversations FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow admins full access
CREATE POLICY "Admins can manage all conversations"
  ON support_conversations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Fix support_messages policies too
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON support_messages;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON support_messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON support_messages;

-- Allow viewing messages in own conversations
CREATE POLICY "Users can view messages in own conversations"
  ON support_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_conversations
      WHERE id = conversation_id 
      AND (user_id = auth.uid() OR user_id IS NULL)
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow creating messages in conversations
CREATE POLICY "Anyone can create messages"
  ON support_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_conversations
      WHERE id = conversation_id 
      AND (user_id = auth.uid() OR user_id IS NULL OR auth.uid() IS NOT NULL)
    )
  );

-- Allow admins full access to messages
CREATE POLICY "Admins can manage all messages"
  ON support_messages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
