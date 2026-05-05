import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getChatCompletion } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    
    // Get current user (optional - guests can chat without being logged in)
    let userId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch {
      // Guest user - no auth
    }

    const body = await request.json();
    const { message, conversationId, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let currentConversationId = conversationId;

    // Create new conversation if needed (use admin client to bypass RLS)
    if (!currentConversationId) {
      const { data: conversation, error: convError } = await adminSupabase
        .from('support_conversations')
        .insert({
          user_id: userId,
          status: 'active',
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        );
      }

      currentConversationId = conversation.id;
    }

    // Save user message (use admin client to bypass RLS)
    const { error: msgError } = await adminSupabase
      .from('support_messages')
      .insert({
        conversation_id: currentConversationId,
        sender_type: 'user',
        sender_id: userId,
        content: message,
        message_type: 'text',
      });

    if (msgError) {
      console.error('Error saving message:', msgError);
    }

    // Update conversation last_message_at
    await adminSupabase
      .from('support_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', currentConversationId);

    // Build messages for OpenAI
    const messages: { role: 'user' | 'assistant'; content: string }[] = [];
    
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (msg.type === 'user') {
          messages.push({ role: 'user', content: msg.content });
        } else if (msg.type === 'ai') {
          messages.push({ role: 'assistant', content: msg.content });
        }
      }
    }
    
    messages.push({ role: 'user', content: message });

    // Get AI response
    const aiResponse = await getChatCompletion(messages);

    // Save AI response (use admin client to bypass RLS)
    const { data: aiMessage, error: aiMsgError } = await adminSupabase
      .from('support_messages')
      .insert({
        conversation_id: currentConversationId,
        sender_type: 'ai',
        content: aiResponse,
        message_type: 'text',
      })
      .select()
      .single();

    if (aiMsgError) {
      console.error('Error saving AI message:', aiMsgError);
    }

    return NextResponse.json({
      success: true,
      conversationId: currentConversationId,
      message: {
        id: aiMessage?.id || crypto.randomUUID(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ conversations: [] });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Get messages for specific conversation
      const { data: messages, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
          { error: 'Failed to fetch messages' },
          { status: 500 }
        );
      }

      return NextResponse.json({ messages });
    }

    // Get all conversations for user
    const { data: conversations, error } = await supabase
      .from('support_conversations')
      .select(`
        *,
        support_messages (
          id,
          content,
          sender_type,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
