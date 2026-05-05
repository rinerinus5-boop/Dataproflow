// Facebook/Instagram OAuth Service
// Instagram uses Facebook's Graph API for business accounts

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL}/api/oauth/facebook/callback`;

// Updated for New Meta UI (2024+)
// The new Meta platform only provides basic permissions by default
// Advanced permissions like pages_show_list, instagram_basic require App Review
// For now, we'll use only the basic permissions available in the Facebook Login use case
const BASIC_SCOPES = [
  'email',                     // User's email - available by default
  'public_profile',            // User's public profile - available by default
].join(',');

// Note: Instagram and Facebook Page access now requires:
// 1. Business verification
// 2. App Review approval
// 3. Additional use cases beyond basic Facebook Login
// For development/testing, we'll work with basic user info only

export function getFacebookAuthUrl(state: string, platform: 'facebook' | 'instagram' = 'facebook'): string {
  // Use basic scopes for both Facebook and Instagram
  // In the new Meta UI, both platforms use the same Facebook Login flow
  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: BASIC_SCOPES,
    response_type: 'code',
    state: JSON.stringify({ state, platform }),
  });

  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
}

export async function exchangeFacebookCode(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    client_secret: FACEBOOK_APP_SECRET,
    redirect_uri: REDIRECT_URI,
    code,
  });

  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to exchange code');
  }

  return response.json();
}

export async function getLongLivedToken(shortLivedToken: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: FACEBOOK_APP_ID,
    client_secret: FACEBOOK_APP_SECRET,
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get long-lived token');
  }

  return response.json();
}

// Get basic user info with the new Meta UI basic permissions
export async function getFacebookUserInfo(accessToken: string): Promise<{
  id: string;
  name: string;
  email?: string;
  picture?: { data: { url: string } };
}> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get user info');
  }

  return response.json();
}

export async function getFacebookPages(accessToken: string): Promise<Array<{
  id: string;
  name: string;
  access_token: string;
  category: string;
  picture?: { data: { url: string } };
}>> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,category,picture&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get pages');
  }

  const data = await response.json();
  return data.data || [];
}

export async function getInstagramBusinessAccount(pageId: string, pageAccessToken: string): Promise<{
  id: string;
  username: string;
  name: string;
  profile_picture_url: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
} | null> {
  // First get the Instagram Business Account ID connected to the page
  const pageResponse = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
  );

  if (!pageResponse.ok) {
    return null;
  }

  const pageData = await pageResponse.json();
  const igAccountId = pageData.instagram_business_account?.id;

  if (!igAccountId) {
    return null;
  }

  // Get Instagram account details
  const igResponse = await fetch(
    `https://graph.facebook.com/v18.0/${igAccountId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count&access_token=${pageAccessToken}`
  );

  if (!igResponse.ok) {
    return null;
  }

  return igResponse.json();
}

export async function getInstagramInsights(
  igAccountId: string,
  accessToken: string,
  metrics: string[] = ['impressions', 'reach', 'profile_views', 'follower_count'],
  period: 'day' | 'week' | 'days_28' = 'day'
): Promise<Array<{
  name: string;
  period: string;
  values: Array<{ value: number; end_time: string }>;
  title: string;
  description: string;
  id: string;
}>> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${igAccountId}/insights?metric=${metrics.join(',')}&period=${period}&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get insights');
  }

  const data = await response.json();
  return data.data || [];
}

export async function getInstagramMedia(
  igAccountId: string,
  accessToken: string,
  limit: number = 25
): Promise<Array<{
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
}>> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${igAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get media');
  }

  const data = await response.json();
  return data.data || [];
}

export async function getInstagramMediaInsights(
  mediaId: string,
  accessToken: string,
  mediaType: string
): Promise<Record<string, number>> {
  // Different metrics for different media types
  let metrics = ['impressions', 'reach', 'saved'];
  
  if (mediaType === 'VIDEO' || mediaType === 'REELS') {
    metrics = ['impressions', 'reach', 'saved', 'plays', 'video_views'];
  } else if (mediaType === 'CAROUSEL_ALBUM') {
    metrics = ['impressions', 'reach', 'saved', 'carousel_album_impressions', 'carousel_album_reach'];
  }

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${mediaId}/insights?metric=${metrics.join(',')}&access_token=${accessToken}`
  );

  if (!response.ok) {
    return {};
  }

  const data = await response.json();
  const result: Record<string, number> = {};
  
  for (const metric of data.data || []) {
    result[metric.name] = metric.values?.[0]?.value || 0;
  }

  return result;
}

export async function getFacebookPageInsights(
  pageId: string,
  accessToken: string,
  metrics: string[] = ['page_impressions', 'page_engaged_users', 'page_fans', 'page_views_total'],
  period: 'day' | 'week' | 'days_28' = 'day'
): Promise<Array<{
  name: string;
  period: string;
  values: Array<{ value: number; end_time: string }>;
}>> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/insights?metric=${metrics.join(',')}&period=${period}&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get page insights');
  }

  const data = await response.json();
  return data.data || [];
}

export async function getFacebookPagePosts(
  pageId: string,
  accessToken: string,
  limit: number = 25
): Promise<Array<{
  id: string;
  message?: string;
  created_time: string;
  permalink_url: string;
  full_picture?: string;
  shares?: { count: number };
  reactions?: { summary: { total_count: number } };
  comments?: { summary: { total_count: number } };
}>> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,created_time,permalink_url,full_picture,shares,reactions.summary(true),comments.summary(true)&limit=${limit}&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get posts');
  }

  const data = await response.json();
  return data.data || [];
}
