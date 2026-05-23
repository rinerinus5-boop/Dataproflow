const WINDSOR_API_KEY = process.env.WINDSOR_API_KEY!;
const BASE_URL = "https://connectors.windsor.ai";
const ONBOARD_URL = "https://onboard.windsor.ai";

// ─── Supported connectors ────────────────────────────────────────────────────
export const CONNECTORS = {
  ALL: "all",                    // Aggregates all connected sources
  FACEBOOK: "facebook",
  INSTAGRAM: "instagram",
  TIKTOK: "tiktok",
  TIKTOK_ADS: "tiktok_ads",
  GOOGLE_ADS: "google_ads",
  GOOGLE_ANALYTICS: "google_analytics4",
  LINKEDIN: "linkedin",
  TWITTER: "twitter",
  SNAPCHAT: "snapchat",
  PINTEREST: "pinterest",
} as const;

export type ConnectorId = (typeof CONNECTORS)[keyof typeof CONNECTORS];

// ─── Query types ─────────────────────────────────────────────────────────────
export interface WindsorQueryParams {
  connector: ConnectorId | string;
  fields: string[];
  date_preset?: string;        // e.g. "last_30d", "last_7d", "this_month"
  date_from?: string;          // YYYY-MM-DD
  date_to?: string;            // YYYY-MM-DD
  filter_string?: string;      // e.g. "campaign=Summer Sale"
  account_id?: string;         // specific account/property id
  access_token?: string;       // co-user access token
  _renderer?: "json" | "csv";
  refresh_since?: string;      // e.g. "3d"
  refresh_interval?: string;   // e.g. "1h", "6h"
  [key: string]: string | string[] | undefined;
}

export interface WindsorResponse<T = Record<string, unknown>> {
  data: T[];
  meta?: {
    total_count?: number;
    returned_count?: number;
  };
}

// ─── Core fetch function ──────────────────────────────────────────────────────
export async function queryWindsor<T = Record<string, unknown>>(
  params: WindsorQueryParams
): Promise<WindsorResponse<T>> {
  const { connector, fields, ...rest } = params;

  const searchParams = new URLSearchParams();
  searchParams.set("api_key", WINDSOR_API_KEY);
  searchParams.set("fields", fields.join(","));
  searchParams.set("_renderer", "json");

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const url = `${BASE_URL}/${connector}?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    next: { revalidate: 300 }, // 5-minute cache
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(
      errBody?.error?.message ||
        `Windsor.ai API error: ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();

  // Windsor returns either { data: [...] } or a plain array
  if (Array.isArray(json)) {
    return { data: json as T[] };
  }
  return json as WindsorResponse<T>;
}

// ─── Generate co-user authorization link ─────────────────────────────────────
// Note: Windsor.ai doesn't support custom redirect URLs after authorization
export async function generateAuthLink(
  allowedSource?: string
): Promise<{ url: string }> {
  const params = new URLSearchParams({ api_key: WINDSOR_API_KEY });
  if (allowedSource) params.set("allowed_sources", allowedSource);

  const url = `${ONBOARD_URL}/api/team/generate-co-user-url/?${params.toString()}`;
  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || `Failed to generate Windsor auth link: ${response.status}`);
  }

  return response.json();
}

// ─── List co-user linked accounts ────────────────────────────────────────────
export async function listLinkedAccounts(
  dsId?: string,
  accessToken?: string
): Promise<LinkedAccount[]> {
  const params = new URLSearchParams({ api_key: WINDSOR_API_KEY });
  if (dsId) params.set("ds_id", dsId);
  if (accessToken) params.set("access_token", accessToken);

  const url = `${ONBOARD_URL}/api/team/co-user-linked-accounts/?${params.toString()}`;
  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || `Failed to list linked accounts: ${response.status}`);
  }

  const json = await response.json();
  return Array.isArray(json) ? json : json?.results ?? [];
}

export interface LinkedAccount {
  id: string;
  ds_id: string;
  name?: string;
  account_id?: string;
  account_name?: string;
  access_token?: string;
  co_user_member_name?: string;
  created_at?: string;
  // Windsor may return additional fields
  [key: string]: unknown;
}

// ─── Get available fields for a connector ────────────────────────────────────
export async function getConnectorFields(connector: string): Promise<ConnectorField[]> {
  const url = `${BASE_URL}/${connector}/fields?api_key=${WINDSOR_API_KEY}`;
  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) throw new Error(`Failed to get fields for ${connector}`);

  const json = await response.json();
  return Array.isArray(json) ? json : json?.fields ?? [];
}

export interface ConnectorField {
  id: string;
  name: string;
  type: "TEXT" | "NUMERIC" | "DATE" | "TIMESTAMP" | "BOOLEAN" | "OBJECT";
  description?: string;
}
