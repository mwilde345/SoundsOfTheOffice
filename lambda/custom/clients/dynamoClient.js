// get playedClips for the currentDevice onLoad
// get clips from quotes table, including character name
let AWS; let Dynamo;

function getCache(callback) {
  const params = {
    ProjectionExpression: 'movieTitle',
    TableName: 'triviaClips',
  };
  Dynamo.scan(params, (err, data) => {
    if (err) {
      console.log('Error', err);
    } else {
      console.log(data.Items);
      const uniqueVideos = Array.from(new Set(data.Items.map(val => val.movieTitle.toLowerCase())));
      console.log(uniqueVideos);
      callback(uniqueVideos);
    }
  });
}

function getClipData() {
  const videoID = req.data;
  const params = {
    ExpressionAttributeValues: {
      ':v': videoID,
    },
    KeyConditionExpression: 'videoID = :v',
    ProjectionExpression: 'videoID, clipIDs',
    TableName: 'videosTable',
  };
  Dynamo.query(params, (err, data) => {
    if (err) {
      console.log('Error', err);
    } else {
      console.log(data.Items);
      req.io.emit('checked_video_id', data.Items);
    }
  });
}

// while playing clips, keep updating the response from getCache in the SA. then push the updated object here
function updateCache() {
  const params = {
    Item: {
      clipID: clipData.clipID,
      s3bucket: clipData.s3bucket,
      movieTitle: clipData.movieTitle,
      creator: clipData.creator,
      tags: clipData.tags,
      firstFive: clipData.firstFive,
      hints: clipData.hints,
      essentialWords: clipData.essentialWords,
    },
    TableName: 'triviaClips',
  };
  Dynamo.put(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
    } else {
      console.log(data);
      req.io.emit('posted_trivia', clipData.clipID);
    }
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
