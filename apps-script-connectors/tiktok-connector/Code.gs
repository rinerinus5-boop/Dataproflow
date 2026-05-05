/**
 * TikTok Analytics Community Connector for Looker Studio
 * This connector fetches TikTok Business Account analytics
 */

var cc = DataStudioApp.createCommunityConnector();

function getAuthType() {
  return cc.newAuthTypeResponse()
    .setAuthType(cc.AuthType.NONE)
    .build();
}

function getConfig(request) {
  var config = cc.getConfig();
  
  config.newInfo()
    .setId('instructions')
    .setText('This connector fetches TikTok Business Account analytics. Make sure you have connected your TikTok account in the DataFlow app.');
  
  config.newTextInput()
    .setId('userId')
    .setName('User ID')
    .setHelpText('Your DataFlow user ID')
    .setPlaceholder('Enter your user ID');
  
  config.newTextInput()
    .setId('apiKey')
    .setName('API Key')
    .setHelpText('Your DataFlow API key')
    .setPlaceholder('Enter your API key');

  config.setDateRangeRequired(true);
  
  return config.build();
}

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
    .setId('video_id')
    .setName('Video ID')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('video_title')
    .setName('Video Title')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('video_description')
    .setName('Video Description')
    .setType(types.TEXT);
  
  // Metrics
  fields.newMetric()
    .setId('views')
    .setName('Views')
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
    .setId('engagement_rate')
    .setName('Engagement Rate')
    .setType(types.PERCENT)
    .setAggregation(aggregations.AVG);
  
  fields.newMetric()
    .setId('avg_watch_time')
    .setName('Avg Watch Time')
    .setType(types.NUMBER)
    .setAggregation(aggregations.AVG);
  
  fields.newMetric()
    .setId('total_watch_time')
    .setName('Total Watch Time')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);
  
  fields.newMetric()
    .setId('followers')
    .setName('Followers')
    .setType(types.NUMBER)
    .setAggregation(aggregations.AVG);
  
  return { schema: fields.build() };
}

function getData(request) {
  var userId = request.configParams.userId;
  var apiKey = request.configParams.apiKey;
  var startDate = request.dateRange.startDate;
  var endDate = request.dateRange.endDate;
  
  var apiUrl = 'https://your-domain.com/api/tiktok/analytics';
  var url = apiUrl + '?userId=' + userId + 
            '&startDate=' + startDate + 
            '&endDate=' + endDate;
  
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
        .setText('Failed to fetch TikTok data. Please check your credentials.')
        .throwException();
    }
    
    var rows = transformData(data.analytics, request.fields);
    
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

function transformData(analytics, requestedFields) {
  var rows = [];
  
  analytics.forEach(function(item) {
    var row = [];
    
    requestedFields.asArray().forEach(function(field) {
      switch(field.getId()) {
        case 'date':
          row.push(item.date.replace(/-/g, ''));
          break;
        case 'video_id':
          row.push(item.video_id || '');
          break;
        case 'video_title':
          row.push(item.video_title || '');
          break;
        case 'video_description':
          row.push(item.video_description || '');
          break;
        case 'views':
          row.push(item.views || 0);
          break;
        case 'likes':
          row.push(item.likes || 0);
          break;
        case 'comments':
          row.push(item.comments || 0);
          break;
        case 'shares':
          row.push(item.shares || 0);
          break;
        case 'engagement_rate':
          row.push(item.engagement_rate || 0);
          break;
        case 'avg_watch_time':
          row.push(item.avg_watch_time || 0);
          break;
        case 'total_watch_time':
          row.push(item.total_watch_time || 0);
          break;
        case 'followers':
          row.push(item.followers || 0);
          break;
        default:
          row.push('');
      }
    });
    
    rows.push({ values: row });
  });
  
  return rows;
}

function isAdminUser() {
  return true;
}
