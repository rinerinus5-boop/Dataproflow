import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { conversationId, rating, feedback } = body;

    if (!conversationId || !rating) {
      return NextResponse.json(
        { error: 'Conversation ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create rating
    const { error } = await supabase
      .from('support_ratings')
      .insert({
        conversation_id: conversationId,
        user_id: user?.id || null,
        rating,
        feedback: feedback || null,
      });

    if (error) {
      console.error('Error creating rating:', error);
      return NextResponse.json(
        { error: 'Failed to save rating' },
        { status: 500 }
      );
    }

    // Update conversation status to resolved
    await supabase
      .from('support_conversations')
      .update({ status: 'resolved' })
      .eq('id', conversationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rating API error:', error);
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}
