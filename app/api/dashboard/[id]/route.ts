import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Dashboard ID is required' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // First try to find by dashboard ID
    const { data: dashboard, error } = await adminSupabase
      .from('dashboards')
      .select(`
        id,
        status,
        looker_url,
        embed_url,
        created_at,
        input:user_inputs (
          id,
          name,
          email,
          company_name,
          industry,
          business_size,
          monthly_revenue,
          marketing_channels,
          main_goals
        )
      `)
      .eq('id', id)
      .single();

    // If not found, try to find by input_id (for cases where we use input ID as fallback)
    if (error || !dashboard) {
      const { data: inputData } = await adminSupabase
        .from('user_inputs')
        .select(`
          id,
          name,
          email,
          company_name,
          industry,
          business_size,
          monthly_revenue,
          marketing_channels,
          main_goals,
          status
        `)
        .eq('id', id)
        .single();

      if (inputData) {
        // Return a pseudo-dashboard with input data
        return NextResponse.json({
          dashboard: {
            id: inputData.id,
            status: 'pending',
            looker_url: null,
            embed_url: null,
            input: {
              name: inputData.name,
              company_name: inputData.company_name,
              industry: inputData.industry,
              marketing_channels: inputData.marketing_channels,
              main_goals: inputData.main_goals,
            },
          },
        });
      }

      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ dashboard });

  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
