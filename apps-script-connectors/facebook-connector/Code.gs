/**
 * Facebook Pages Community Connector for Looker Studio
 * This connector fetches Facebook Page insights
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
    .setText('This connector fetches Facebook Page insights. Make sure you have connected your Facebook account in the DataFlow app.');
  
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
    .setId('post_id')
    .setName('Post ID')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('post_type')
    .setName('Post Type')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('message')
    .setName('Message')
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
    .setId('reactions')
    .setName('Reactions')
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
    .setId('clicks')
    .setName('Clicks')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);
  
  fields.newMetric()
    .setId('page_likes')
    .setName('Page Likes')
    .setType(types.NUMBER)
    .setAggregation(aggregations.AVG);
  
  fields.newMetric()
    .setId('page_followers')
    .setName('Page Followers')
    .setType(types.NUMBER)
    .setAggregation(aggregations.AVG);
  
  return { schema: fields.build() };
}

function getData(request) {
  var userId = request.configParams.userId;
  var apiKey = request.configParams.apiKey;
  var startDate = request.dateRange.startDate;
  var endDate = request.dateRange.endDate;
  
  var apiUrl = 'https://your-domain.com/api/facebook/insights';
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
        .setText('Failed to fetch Facebook data. Please check your credentials.')
        .throwException();
    }
    
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

function transformData(insights, requestedFields) {
  var rows = [];
  
  insights.forEach(function(insight) {
    var row = [];
    
    requestedFields.asArray().forEach(function(field) {
      switch(field.getId()) {
        case 'date':
          row.push(insight.date.replace(/-/g, ''));
          break;
        case 'post_id':
          row.push(insight.post_id || '');
          break;
        case 'post_type':
          row.push(insight.post_type || 'POST');
          break;
        case 'message':
          row.push(insight.message || '');
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
        case 'reactions':
          row.push(insight.reactions || 0);
          break;
        case 'comments':
          row.push(insight.comments || 0);
          break;
        case 'shares':
          row.push(insight.shares || 0);
          break;
        case 'clicks':
          row.push(insight.clicks || 0);
          break;
        case 'page_likes':
          row.push(insight.page_likes || 0);
          break;
        case 'page_followers':
          row.push(insight.page_followers || 0);
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
