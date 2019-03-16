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
    const speechOutput = requestAttributes.speech
      .say(requestAttributes.t('MENU_MESSAGE'))
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
