const Constants = require('../common/constants');
const MenuHelpers = require('../helpers/menuHelpers');
// start over

const MenuIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'MenuIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const { isPaid } = handlerInput.attributesManager.getSessionAttributes();
    const speechOutput = requestAttributes.speech
      .say('Main Menu.')
      .say(isPaid ? requestAttributes.t('WELCOME_MESSAGE_PREMIUM')
        : requestAttributes.t('WELCOME_MESSAGE_FREE'))
      .say(isPaid ? requestAttributes.t('MENU_MESSAGE_PREMIUM')
        : requestAttributes.t('MENU_MESSAGE_FREE'))
      .say('Say "stop" or "goodbye" to leave the office')
      .ssml();
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(requestAttributes.t('MENU_REPROMPT'))
      .getResponse();
  },
};

module.exports = {
  MenuIntent,
};
