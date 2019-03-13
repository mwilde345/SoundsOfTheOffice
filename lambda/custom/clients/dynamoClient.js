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

function getClipData(isPaid) {
  const keyExpression = isPaid ? 'begins_with(s3bucket, :b)'
    : 's3bucket = :b';
  const bucketFilter = isPaid ? Constants.BUCKET_NAME_BASE : Constants.BUCKET_NAME_FREE;
  const params = {
    ExpressionAttributeValues: {
      ':b': bucketFilter,
      ':p': 'default',
    },
    KeyConditionExpression: `PK = :p and ${keyExpression}`,
    ProjectionExpression: 'clipID, characterName, s3bucket',
    TableName: 'quote_list',
  };
  console.log(`dynamo params${JSON.stringify(params)}`);
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
