import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { 
      conversationId, 
      helpType, 
      destination, 
      dataSource, 
      name, 
      email 
    } = body;

    if (!helpType || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create support ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        conversation_id: conversationId || null,
        user_id: user?.id || null,
        subject: helpType,
        help_type: helpType,
        destination: destination || null,
        data_source: dataSource || null,
        user_name: name,
        user_email: email,
        priority: 'normal',
        status: 'open',
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Error creating ticket:', ticketError);
      return NextResponse.json(
        { error: 'Failed to create support ticket' },
        { status: 500 }
      );
    }

    // Update conversation status if exists
    if (conversationId) {
      await supabase
        .from('support_conversations')
        .update({ status: 'waiting_for_human' })
        .eq('id', conversationId);

      // Add system message about ticket creation
      await supabase
        .from('support_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'system',
          content: `Support ticket ${ticket.ticket_number} has been created. Our team will contact you shortly at ${email}.`,
          message_type: 'text',
          metadata: { ticket_id: ticket.id, ticket_number: ticket.ticket_number },
        });
    }

    // Send notification email to support team (optional - can be implemented later)
    // await sendSupportNotificationEmail(ticket);

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        status: ticket.status,
      },
    });
  } catch (error) {
    console.error('Ticket API error:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
