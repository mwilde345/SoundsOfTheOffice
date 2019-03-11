const AWS = require('aws-sdk');
const Constants = require('../common/constants');

const credentials = new AWS.SharedIniFileCredentials({
  profile: 'mwildeadmin',
});
AWS.config.credentials = credentials;
AWS.config.region = 'us-east-2';
const DynamoClient = require('../clients/dynamoClient').init(AWS);

function getCacheAndClips(deviceID) {
  const cacheAndClips = {
    clips: {},
    cache: {},
  };
  return DynamoClient.getClipData(Constants.BUCKET_NAME_FREE)
    .then((clipData) => {
      // clipData lists all the clips for that bucket
      cacheAndClips.clips = clipData;
      const clipIDs = clipData.map(item => item.clipID);
      return DynamoClient.getCache(deviceID)
        .then((cache) => {
          const cacheForDevice = cache.length ? cache[0].clipsPlayed : [];
          const cacheFiltered = cacheForDevice.filter(item => (clipIDs.includes(item)));
          cacheAndClips.cache = cacheFiltered;
          return cacheAndClips;
        });
    });
}

module.exports = {
  getCacheAndClips,
};
