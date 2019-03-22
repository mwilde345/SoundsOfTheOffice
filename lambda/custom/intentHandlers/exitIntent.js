const async = require('async');
const Constants = require('../common/constants');
const ExitHelpers = require('../helpers/exitHelpers');

const ExitIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'ExitIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const { speech } = requestAttributes;
    const userID = handlerInput.requestEnvelope.context.System.user.userId;
    const { cache } = sessionAttributes;
    ExitHelpers.updateCache(userID, cache);
    speech
      .audio(`${Constants.S3_URL}${Constants.BUCKET_NAME_CONTENT}/outro.mp3`)
      .say(requestAttributes.t('EXIT_MESSAGE'));
    return handlerInput.responseBuilder
      .speak(speech.ssml())
      .withShouldEndSession(true)
      .getResponse();
  },
};

module.exports = {
  ExitIntent,
};
