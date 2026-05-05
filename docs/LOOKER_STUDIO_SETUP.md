# Looker Studio Template Integration Guide

## Overview - Porter Metrics Style Implementation

This application uses **Google Apps Script Community Connectors** to connect custom data sources to Looker Studio, similar to how Porter Metrics operates. Each social media platform (Instagram, Facebook, TikTok) has its own custom connector that fetches data from our API.

## Complete Workflow

### Step 1: Create Custom Data Connectors (Apps Script)

Custom connectors have been created in Google Apps Script for:
- **Instagram Connector** - Fetches Instagram metrics from our API
- **Facebook Connector** - Fetches Facebook analytics from our API  
- **TikTok Connector** - Fetches TikTok insights from our API

These connectors act as a bridge between our application's API and Looker Studio.

### Step 2: Create Looker Studio Templates

1. **Go to Looker Studio**: https://lookerstudio.google.com/
2. **Create a new report**
3. **Add Data Source**:
   - Click "Add Data" 
   - Select "Connectors" → Find your custom connector (Instagram/Facebook/TikTok)
   - Authorize and connect the data source
4. **Design the Dashboard**:
   - Add charts, tables, scorecards, and metrics
   - Configure dimensions and measures
   - Apply filters and date ranges
   - Style the template with branding
5. **Make it a Template**:
   - Click the three dots menu (⋮)
   - Select "Make a copy"
   - This creates a shareable template URL
6. **Get the Template URL**:
   - The URL format: `https://lookerstudio.google.com/reporting/[TEMPLATE_ID]`
   - Copy this URL for database update

### Step 3: Update Database with Template URLs

Once you have created and tested the Looker Studio templates, update the database:

```sql
UPDATE templates 
SET looker_studio_url = 'https://lookerstudio.google.com/reporting/YOUR_TEMPLATE_ID'
WHERE slug = 'instagram-performance';
```

## Current Template Slugs

Templates that need Looker Studio URLs:

- `instagram-performance` - Instagram metrics dashboard
- `facebook-analytics` - Facebook analytics dashboard
- `tiktok-insights` - TikTok insights dashboard
- `social-media-overview` - Combined social media overview
- `paid-ads-performance` - Paid advertising performance

## How Users Will Use Templates

When a user clicks "Use Template" in your application:

1. They are redirected to the Looker Studio template URL
2. Looker Studio prompts them to "Make a copy"
3. They select the data connector (Instagram/Facebook/TikTok)
4. The connector authenticates with your API using their credentials
5. The template is populated with their data
6. They can customize and save their own copy

## Example Database Updates

```sql
-- Update Instagram template
UPDATE templates 
SET looker_studio_url = 'https://lookerstudio.google.com/reporting/dfe5dd1e-dea5-4c19-957c-5d019a4fb535' 
WHERE slug = 'instagram-performance';

-- Update Facebook template
UPDATE templates 
SET looker_studio_url = 'https://lookerstudio.google.com/reporting/abc123-xyz789' 
WHERE slug = 'facebook-analytics';

-- Update TikTok template
UPDATE templates 
SET looker_studio_url = 'https://lookerstudio.google.com/reporting/57652146-e49f-476b-a91f-1319b2217310' 
WHERE slug = 'tiktok-insights';
```

## Important Notes

- **Custom Connectors**: Each connector must be deployed and accessible to users
- **API Authentication**: Connectors should handle API authentication securely
- **Data Refresh**: Configure automatic data refresh intervals in Looker Studio
- **Template Sharing**: Ensure templates are set to "Anyone with the link can view"
- **Connector Deployment**: Deploy Apps Script connectors in "Production" mode for stability
