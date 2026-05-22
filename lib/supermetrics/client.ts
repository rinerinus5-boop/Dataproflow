const SUPERMETRICS_API_KEY = process.env.SUPERMETRICS_API_KEY!;
const BASE_URL = "https://api.supermetrics.com/enterprise/v2/query/data/json";

export type DateRangeType =
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "last_12_months"
  | "this_month"
  | "last_month"
  | "custom";

export interface SupermetricsQuery {
  ds_id: string;
  ds_accounts: string | string[];
  fields: string | string[];
  start_date?: string;
  end_date?: string;
  date_range_type?: DateRangeType;
  filter?: string;
  order_rows?: string;
  max_rows?: number;
  settings?: Record<string, unknown>;
}

export interface SupermetricsResponse {
  data: string[][];
  meta: {
    query: {
      fields: Array<{ field_name: string; field_id: string }>;
      ds_id: string;
    };
  };
}

export interface SupermetricsError {
  error: {
    code: number;
    message: string;
    details?: string;
  };
}

export async function querySupermetrics(
  query: SupermetricsQuery
): Promise<SupermetricsResponse> {
  const payload = {
    ...query,
    settings: {
      no_headers: false,
      ...(query.settings || {}),
    },
  };

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPERMETRICS_API_KEY}`,
    },
    body: JSON.stringify(payload),
    next: { revalidate: 300 }, // cache for 5 minutes
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(
      errBody?.error?.message ||
        `Supermetrics API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export function parseRows(
  result: SupermetricsResponse
): Record<string, string>[] {
  const headers = result.meta?.query?.fields?.map((f) => f.field_id) ?? [];
  const rows = result.data ?? [];

  if (headers.length === 0 || rows.length === 0) return [];

  // First row may be headers if no_headers was false
  const dataRows =
    rows[0]?.[0] === headers[0] ? rows.slice(1) : rows;

  return dataRows.map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((key, i) => {
      obj[key] = row[i] ?? "";
    });
    return obj;
  });
}

// Data source IDs used in Supermetrics
export const DS_IDS = {
  FACEBOOK_ADS: "FA",
  FACEBOOK_INSIGHTS: "FBI",         // Facebook Page Insights
  INSTAGRAM_INSIGHTS: "INSTA",      // Instagram Insights
  TIKTOK_ADS: "TTADS",
  TIKTOK_ORGANIC: "TIKTOK",
  GOOGLE_ADS: "GAWA",
  GOOGLE_ANALYTICS: "GA4",
} as const;
