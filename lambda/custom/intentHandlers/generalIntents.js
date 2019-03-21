const GeneralHelpers = require('../helpers/generalHelpers');
const Constants = require('../common/constants');
const { WelcomeIntent } = require('./welcomeIntent');
const { ExitIntent } = require('./exitIntent');
const { MultiQuoteIntent } = require('./multiQuoteIntent');
const { GameIntent } = require('./gameIntent');
const { MenuIntent } = require('./menuIntent');

const LaunchRequest = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'LaunchRequest'
        || (request.type === 'IntentRequest'
          && request.intent.name === 'AMAZON.StartOverIntent');
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    handlerInput.attributesManager
      .setSessionAttributes(Object.assign(sessionAttributes, { intentOfRequest: 'WelcomeIntent' }));
    return WelcomeIntent.handle(handlerInput);
  },
};


const HelpIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Say "main menu" to start over. You can also say "get bonus quotes" or "play some quotes".')
      .reprompt('Are you still there? Say "more quotes" to keep listening to your favorite office characters.')
      .getResponse();
  },
};

const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    if (Object.keys(sessionAttributes).length === 0) {
      const speechOutput = requestAttributes.t('START_UNHANDLED');
      return handlerInput.responseBuilder
        .speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
    } if (sessionAttributes.questions) {
      const speechOutput = requestAttributes.t('TRIVIA_UNHANDLED', Constants.ANSWER_COUNT.toString());
      return handlerInput.responseBuilder
        .speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
    }
    const speechOutput = requestAttributes.t('HELP_UNHANDLED');
    return handlerInput.responseBuilder.speak(speechOutput).reprompt(speechOutput).getResponse();
  },
};

const AnswerIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && (handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'DontKnowIntent');
  },
  handle(handlerInput) {
    if (handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent') {
      return GeneralHelpers.handleUserGuess(false, handlerInput);
    }
    return GeneralHelpers.handleUserGuess(true, handlerInput);
  },
};

// TODO, put speechOutput into sessionAttributes in every speak handler, so we can repeat it.
const RepeatIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return handlerInput.responseBuilder.speak(sessionAttributes.speechOutput)
      .reprompt(sessionAttributes.repromptText)
      .getResponse();
  },
};

const YesIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    switch (sessionAttributes.intentOfRequest) {
      case 'MultiQuoteIntent':
      case 'PurchaseIntent':
        return MultiQuoteIntent.handle(handlerInput);
      case 'GameIntent':
        return GameIntent.handle(handlerInput);
      default:
        return WelcomeIntent.handle(handlerInput);
    }
  },
};

// store current state of trivia in session attributes in case of YesIntent
const StopIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const { intentOfRequest } = sessionAttributes;
    if (intentOfRequest === 'MultiQuoteIntent' || intentOfRequest === 'GameIntent') {
      const speechOutput = requestAttributes.t('STOP_MESSAGE');
      return handlerInput.responseBuilder.speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
    }
    return ExitIntent.handle(handlerInput);
  },
};

// diff between stop/cancel?
const CancelIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent';
  },
  handle(handlerInput) {
    return ExitIntent.handle(handlerInput);
  },
};

const NoIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    Object.assign(sessionAttributes, { intentOfRequest: 'MenuIntent' });
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    return MenuIntent.handle(handlerInput);
  },
};

const SessionEndedRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    // return ExitIntent.handle(handlerInput);
    return handlerInput.responseBuilder
      .speak('Session is over')
      .withShouldEndSession(true)
      .getResponse();
  },
};

module.exports = {
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
};
