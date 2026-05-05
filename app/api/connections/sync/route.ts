import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getInstagramInsights,
  getInstagramMedia,
  getInstagramMediaInsights,
  getFacebookPageInsights,
  getFacebookPagePosts,
} from "@/lib/oauth/facebook";
import { getTikTokUserInfo, getTikTokVideos } from "@/lib/oauth/tiktok";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { connectionId } = await request.json();

    if (!connectionId) {
      return NextResponse.json(
        { error: "Connection ID is required" },
        { status: 400 }
      );
    }

    // Get the connection
    const { data: connection, error: connError } = await supabase
      .from("connected_accounts")
      .select("*")
      .eq("id", connectionId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (connError || !connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    const adminSupabase = createAdminClient();
    const today = new Date().toISOString().split("T")[0];

    // Create sync log
    const { data: syncLog } = await adminSupabase
      .from("sync_logs")
      .insert({
        connected_account_id: connectionId,
        user_id: user.id,
        platform: connection.platform,
        sync_type: "full",
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    try {
      let recordsSynced = 0;

      if (connection.platform === "instagram") {
        // Instagram Business insights require instagram_basic + pages_show_list permissions
        // which need Meta App Review. The stored platform_user_id is a Facebook user ID,
        // not an Instagram Business Account ID. We need to find the IG account via pages.
        try {
          const { getFacebookPages, getInstagramBusinessAccount } = await import("@/lib/oauth/facebook");
          const pages = await getFacebookPages(connection.access_token);

          // Find the Instagram Business Account linked to one of the user's pages
          let igAccount = null;
          let linkedPage = null;
          for (const page of pages) {
            const ig = await getInstagramBusinessAccount(page.id, page.access_token);
            if (ig) {
              igAccount = ig;
              linkedPage = page;
              break;
            }
          }

          if (igAccount) {
            // Sync Instagram insights using the real IG Business Account ID
            try {
              const insights = await getInstagramInsights(
                igAccount.id,
                linkedPage!.access_token
              );

              let totalImpressions = 0;
              let totalReach = 0;
              let followersCount = igAccount.followers_count || 0;

              for (const metric of insights) {
                if (metric.name === "impressions") {
                  totalImpressions = metric.values?.[0]?.value || 0;
                } else if (metric.name === "reach") {
                  totalReach = metric.values?.[0]?.value || 0;
                } else if (metric.name === "follower_count") {
                  followersCount = metric.values?.[0]?.value || followersCount;
                }
              }

              await adminSupabase.from("platform_metrics").upsert(
                {
                  connected_account_id: connectionId,
                  user_id: user.id,
                  platform: "instagram",
                  metric_date: today,
                  followers_count: followersCount,
                  total_impressions: totalImpressions,
                  total_reach: totalReach,
                  platform_data: { insights, ig_username: igAccount.username },
                },
                { onConflict: "connected_account_id,metric_date" }
              );
              recordsSynced++;

              // Sync Instagram media
              const media = await getInstagramMedia(igAccount.id, linkedPage!.access_token, 50);

              for (const post of media) {
                const postInsights = await getInstagramMediaInsights(
                  post.id,
                  linkedPage!.access_token,
                  post.media_type
                );

                await adminSupabase.from("platform_posts").upsert(
                  {
                    connected_account_id: connectionId,
                    user_id: user.id,
                    platform: "instagram",
                    platform_post_id: post.id,
                    post_type: post.media_type?.toLowerCase(),
                    caption: post.caption,
                    media_url: post.media_url,
                    thumbnail_url: post.thumbnail_url,
                    permalink: post.permalink,
                    likes_count: post.like_count || 0,
                    comments_count: post.comments_count || 0,
                    impressions_count: postInsights.impressions || 0,
                    reach_count: postInsights.reach || 0,
                    saves_count: postInsights.saved || 0,
                    posted_at: post.timestamp,
                    platform_data: { ...post, insights: postInsights },
                  },
                  { onConflict: "connected_account_id,platform_post_id" }
                );
                recordsSynced++;
              }
            } catch (igInsightsError) {
              console.error("Error syncing Instagram insights:", igInsightsError);
              // Store basic account info even if insights fail
              await adminSupabase.from("platform_metrics").upsert(
                {
                  connected_account_id: connectionId,
                  user_id: user.id,
                  platform: "instagram",
                  metric_date: today,
                  followers_count: igAccount.followers_count || 0,
                  platform_data: {
                    ig_username: igAccount.username,
                    media_count: igAccount.media_count,
                    error: "Insights require additional permissions",
                  },
                },
                { onConflict: "connected_account_id,metric_date" }
              );
              recordsSynced++;
            }
          } else {
            // No Instagram Business Account found
            await adminSupabase.from("platform_metrics").upsert(
              {
                connected_account_id: connectionId,
                user_id: user.id,
                platform: "instagram",
                metric_date: today,
                platform_data: {
                  message: "No Instagram Business Account found linked to your Facebook Pages.",
                  note: "You need an Instagram Business or Creator account connected to a Facebook Page.",
                },
              },
              { onConflict: "connected_account_id,metric_date" }
            );
            recordsSynced++;
          }
        } catch (igError) {
          console.error("Error accessing Instagram data:", igError);
          await adminSupabase.from("platform_metrics").upsert(
            {
              connected_account_id: connectionId,
              user_id: user.id,
              platform: "instagram",
              metric_date: today,
              platform_data: {
                error: "Instagram sync requires pages_show_list and instagram_basic permissions from Meta App Review",
                details: igError instanceof Error ? igError.message : "Unknown error",
              },
            },
            { onConflict: "connected_account_id,metric_date" }
          );
          recordsSynced++;
        }
      } else if (connection.platform === "facebook") {
        // Note: Facebook Page insights require pages_show_list permission from Meta App Review
        // For now, we'll fetch basic user info and check if they have pages
        
        try {
          // Try to get Facebook Pages (requires pages_show_list permission)
          const { getFacebookPages } = await import("@/lib/oauth/facebook");
          const pages = await getFacebookPages(connection.access_token);

          if (pages && pages.length > 0) {
            // User has pages - try to sync the first page
            const page = pages[0];
            
            try {
              const insights = await getFacebookPageInsights(
                page.id,
                page.access_token
              );

              let pageImpressions = 0;
              let pageEngaged = 0;
              let pageFans = 0;
              let pageViews = 0;

              for (const metric of insights) {
                const value = metric.values?.[0]?.value || 0;
                if (metric.name === "page_impressions") pageImpressions = value;
                else if (metric.name === "page_engaged_users") pageEngaged = value;
                else if (metric.name === "page_fans") pageFans = value;
                else if (metric.name === "page_views_total") pageViews = value;
              }

              await adminSupabase.from("platform_metrics").upsert(
                {
                  connected_account_id: connectionId,
                  user_id: user.id,
                  platform: "facebook",
                  metric_date: today,
                  followers_count: pageFans,
                  total_impressions: pageImpressions,
                  total_reach: pageEngaged,
                  total_views: pageViews,
                  platform_data: { insights, page_name: page.name },
                },
                { onConflict: "connected_account_id,metric_date" }
              );
              recordsSynced++;

              // Sync Facebook posts
              const posts = await getFacebookPagePosts(
                page.id,
                page.access_token,
                50
              );

              for (const post of posts) {
                await adminSupabase.from("platform_posts").upsert(
                  {
                    connected_account_id: connectionId,
                    user_id: user.id,
                    platform: "facebook",
                    platform_post_id: post.id,
                    post_type: post.full_picture ? "image" : "text",
                    caption: post.message,
                    media_url: post.full_picture,
                    permalink: post.permalink_url,
                    likes_count: post.reactions?.summary?.total_count || 0,
                    comments_count: post.comments?.summary?.total_count || 0,
                    shares_count: post.shares?.count || 0,
                    posted_at: post.created_time,
                    platform_data: post,
                  },
                  { onConflict: "connected_account_id,platform_post_id" }
                );
                recordsSynced++;
              }
            } catch (pageError) {
              console.error("Error syncing Facebook Page data:", pageError);
              // Store basic connection info even if insights fail
              await adminSupabase.from("platform_metrics").upsert(
                {
                  connected_account_id: connectionId,
                  user_id: user.id,
                  platform: "facebook",
                  metric_date: today,
                  platform_data: { 
                    error: "Page insights require additional permissions",
                    page_name: page.name 
                  },
                },
                { onConflict: "connected_account_id,metric_date" }
              );
              recordsSynced++;
            }
          } else {
            // No pages found - store basic user connection
            await adminSupabase.from("platform_metrics").upsert(
              {
                connected_account_id: connectionId,
                user_id: user.id,
                platform: "facebook",
                metric_date: today,
                platform_data: { 
                  message: "No Facebook Pages found. Please connect a Facebook Page to sync data.",
                  note: "Facebook personal profiles cannot be synced. You need a Facebook Page."
                },
              },
              { onConflict: "connected_account_id,metric_date" }
            );
            recordsSynced++;
          }
        } catch (fbError) {
          console.error("Error accessing Facebook data:", fbError);
          // Store error info
          await adminSupabase.from("platform_metrics").upsert(
            {
              connected_account_id: connectionId,
              user_id: user.id,
              platform: "facebook",
              metric_date: today,
              platform_data: { 
                error: "Facebook data sync requires additional permissions from Meta App Review",
                details: fbError instanceof Error ? fbError.message : "Unknown error",
                required_permissions: ["pages_show_list", "pages_read_engagement"],
                note: "Currently only basic Facebook Login permissions are available"
              },
            },
            { onConflict: "connected_account_id,metric_date" }
          );
          recordsSynced++;
        }
      } else if (connection.platform === "tiktok") {
        // Sync TikTok metrics
        const userInfo = await getTikTokUserInfo(connection.access_token);

        await adminSupabase.from("platform_metrics").upsert(
          {
            connected_account_id: connectionId,
            user_id: user.id,
            platform: "tiktok",
            metric_date: today,
            followers_count: userInfo.follower_count || 0,
            following_count: userInfo.following_count || 0,
            total_likes: userInfo.likes_count || 0,
            posts_count: userInfo.video_count || 0,
            platform_data: { userInfo },
          },
          { onConflict: "connected_account_id,metric_date" }
        );
        recordsSynced++;

        // Sync TikTok videos
        const videosData = await getTikTokVideos(connection.access_token);

        for (const video of videosData.videos) {
          await adminSupabase.from("platform_posts").upsert(
            {
              connected_account_id: connectionId,
              user_id: user.id,
              platform: "tiktok",
              platform_post_id: video.id,
              post_type: "video",
              caption: video.video_description || video.title,
              thumbnail_url: video.cover_image_url,
              permalink: video.share_url,
              likes_count: video.like_count || 0,
              comments_count: video.comment_count || 0,
              shares_count: video.share_count || 0,
              views_count: video.view_count || 0,
              posted_at: new Date(video.create_time * 1000).toISOString(),
              platform_data: video,
            },
            { onConflict: "connected_account_id,platform_post_id" }
          );
          recordsSynced++;
        }
      }

      // Update sync log as completed
      if (syncLog) {
        await adminSupabase
          .from("sync_logs")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            records_synced: recordsSynced,
          })
          .eq("id", syncLog.id);
      }

      return NextResponse.json({
        success: true,
        recordsSynced,
        platform: connection.platform,
      });
    } catch (syncError) {
      // Update sync log as failed
      if (syncLog) {
        await adminSupabase
          .from("sync_logs")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
            error_message:
              syncError instanceof Error ? syncError.message : "Unknown error",
          })
          .eq("id", syncLog.id);
      }

      throw syncError;
    }
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        error: "Failed to sync data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
