import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Update conversation status to ended
    const { error } = await supabase
      .from('support_conversations')
      .update({ 
        status: 'ended',
        ended_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    if (error) {
      console.error('Error ending conversation:', error);
      return NextResponse.json(
        { error: 'Failed to end conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('End conversation API error:', error);
    return NextResponse.json(
      { error: 'Failed to end conversation' },
      { status: 500 }
    );
  }
}
