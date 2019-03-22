const AWS = require('aws-sdk');
const async = require('async');
const Constants = require('../common/constants');
const DynamoClient = require('../clients/dynamoClient').init(AWS);


function updateCache(userID, cache) {
  DynamoClient.updateCache(userID, cache);
}

module.exports = {
  updateCache,
};
