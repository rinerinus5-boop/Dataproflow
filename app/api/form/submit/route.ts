import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendDashboardGeneratedEmail } from '@/lib/email/email-service';

interface FormSubmission {
  name: string;
  email: string;
  companyName: string;
  industry: string;
  businessSize: string;
  monthlyRevenue: string;
  marketingChannels: string[];
  mainGoals: string[];
  currentChallenges?: string;
}

export async function POST(request: NextRequest) {
  console.log('=== FORM SUBMISSION API CALLED ===');

  try {
    const body: FormSubmission = await request.json();
    console.log('Form submission received:', { 
      name: body.name, 
      email: body.email,
      companyName: body.companyName 
    });

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!body.email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Check if user exists with this email
    const { data: existingUser } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('email', body.email.toLowerCase())
      .single();

    // Create user_inputs record
    const { data: userInput, error: inputError } = await adminSupabase
      .from('user_inputs')
      .insert({
        user_id: existingUser?.id || null,
        email: body.email.toLowerCase(),
        name: body.name.trim(),
        company_name: body.companyName?.trim() || null,
        industry: body.industry || null,
        business_size: body.businessSize || null,
        monthly_revenue: body.monthlyRevenue || null,
        marketing_channels: body.marketingChannels || [],
        main_goals: body.mainGoals || [],
        current_challenges: body.currentChallenges?.trim() || null,
        answers: {
          companyName: body.companyName,
          industry: body.industry,
          businessSize: body.businessSize,
          monthlyRevenue: body.monthlyRevenue,
          marketingChannels: body.marketingChannels,
          mainGoals: body.mainGoals,
          currentChallenges: body.currentChallenges,
        },
        status: 'pending',
      })
      .select()
      .single();

    if (inputError) {
      console.error('Error creating user input:', inputError);
      return NextResponse.json(
        { error: 'Failed to save form data' },
        { status: 500 }
      );
    }

    console.log('User input created:', userInput.id);

    // Create dashboard record (pending)
    const { data: dashboard, error: dashboardError } = await adminSupabase
      .from('dashboards')
      .insert({
        user_id: existingUser?.id || null,
        input_id: userInput.id,
        status: 'pending',
      })
      .select()
      .single();

    if (dashboardError) {
      console.error('Error creating dashboard record:', dashboardError);
      // Continue anyway - we can create dashboard later
    } else {
      console.log('Dashboard record created:', dashboard.id);
    }

    // Generate a temporary dashboard URL (will be replaced with actual Looker URL)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dataproflow.com';
    const dashboardUrl = `${siteUrl}/dashboard/view/${dashboard?.id || userInput.id}`;

    // Send confirmation email with dashboard link
    try {
      await sendDashboardGeneratedEmail(
        body.email,
        body.name,
        {
          dashboardUrl,
          companyName: body.companyName,
          industry: body.industry,
        }
      );
      console.log('Dashboard email sent successfully to:', body.email);

      // Update user input status
      await adminSupabase
        .from('user_inputs')
        .update({ status: 'email_sent' })
        .eq('id', userInput.id);

    } catch (emailError) {
      console.error('Error sending dashboard email:', emailError);
      // Don't fail the request - email can be retried
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      inputId: userInput.id,
      dashboardId: dashboard?.id,
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
