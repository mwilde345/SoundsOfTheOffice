const Constants = require('../common/constants');
const WelcomeHelpers = require('../helpers/welcomeHelpers');

console.log(Constants);
console.log(WelcomeHelpers);

const WelcomeIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'WelcomeIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    console.log(sessionAttributes);
  },
};

module.exports = {
  WelcomeIntent,
};
