// get playedClips for the currentDevice onLoad
// get clips from quotes table, including character name
const globalClient = require('aws-sdk');
const Constants = require('../common/constants');

let Dynamo;

function getCache(userID) {
  const params = {
    ExpressionAttributeValues: {
      ':u': userID,
    },
    KeyConditionExpression: 'userID = :u',
    ProjectionExpression: 'clipsPlayed',
    TableName: 'quote_cache',
  };
  return new Promise((resolve, reject) => {
    Dynamo.query(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Items);
      }
    });
  });
}

function getClipData() {
  const filterExpression = 'begins_with(s3bucket, :b)';
  const bucketFilter = Constants.BUCKET_NAME_BASE;
  const params = {
    ExpressionAttributeValues: {
      ':b': bucketFilter,
    },
    FilterExpression: filterExpression,
    ProjectionExpression: 'clipID, characterName, s3bucket',
    TableName: 'quote_list',
  };
  return new Promise((resolve, reject) => {
    Dynamo.scan(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        // shuffle clips order
        const result = data.Items;
        result.forEach((item, index) => {
          const rand = Math.floor(Math.random() * data.Items.length);
          const temp = data.Items[rand];
          result[rand] = item;
          result[index] = temp;
        });
        resolve(result);
      }
    });
  });
}

// while playing clips, keep updating the response from getCache
//  in the SA. then push the updated object here
function updateCache(userID, cache) {
  const params = {
    Item: {
      userID,
      clipsPlayed: cache,
    },
    TableName: 'quote_cache',
  };
  console.log('updating cache');
  return new Promise((resolve, reject) => {
    Dynamo.put(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function init(awsClient) {
  const localClient = awsClient || globalClient;
  // const credentials = new localClient.SharedIniFileCredentials({
  //   profile: 'mwildeadmin',
  // });
  // localClient.config.credentials = credentials;
  // localClient.config.update({ region: 'us-east-1' });
  Dynamo = new localClient.DynamoDB.DocumentClient();
  return {
    getCache,
    getClipData,
    updateCache,
  };
}

init();
getClipData(true);

module.exports = {
  init,
};
