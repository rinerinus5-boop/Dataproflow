# Looker Studio Data Connection Guide

## How It Works

When a user clicks "Use this template", the system now automatically connects their actual data sources to the Looker Studio template.

## Implementation Flow

### 1. User Clicks "Use Template"
- Frontend calls `/api/templates/[id]/use` endpoint
- System checks if user has all required platform connections

### 2. Backend Fetches Connected Data Sources
The API endpoint:
1. Retrieves the template's required platforms (e.g., Instagram, Facebook, TikTok)
2. Fetches user's connected accounts from `connected_accounts` table
3. Gets the `connector_id` for each connected platform

### 3. Building the Looker Studio URL with Data Sources

The system builds a Looker Studio URL with connector parameters:

```javascript
// Original template URL
https://lookerstudio.google.com/reporting/create?c.reportId=TEMPLATE_ID

// Enhanced URL with user's data connectors
https://lookerstudio.google.com/reporting/create?c.reportId=TEMPLATE_ID&connectors={"instagram":"CONNECTOR_ID_1","facebook":"CONNECTOR_ID_2"}
```

### 4. Looker Studio Opens with User's Data

When the URL opens in Looker Studio:
- Looker Studio recognizes the connector IDs
- Automatically connects to the user's data sources
- Displays actual data from the user's connected accounts
- User sees their real Instagram/Facebook/TikTok metrics immediately

## Database Schema Requirements

### `connected_accounts` Table

Make sure your `connected_accounts` table has these fields:

```sql
CREATE TABLE connected_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  platform VARCHAR(50) NOT NULL,  -- 'instagram', 'facebook', 'tiktok'
  platform_user_id VARCHAR(255),
  connector_id VARCHAR(255),       -- Google Apps Script Connector ID
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Adding Connector IDs

When you create a Google Apps Script Community Connector for each platform:

1. **Create the connector** in Google Apps Script
2. **Deploy the connector** and get the Connector ID
3. **Store the Connector ID** in the database:

```sql
UPDATE connected_accounts 
SET connector_id = 'YOUR_CONNECTOR_ID_HERE'
WHERE user_id = 'USER_ID' AND platform = 'instagram';
```

## Example: Porter Metrics Style Flow

### Step 1: User Connects Instagram
```sql
INSERT INTO connected_accounts (user_id, platform, platform_user_id, connector_id)
VALUES (
  'user-123',
  'instagram',
  'instagram_user_456',
  'AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX'  -- Your Instagram connector ID
);
```

### Step 2: User Clicks "Use Instagram Template"
API response:
```json
{
  "success": true,
  "lookerStudioUrl": "https://lookerstudio.google.com/reporting/create?c.reportId=abc123&connectors={\"instagram\":\"AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX\"}",
  "connectedAccounts": [
    {
      "platform": "instagram",
      "connector_id": "AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX"
    }
  ],
  "hasRequiredConnections": true
}
```

### Step 3: Looker Studio Opens
- Template loads with Instagram connector pre-configured
- User's actual Instagram data appears immediately
- No manual data source selection needed

## Getting Connector IDs

### For Google Apps Script Community Connectors:

1. Open your Apps Script project
2. Go to **Deploy** → **Manage deployments**
3. Copy the **Deployment ID** (this is your connector_id)
4. Format: `AKfycby...` (long alphanumeric string)

### Store in Database:

```sql
-- Instagram Connector
UPDATE connected_accounts 
SET connector_id = 'AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX'
WHERE platform = 'instagram';

-- Facebook Connector
UPDATE connected_accounts 
SET connector_id = 'AKfycbzYYYYYYYYYYYYYYYYYYYYYYYYY'
WHERE platform = 'facebook';

-- TikTok Connector
UPDATE connected_accounts 
SET connector_id = 'AKfycbzZZZZZZZZZZZZZZZZZZZZZZZZZ'
WHERE platform = 'tiktok';
```

## Alternative: Manual Data Source Selection

If you don't have connector IDs stored, users will need to:
1. Open the Looker Studio template
2. Click "Add data" or "Connect data source"
3. Select your Community Connector
4. Authorize and select their account
5. Apply the data source to the template

With connector IDs, this process is **automatic**! 🎉

## Troubleshooting

### Template Opens But Shows No Data
- **Check**: Does the `connector_id` exist in the database?
- **Check**: Is the connector deployed and accessible?
- **Check**: Has the user authorized the connector?

### "Data source not found" Error
- **Fix**: Verify the connector_id is correct
- **Fix**: Ensure the connector is deployed as "Anyone with the link"
- **Fix**: Check that the connector is not disabled

### User Sees "Connect Data Source" Dialog
- **Cause**: Connector ID not found or invalid
- **Solution**: Store the correct connector_id in the database
- **Workaround**: User can manually select the data source

## Benefits

✅ **Instant Data Access** - No manual data source selection  
✅ **Better UX** - One-click template activation  
✅ **Automatic Updates** - Data refreshes automatically  
✅ **Porter Metrics Style** - Professional, seamless experience  

## Next Steps

1. ✅ Create Google Apps Script Community Connectors for each platform
2. ✅ Deploy connectors and get Deployment IDs
3. ✅ Store connector IDs in `connected_accounts` table
4. ✅ Test template opening with real user data
5. ✅ Verify data appears automatically in Looker Studio
