# Complete Google Apps Script Connectors Setup Guide

## Multi-Platform Templates - How It Works

Your system **already supports multi-platform templates**! 

### Example: Social Media Overview Template

```sql
-- Template that requires ALL 3 platforms
INSERT INTO templates (name, slug, required_platforms) VALUES
('Social Media Overview', 'social-media-overview', ARRAY['instagram', 'facebook', 'tiktok']);
```

When user clicks "Use this template":
```javascript
// System builds URL with ALL 3 connector IDs
{
  "instagram": "AKfycbzXXX...",
  "facebook": "AKfycbzYYY...",
  "tiktok": "AKfycbzZZZ..."
}
```

Looker Studio opens with all 3 connectors → User selects their accounts → Template shows combined data! ✅

---

## Step-by-Step Setup Guide

### Step 1: Create Instagram Connector

1. **Go to Google Apps Script**
   - Visit: https://script.google.com
   - Click **New Project**
   - Name it: "Instagram Insights Connector"

2. **Copy the Code**
   - Delete the default `Code.gs` content
   - Copy from: `apps-script-connectors/instagram-connector/Code.gs`
   - Paste into your `Code.gs` file

3. **Add Configuration File**
   - Click **+** next to Files
   - Select **Add a file** → **appsscript.json**
   - Copy from: `apps-script-connectors/instagram-connector/appsscript.json`
   - **Important:** Replace `https://your-domain.com` with your actual domain

4. **Update API Endpoint**
   - In `Code.gs`, find line ~48:
   ```javascript
   var apiUrl = 'https://your-domain.com/api/instagram/insights';
   ```
   - Replace with your actual API endpoint

5. **Deploy the Connector**
   - Click **Deploy** → **New deployment**
   - Click gear icon ⚙️ → Select **Add-on**
   - Description: "Instagram Insights Connector v1"
   - Access: **Anyone** (or **Anyone with the link**)
   - Click **Deploy**
   - **COPY THE DEPLOYMENT ID** → Example: `AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX`

6. **Save to Database**
   ```sql
   UPDATE platform_connectors 
   SET connector_id = 'AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX'
   WHERE platform = 'instagram';
   ```

---

### Step 2: Create Facebook Connector

1. **Create New Project**
   - Go to: https://script.google.com
   - Click **New Project**
   - Name it: "Facebook Pages Connector"

2. **Copy the Code**
   - Delete default `Code.gs` content
   - Copy from: `apps-script-connectors/facebook-connector/Code.gs`
   - Paste into your `Code.gs` file

3. **Add Configuration**
   - Add `appsscript.json` file
   - Copy from: `apps-script-connectors/facebook-connector/appsscript.json`
   - Replace `https://your-domain.com` with your domain

4. **Update API Endpoint**
   - Find line ~48:
   ```javascript
   var apiUrl = 'https://your-domain.com/api/facebook/insights';
   ```
   - Replace with your actual endpoint

5. **Deploy**
   - **Deploy** → **New deployment** → **Add-on**
   - Access: **Anyone**
   - **COPY THE DEPLOYMENT ID**

6. **Save to Database**
   ```sql
   UPDATE platform_connectors 
   SET connector_id = 'AKfycbzYYYYYYYYYYYYYYYYYYYYYYYYY'
   WHERE platform = 'facebook';
   ```

---

### Step 3: Create TikTok Connector

1. **Create New Project**
   - https://script.google.com → **New Project**
   - Name: "TikTok Analytics Connector"

2. **Copy the Code**
   - Copy from: `apps-script-connectors/tiktok-connector/Code.gs`
   - Paste into `Code.gs`

3. **Add Configuration**
   - Add `appsscript.json`
   - Copy from: `apps-script-connectors/tiktok-connector/appsscript.json`
   - Replace domain

4. **Update API Endpoint**
   - Line ~48:
   ```javascript
   var apiUrl = 'https://your-domain.com/api/tiktok/analytics';
   ```

