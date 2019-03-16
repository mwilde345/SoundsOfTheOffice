const async = require('async');
const Constants = require('../common/constants');
const ExitHelpers = require('../helpers/exitHelpers');

const ExitIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'ExitIntent';
  },
  async handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const userID = handlerInput.requestEnvelope.context.System.user.userId;
    const { cache } = sessionAttributes;
    return ExitHelpers.updateCache(userID, cache)
      .then(() => handlerInput.responseBuilder
        .speak(requestAttributes.t('EXIT_MESSAGE'))
        .withShouldEndSession(true)
        .getResponse());
  },
};

module.exports = {
  ExitIntent,
};
