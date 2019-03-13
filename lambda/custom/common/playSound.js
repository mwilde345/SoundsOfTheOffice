const Speech = require('ssml-builder');
const AmazonSpeech = require('ssml-builder/amazon_speech');

let speech = new AmazonSpeech();

function PlaySound(clipID, s3bucket) {
  const fileURL = `https://s3.amazonaws.com/${s3bucket}/${clipID}.mp3`;
  console.log(fileURL);
  speech.audio(fileURL);
  const speechOutput = speech.ssml(true);
  speech = new AmazonSpeech();
  return speechOutput;
}

module.exports = {
  PlaySound,
};
