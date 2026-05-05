/**
 * Instagram Insights Community Connector for Looker Studio
 * This connector fetches Instagram Business Account insights
 */

// Configuration
var cc = DataStudioApp.createCommunityConnector();

/**
 * Returns the authentication method required by the connector
 */
function getAuthType() {
  return cc.newAuthTypeResponse()
    .setAuthType(cc.AuthType.NONE)
    .build();
}

/**
 * Returns the user configurable options for the connector
 */
function getConfig(request) {
  var config = cc.getConfig();
  
  config.newInfo()
    .setId('instructions')
    .setText('This connector fetches Instagram Business Account insights. Make sure you have connected your Instagram account in the DataFlow app.');
  
  config.newTextInput()
    .setId('userId')
    .setName('User ID')
    .setHelpText('Your DataFlow user ID (get this from your profile)')
    .setPlaceholder('Enter your user ID');
  
  config.newTextInput()
    .setId('apiKey')
    .setName('API Key')
    .setHelpText('Your DataFlow API key (generate in settings)')
    .setPlaceholder('Enter your API key');

  config.setDateRangeRequired(true);
  
  return config.build();
}

/**
 * Returns the schema for the given request
 */
function getSchema(request) {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;
  
  // Dimensions
  fields.newDimension()
    .setId('date')
    .setName('Date')
    .setType(types.YEAR_MONTH_DAY);
  
  fields.newDimension()
    .setId('media_type')
    .setName('Media Type')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('media_id')
    .setName('Media ID')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('caption')
    .setName('Caption')
    .setType(types.TEXT);
  
  // Metrics
  fields.newMetric()
    .setId('impressions')
    .setName('Impressions')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);
  
  fields.newMetric()
    .setId('reach')
    .setName('Reach')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);
  
  fields.newMetric()
    .setId('engagement')
    .setName('Engagement')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);
  
  fields.newMetric()
    .setId('likes')
    .setName('Likes')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);
  
  fields.newMetric()
    .setId('comments')
    .setName('Comments')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);
  
  fields.newMetric()
    .setId('shares')
    .setName('Shares')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);
  
  fields.newMetric()
    .setId('saves')
    .setName('Saves')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);
  
  fields.newMetric()
    .setId('followers')
    .setName('Followers')
    .setType(types.NUMBER)
    .setAggregation(aggregations.AVG);
  
  return { schema: fields.build() };
}

/**
 * Fetches data from your DataFlow API
 */
function getData(request) {
  var userId = request.configParams.userId;
  var apiKey = request.configParams.apiKey;
  var startDate = request.dateRange.startDate;
  var endDate = request.dateRange.endDate;
  
  // Build API URL (replace with your actual API endpoint)
  var apiUrl = 'https://your-domain.com/api/instagram/insights';
  var url = apiUrl + '?userId=' + userId + 
            '&startDate=' + startDate + 
            '&endDate=' + endDate;
  
  // Fetch data from your API
  var options = {
    'method': 'GET',
    'headers': {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    'muteHttpExceptions': true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() !== 200) {
      cc.newUserError()
        .setDebugText('API Error: ' + data.error)
        .setText('Failed to fetch Instagram data. Please check your credentials.')
        .throwException();
    }
    
    // Transform data to match schema
    var rows = transformData(data.insights, request.fields);
    
    return {
      schema: request.fields,
      rows: rows
    };
    
  } catch (e) {
    cc.newUserError()
      .setDebugText('Error: ' + e.toString())
      .setText('Failed to connect to DataFlow API. Please try again.')
      .throwException();
  }
}

/**
 * Transform API data to match Looker Studio schema
 */
function transformData(insights, requestedFields) {
  var rows = [];
  
  insights.forEach(function(insight) {
    var row = [];
    
    requestedFields.asArray().forEach(function(field) {
      switch(field.getId()) {
        case 'date':
          row.push(insight.date.replace(/-/g, ''));
          break;
        case 'media_type':
          row.push(insight.media_type || 'POST');
          break;
        case 'media_id':
          row.push(insight.media_id || '');
          break;
        case 'caption':
          row.push(insight.caption || '');
          break;
        case 'impressions':
          row.push(insight.impressions || 0);
          break;
        case 'reach':
          row.push(insight.reach || 0);
          break;
        case 'engagement':
          row.push(insight.engagement || 0);
          break;
        case 'likes':
          row.push(insight.likes || 0);
          break;
        case 'comments':
          row.push(insight.comments || 0);
          break;
        case 'shares':
          row.push(insight.shares || 0);
          break;
        case 'saves':
          row.push(insight.saves || 0);
          break;
        case 'followers':
          row.push(insight.followers || 0);
          break;
        default:
          row.push('');
      }
    });
    
    rows.push({ values: row });
  });
  
  return rows;
}

/**
 * This checks whether the current user is an admin user of the connector
 */
function isAdminUser() {
  return true;
}
