// fetch list of clipIds from bucket
let AWS;
let S3;

function getClips(bucketName, callback) {
  const params = {
    Bucket: bucketName,
    Delimiter: '/',
    EncodingType: 'url',
  };
  S3.listObjects(params, (err, response) => {
    if (err) {
      console.log('Error fetching data: ', err);
    } else {
      console.log('successfully fetched data');
    }
    callback(response.Contents);
  });
}

function init(awsClient) {
  AWS = awsClient;
  S3 = new AWS.S3();
  return {
    getClips,
  };
}

module.exports = {
  init,
};
