/* eslint-disable  func-names */
/* eslint-disable  no-console */
const Alexa = require('ask-sdk-core');
// const Speech = require('ssml-builder');
const AWS = require('aws-sdk');

const credentials = new AWS.SharedIniFileCredentials({
  profile: 'mwildeadmin',
});
AWS.config.credentials = credentials;
AWS.config.region = 'us-east-2';
// const AmazonSpeech = require('ssml-builder/amazon_speech');
// var speech = new AmazonSpeech();

const {
  LaunchRequest,
  HelpIntent,
  UnhandledIntent,
  SessionEndedRequest,
  AnswerIntent,
  RepeatIntent,
  YesIntent,
  StopIntent,
  CancelIntent,
  NoIntent,
} = require('./intentHandlers/generalIntents');
const { SingleQuoteIntent } = require('./intentHandlers/singleQuoteIntent');
const { MultiQuoteIntent } = require('./intentHandlers/multiQuoteIntent');
const { PurchaseIntent } = require('./intentHandlers/purchaseIntent');
const { MenuIntent } = require('./intentHandlers/menuIntent');
const { WelcomeIntent } = require('./intentHandlers/welcomeIntent');
const { ExitIntent } = require('./intentHandlers/exitIntent');
const { GameIntent } = require('./intentHandlers/gameIntent');
const DynamoClient = require('./clients/dynamoClient').init(AWS);
const S3Client = require('./clients/s3Client').init(AWS);

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    HelpIntent,
    AnswerIntent,
    RepeatIntent,
    YesIntent,
    StopIntent,
    CancelIntent,
    NoIntent,
    SessionEndedRequest,
    UnhandledIntent,
    SingleQuoteIntent,
    MultiQuoteIntent,
    PurchaseIntent,
    MenuIntent,
    WelcomeIntent,
    ExitIntent,
    GameIntent,
  )
  .addRequestInterceptors(null)
  .addErrorHandlers(ErrorHandler)
  .lambda();
