const AWS = require('aws-sdk');
const Constants = require('../common/constants');
const DynamoClient = require('../clients/dynamoClient').init(AWS);

function getCacheAndClips(userID) {
  const cacheAndClips = {
    clips: {},
    cache: {},
  };
  return new Promise((resolve, reject) => {
    try {
      DynamoClient.getClipData()
        .then((clipData) => {
          // clipData lists all the clips for that bucket
          cacheAndClips.clips = clipData;
          return DynamoClient.getCache(userID)
            .then((cache) => {
              const cacheForUser = cache.length ? cache[0].clipsPlayed
                : { [Constants.BUCKET_NAME_FREE]: [], [Constants.BUCKET_NAME_PAID]: [] };
              cacheAndClips.cache = cacheForUser;
              resolve(cacheAndClips);
            });
        });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  getCacheAndClips,
};
