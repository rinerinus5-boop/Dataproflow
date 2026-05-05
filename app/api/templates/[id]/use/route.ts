import { createClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch template details
    const { data: template, error: templateError } = await supabase
      .from("templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Check if user has connected the required platforms
    const { data: connectedAccounts, error: accountsError } = await supabase
      .from("connected_accounts")
      .select("id, platform, platform_user_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .in("platform", template.required_platforms || []);

    if (accountsError) {
      console.error("Error fetching connected accounts:", accountsError);
    }

    // Fetch global connector IDs for the required platforms
    const { data: platformConnectors, error: connectorsError } = await supabase
      .from("platform_connectors")
      .select("platform, connector_id")
      .eq("is_active", true)
      .in("platform", template.required_platforms || []);

    if (connectorsError) {
      console.error("Error fetching platform connectors:", connectorsError);
    }

    // Build Looker Studio URL with data source connectors
    let lookerStudioUrl = template.looker_studio_url;
    
    if (lookerStudioUrl && platformConnectors && platformConnectors.length > 0) {
      // Create a mapping of platform to connector_id (these are YOUR global connectors)
      const connectorMap: Record<string, string> = {};
      platformConnectors.forEach(connector => {
        if (connector.connector_id) {
          connectorMap[connector.platform] = connector.connector_id;
        }
      });

      // If we have connector IDs, append them as URL parameters
      // This allows Looker Studio to auto-connect using your Community Connectors
      // Users will then select their specific account within the connector
      const url = new URL(lookerStudioUrl);
      
      // Add connector IDs as query parameters
      // Format: ?connectors={"instagram":"CONNECTOR_ID","facebook":"CONNECTOR_ID"}
      if (Object.keys(connectorMap).length > 0) {
        url.searchParams.set('connectors', JSON.stringify(connectorMap));
        lookerStudioUrl = url.toString();
      }
    }

    // Save user template usage
    const { data: userTemplate, error: insertError } = await supabase
      .from("user_templates")
      .upsert({
        user_id: user.id,
        template_id: templateId,
        last_accessed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,template_id'
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving user template:", insertError);
    }

    return NextResponse.json({ 
      success: true,
      template,
      lookerStudioUrl,
      connectedAccounts: connectedAccounts || [],
      hasRequiredConnections: connectedAccounts && connectedAccounts.length === template.required_platforms?.length
    });
  } catch (error) {
    console.error("Use template API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
