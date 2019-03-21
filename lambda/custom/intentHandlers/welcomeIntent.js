const Constants = require('../common/constants');
const WelcomeHelpers = require('../helpers/welcomeHelpers');

// open skill

const WelcomeIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'WelcomeIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const { isPaid } = handlerInput.attributesManager.getSessionAttributes();
    const speechOutput = requestAttributes.speech
      .audio(`${Constants.S3_URL}${Constants.BUCKET_NAME_CONTENT}/intro.mp3`)
      .say(isPaid ? requestAttributes.t('WELCOME_MESSAGE_PREMIUM')
        : requestAttributes.t('WELCOME_MESSAGE_FREE'))
      .pause('300ms')
      .say(isPaid ? requestAttributes.t('MENU_MESSAGE_PREMIUM')
        : requestAttributes.t('WELCOME_MESSAGE_FREE'))
      .ssml();
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(requestAttributes.t('MENU_REPROMPT'))
      .getResponse();
  },
};

module.exports = {
  WelcomeIntent,
};
