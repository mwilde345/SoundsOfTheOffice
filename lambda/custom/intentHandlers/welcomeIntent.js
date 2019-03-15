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

    const speechOutput = requestAttributes.speech
      .audio(`${Constants.S3_URL}${Constants.BUCKET_NAME_CONTENT}/intro.mp3`)
      .say(requestAttributes.t('WELCOME_MESSAGE'))
      .pause('300ms')
      .say(requestAttributes.t('MENU_MESSAGE'))
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
