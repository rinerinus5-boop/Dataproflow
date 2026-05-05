// TikTok OAuth Service
// Uses TikTok's Login Kit and Content Posting API with PKCE

import crypto from "crypto";

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL}/api/oauth/tiktok/callback`;

// TikTok scopes for business accounts
const TIKTOK_SCOPES = [
  'user.info.basic',
  'user.info.profile',
  'user.info.stats',
  'video.list',
].join(',');

// Generate PKCE code verifier and challenge
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  // Generate a random code verifier (43-128 characters)
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  
  // Generate code challenge using SHA256
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return { codeVerifier, codeChallenge };
}

export function getTikTokAuthUrl(state: string, codeChallenge: string): string {
  const csrfState = Buffer.from(JSON.stringify({ state, timestamp: Date.now() })).toString('base64');
  
  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    redirect_uri: REDIRECT_URI,
    scope: TIKTOK_SCOPES,
    response_type: 'code',
    state: csrfState,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

export async function exchangeTikTokCode(code: string, codeVerifier: string): Promise<{
  access_token: string;
  refresh_token: string;
  open_id: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  scope: string;
}> {
  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || error.error || 'Failed to exchange code');
  }

  return response.json();
}

export async function refreshTikTokToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  open_id: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  scope: string;
}> {
  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || error.error || 'Failed to refresh token');
  }

  return response.json();
}

export async function getTikTokUserInfo(accessToken: string): Promise<{
  open_id: string;
  union_id: string;
  avatar_url: string;
  avatar_url_100: string;
  avatar_large_url: string;
  display_name: string;
  bio_description: string;
  profile_deep_link: string;
  is_verified: boolean;
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
}> {
  const response = await fetch(
    'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,avatar_url_100,avatar_large_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get user info');
  }

  const data = await response.json();
  return data.data?.user || {};
}

export async function getTikTokVideos(
  accessToken: string,
  cursor?: number,
  maxCount: number = 20
): Promise<{
  videos: Array<{
    id: string;
    create_time: number;
    cover_image_url: string;
    share_url: string;
    video_description: string;
    duration: number;
    title: string;
    like_count: number;
    comment_count: number;
    share_count: number;
    view_count: number;
  }>;
  cursor: number;
  has_more: boolean;
}> {
  const fields = 'id,create_time,cover_image_url,share_url,video_description,duration,title,like_count,comment_count,share_count,view_count';
  
  let url = `https://open.tiktokapis.com/v2/video/list/?fields=${fields}&max_count=${maxCount}`;
  if (cursor) {
    url += `&cursor=${cursor}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get videos');
  }

  const data = await response.json();
  return {
    videos: data.data?.videos || [],
    cursor: data.data?.cursor || 0,
    has_more: data.data?.has_more || false,
  };
}

export async function getTikTokVideoInsights(
  accessToken: string,
  videoIds: string[]
): Promise<Array<{
  id: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
  reach: number;
  full_video_watched_rate: number;
  total_time_watched: number;
  average_time_watched: number;
}>> {
  // TikTok requires video IDs in the request body
  const response = await fetch(
    'https://open.tiktokapis.com/v2/video/query/?fields=id,like_count,comment_count,share_count,view_count',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filters: {
          video_ids: videoIds,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get video insights');
  }

  const data = await response.json();
  return data.data?.videos || [];
}
