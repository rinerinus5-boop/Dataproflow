# Correct Looker Studio Data Connection Setup

## Understanding the Architecture

### ❌ WRONG Assumption
"Each user has their own connector ID" - **This is incorrect!**

### ✅ CORRECT Architecture

You have **3 global connectors** (one per platform) that **ALL users share**:

```
Your App
├── Instagram Connector (1 connector ID) → Used by ALL 10,000+ users
├── Facebook Connector (1 connector ID) → Used by ALL 10,000+ users
└── TikTok Connector (1 connector ID) → Used by ALL 10,000+ users
```

## How It Actually Works

### Step 1: You Create ONE Connector Per Platform

In Google Apps Script, you create 3 Community Connectors:

1. **Instagram Insights Connector**
   - Deployment ID: `AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX`
   - Used by: ALL users who connect Instagram

2. **Facebook Pages Connector**
   - Deployment ID: `AKfycbzYYYYYYYYYYYYYYYYYYYYYYYYY`
   - Used by: ALL users who connect Facebook

3. **TikTok Analytics Connector**
   - Deployment ID: `AKfycbzZZZZZZZZZZZZZZZZZZZZZZZZZ`
   - Used by: ALL users who connect TikTok

### Step 2: Store These 3 Connector IDs in Database

Run this SQL **ONCE**:

```sql
-- Create the table
CREATE TABLE platform_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) UNIQUE NOT NULL,
  connector_id VARCHAR(255) NOT NULL,
  connector_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert YOUR 3 connector IDs (replace with actual IDs)
INSERT INTO platform_connectors (platform, connector_id, connector_name) VALUES
('instagram', 'AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX', 'Instagram Insights Connector'),
('facebook', 'AKfycbzYYYYYYYYYYYYYYYYYYYYYYYYY', 'Facebook Pages Connector'),
('tiktok', 'AKfycbzZZZZZZZZZZZZZZZZZZZZZZZZZ', 'TikTok Analytics Connector');
```

**That's it!** You only do this once, not per user.

### Step 3: When User Connects Instagram

When a user connects their Instagram account:

```sql
-- This goes in connected_accounts table (per user)
INSERT INTO connected_accounts (user_id, platform, platform_user_id) VALUES
('user-123', 'instagram', 'instagram_account_456');
```

**Notice:** No `connector_id` here! That's stored globally in `platform_connectors`.

### Step 4: When User Uses a Template

1. User clicks "Use Instagram Template"
2. API checks: Does user have Instagram connected? ✓
3. API fetches: What's the Instagram connector ID? → `AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX`
4. API builds URL: `https://lookerstudio.google.com/...?connectors={"instagram":"AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX"}`
5. Looker Studio opens with YOUR connector
6. User selects THEIR Instagram account from the connector
7. Template shows THEIR data

## The Flow Diagram

```
User 1 (has Instagram) ──┐
User 2 (has Instagram) ──┼──> Uses YOUR Instagram Connector (AKfycbzXXX...)
User 3 (has Instagram) ──┘     │
                                ├──> User 1 sees their Instagram data
                                ├──> User 2 sees their Instagram data
                                └──> User 3 sees their Instagram data

All 3 users use THE SAME connector, but see DIFFERENT data (their own)
```

## Getting Your Connector IDs

### 1. Create Connector in Apps Script

```javascript
// Code.gs - Example Instagram Connector
function getAuthType() {
  return { type: 'NONE' };
}

function getConfig() {
  return {
    configParams: [
      {
        type: 'INFO',
        name: 'instructions',
        text: 'Connect your Instagram Business Account'
      }
    ]
  };
}

function getSchema() {
  return {
    schema: [
      { name: 'followers', label: 'Followers', dataType: 'NUMBER' },
      { name: 'impressions', label: 'Impressions', dataType: 'NUMBER' },
      // ... more fields
    ]
  };
}

function getData(request) {
  // Fetch data from Instagram API
  // Return formatted data
}
```

### 2. Deploy the Connector

1. In Apps Script, click **Deploy** → **New deployment**
2. Type: **Add-on**
3. Deployment type: **Community Connector**
4. Access: **Anyone** (or **Anyone with the link**)
5. Click **Deploy**
6. **Copy the Deployment ID** → This is your `connector_id`

Example: `AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX`

### 3. Store in Database

```sql
UPDATE platform_connectors 
SET connector_id = 'AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX'
WHERE platform = 'instagram';
```

## Verification

Check that it's working:

```sql
-- Should return 3 rows (one per platform)
SELECT * FROM platform_connectors;

-- Result:
-- platform   | connector_id
-- -----------|----------------------------------
-- instagram  | AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX
-- facebook   | AKfycbzYYYYYYYYYYYYYYYYYYYYYYYYY
-- tiktok     | AKfycbzZZZZZZZZZZZZZZZZZZZZZZZZZ
```

## What Happens in Looker Studio

When a user opens the template with the connector URL:

1. **Looker Studio sees the connector ID**
2. **Loads YOUR Community Connector**
3. **Prompts user:** "Select your Instagram account"
4. **User selects their account** (from the accounts they've authorized)
5. **Template populates with their data**

The connector ID tells Looker Studio **WHICH connector to use**.  
The user's account selection tells it **WHICH data to show**.

## Summary

- ✅ **3 connector IDs total** (Instagram, Facebook, TikTok)
- ✅ **Stored in `platform_connectors` table** (global)
- ✅ **NOT stored per user** in `connected_accounts`
- ✅ **All users share the same connectors**
- ✅ **Each user sees their own data**

This is exactly how Porter Metrics and other SaaS platforms work!
