/* eslint-disable  func-names */
/* eslint-disable  no-console */
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const AmazonSpeech = require('ssml-builder/amazon_speech');
const async = require('async');
const Constants = require('./common/constants');
const WelcomeHelpers = require('./helpers/welcomeHelpers');

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

const InitializationInterceptor = {
  async process(handlerInput) {
    console.log('INCOMING REQUEST');
    console.log(JSON.stringify(handlerInput));
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const { request } = handlerInput.requestEnvelope;
    if (request.type === 'IntentRequest'
    && !Constants.DEFAULT_INTENTS.includes(request.intent.name)) {
      Object.assign(sessionAttributes, { intentOfRequest: request.intent.name });
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    }

    handlerInput.attributesManager
      .setRequestAttributes(Object.assign(requestAttributes, { speech: new AmazonSpeech() }));

    if (!sessionAttributes.cache || !sessionAttributes.clips) {
      const isPaid = true;
      const userID = handlerInput.requestEnvelope.context.System.user.userId;
      await WelcomeHelpers.getCacheAndClips(userID, isPaid)
        .then((clipsAndCache) => {
          Object.assign(sessionAttributes, clipsAndCache);
          handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        });
    }
  },
};

const ResponseInterceptor = {
  process(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();
// register the unhandledIntent last.
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
    SingleQuoteIntent,
    MultiQuoteIntent,
    PurchaseIntent,
    MenuIntent,
    WelcomeIntent,
    ExitIntent,
    GameIntent,
    UnhandledIntent,
  )
  .addRequestInterceptors(LocalizationInterceptor, InitializationInterceptor)
  .addResponseInterceptors(ResponseInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();
