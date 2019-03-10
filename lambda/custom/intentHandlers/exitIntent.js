const Constants = require('../common/constants');
const ExitHelpers = require('../helpers/exitHelpers');

console.log(Constants);
console.log(ExitHelpers);

const ExitIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'ExitIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    console.log(sessionAttributes);
  },
};

module.exports = {
  ExitIntent,
};
