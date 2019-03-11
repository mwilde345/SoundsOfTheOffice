// get playedClips for the currentDevice onLoad
// get clips from quotes table, including character name
let AWS; let Dynamo;

function getCache(deviceID) {
  const params = {
    ExpressionAttributeValues: {
      ':d': deviceID,
    },
    KeyConditionExpression: 'deviceID = :d',
    ProjectionExpression: 'deviceID, clipsPlayed',
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

function getClipData(bucketName) {
  const params = {
    ExpressionAttributeValues: {
      ':b': bucketName,
    },
    KeyConditionExpression: 's3bucket = :b',
    ProjectionExpression: 'clipID, character',
    TableName: 'quote_clips',
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

// while playing clips, keep updating the response from getCache
//  in the SA. then push the updated object here
function updateCache(input) {
  const params = {
    Item: {
      deviceID: input.deviceID,
      clipsPlayed: input.clipsPlayed,
    },
    TableName: 'quote_cache',
  };
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
  AWS = awsClient;
  Dynamo = new AWS.DynamoDB.DocumentClient();
  return {
    getCache,
    getClipData,
    updateCache,
  };
}

module.exports = {
  init,
};