5. **Deploy**
   - **Deploy** → **New deployment** → **Add-on**
   - **COPY THE DEPLOYMENT ID**

6. **Save to Database**
   ```sql
   UPDATE platform_connectors 
   SET connector_id = 'AKfycbzZZZZZZZZZZZZZZZZZZZZZZZZZ'
   WHERE platform = 'tiktok';
   ```

---

## Step 4: Create Backend API Endpoints

You need to create 3 API endpoints that the connectors will call:

### 1. Instagram API Endpoint

**File:** `app/api/instagram/insights/route.ts`

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const apiKey = searchParams.get('apiKey'); // Or use Bearer token
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // Verify API key
  // ... authentication logic

  const supabase = await createClient();

  // Fetch Instagram insights from your database
  const { data: insights, error } = await supabase
    .from('instagram_insights')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ insights });
}
```

### 2. Facebook API Endpoint

**File:** `app/api/facebook/insights/route.ts`

```typescript
// Similar structure to Instagram endpoint
// Fetch from facebook_insights table
```

### 3. TikTok API Endpoint

**File:** `app/api/tiktok/analytics/route.ts`

```typescript
// Similar structure
// Fetch from tiktok_analytics table
```

---

## Step 5: Test the Connectors

### Test in Looker Studio

1. Go to: https://lookerstudio.google.com
2. Create a new report
3. Click **Add data**
4. Search for "Instagram Insights Connector" (your connector name)
5. Click **Authorize**
6. Enter your User ID and API Key
7. Select date range
8. Click **Add**
9. Data should appear! ✅

---

## Step 6: Verify Database Setup

```sql
-- Check that all 3 connectors are stored
SELECT * FROM platform_connectors;

-- Should show:
-- platform   | connector_id                      | connector_name
-- -----------|-----------------------------------|---------------------------
-- instagram  | AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX | Instagram Insights Connector
-- facebook   | AKfycbzYYYYYYYYYYYYYYYYYYYYYYYYY | Facebook Pages Connector
-- tiktok     | AKfycbzZZZZZZZZZZZZZZZZZZZZZZZZZ | TikTok Analytics Connector
```

---

## Step 7: Create Multi-Platform Template

```sql
-- Example: Social Media Overview (uses all 3)
INSERT INTO templates (
  name, 
  slug, 
  description, 
  category, 
  required_platforms,
  looker_studio_url
) VALUES (
  'Social Media Overview',
  'social-media-overview',
  'Complete overview of Instagram, Facebook, and TikTok performance',
  'social-media',
  ARRAY['instagram', 'facebook', 'tiktok'],
  'https://lookerstudio.google.com/reporting/create?c.reportId=YOUR_TEMPLATE_ID'
);
```

When user clicks "Use this template":
- System checks: User has Instagram ✓, Facebook ✓, TikTok ✓
- Builds URL with all 3 connector IDs
- Opens Looker Studio
- User sees combined data from all 3 platforms! 🎉

---

## Troubleshooting

### "Connector not found"
- Check deployment is set to "Anyone" or "Anyone with the link"
- Verify connector_id is correct in database

### "API Error"
- Check your API endpoints are working
- Test with Postman: `GET https://your-domain.com/api/instagram/insights?userId=123&startDate=2024-01-01&endDate=2024-01-31`

### "No data returned"
- Verify data exists in your database for the date range
- Check the `transformData` function is mapping fields correctly

---

## Summary Checklist

- ✅ Create 3 Apps Script projects (Instagram, Facebook, TikTok)
- ✅ Copy connector code for each
- ✅ Update API endpoints with your domain
- ✅ Deploy each connector
- ✅ Copy deployment IDs
- ✅ Store in `platform_connectors` table
- ✅ Create backend API endpoints
- ✅ Test connectors in Looker Studio
- ✅ Create templates with required_platforms
- ✅ Users can now use templates with their data!

Your system is now fully scalable for any combination of platforms! 🚀
