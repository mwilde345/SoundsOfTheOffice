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
const { PurchaseIntent, BuyResponseHandler } = require('./intentHandlers/purchaseIntent');
const { BonusDetailIntent } = require('./intentHandlers/bonusDetailIntent');
const { PurchaseOptionsIntent } = require('./intentHandlers/purchaseOptionsIntent');
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

const FallbackHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    console.log('IN FallbackHandler');
    return handlerInput.responseBuilder
      .speak('Sorry, I didn\'t understand what you meant. Please try again.')
      .reprompt('Sorry, I didn\'t understand what you meant. Please try again.')
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

    handlerInput.attributesManager
      .setRequestAttributes(Object.assign(requestAttributes, { speech: new AmazonSpeech() }));

    if (!sessionAttributes.cache || !sessionAttributes.clips) {
      const isPaid = true;
      const userID = handlerInput.requestEnvelope.context.System.user.userId;
      await WelcomeHelpers.getCacheAndClips(userID, isPaid)
        .then((clipsAndCache) => {
          Object.assign(sessionAttributes, clipsAndCache);
          const { clips } = clipsAndCache;
          const clipsPerCharacter = {
            [Constants.BUCKET_NAME_FREE]: [],
            [Constants.BUCKET_NAME_PAID]: [],
          };
          const paidClipCount = clips
            .filter(clip => clip.s3bucket === Constants.BUCKET_NAME_PAID).length;
          const freeClipCount = clips
            .filter(clip => clip.s3bucket === Constants.BUCKET_NAME_FREE).length;
          clips.map(({ clipID, characterName, s3bucket }) => {
            if (!clipsPerCharacter[s3bucket][characterName]) {
              clipsPerCharacter[s3bucket][characterName] = [clipID];
            } else {
              clipsPerCharacter[s3bucket][characterName].push(clipID);
            }
          });
          Object.assign(sessionAttributes, { clipsPerCharacter, paidClipCount, freeClipCount });
          handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        });
    }
  },
};

const ResponseInterceptor = {
  process(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const { request } = handlerInput.requestEnvelope;
    if (request.type === 'IntentRequest'
    && !Constants.DEFAULT_INTENTS.includes(request.intent.name)) {
      Object.assign(sessionAttributes, { intentOfRequest: request.intent.name });
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    }
  },
};

function getAllEntitledProducts(inSkillProductList) {
  const entitledProductList = inSkillProductList.filter(record => record.entitled === 'ENTITLED');
  console.log(`Currently entitled products: ${JSON.stringify(entitledProductList)}`);
  return entitledProductList;
}

const EntitledProductsCheck = {
  async process(handlerInput) {
    if (handlerInput.requestEnvelope.session.new === true) {
      // new session, check to see what products are already owned.
      try {
        const { locale } = handlerInput.requestEnvelope.request;
        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
        const result = await ms.getInSkillProducts(locale);
        const entitledProducts = getAllEntitledProducts(result.inSkillProducts);
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.isPaid = entitledProducts.length > 0;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
      } catch (error) {
        console.log(`Error calling InSkillProducts API: ${error}`);
      }
    }
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
    PurchaseOptionsIntent,
    BonusDetailIntent,
    BuyResponseHandler,
    MenuIntent,
    WelcomeIntent,
    ExitIntent,
    GameIntent,
    FallbackHandler,
    UnhandledIntent,
  )
  .addRequestInterceptors(LocalizationInterceptor, InitializationInterceptor, EntitledProductsCheck)
  .addResponseInterceptors(ResponseInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
