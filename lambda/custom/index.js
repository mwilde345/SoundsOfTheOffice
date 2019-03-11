/* eslint-disable  func-names */
/* eslint-disable  no-console */
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const Alexa = require('ask-sdk-core');
// const Speech = require('ssml-builder');
const AWS = require('aws-sdk');
const Constants = require('./common/constants');

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

const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
      resources: Constants.LANGUAGE_STRING,
      returnObjects: true,
    });

    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function (...args) {
      return localizationClient.t(...args);
    };
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
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();
