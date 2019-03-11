const Constants = require('../common/constants');
const WelcomeHelpers = require('../helpers/welcomeHelpers');
// open skill

const WelcomeIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'WelcomeIntent';
  },
  handle(handlerInput) {
    const deviceID = handlerInput.context.System.device.deviceId;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const clipsAndCache = WelcomeHelpers.getCacheAndClips(deviceID);

    Object.assign(sessionAttributes, clipsAndCache);
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);


    const speechOutput = requestAttributes.t('WELCOME_MESSAGE');
    return handlerInput.attributesManager
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  },
};

module.exports = {
  WelcomeIntent,
};
