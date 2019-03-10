const Constants = require('../common/constants');
const SingleQuoteHelpers = require('../helpers/singleQuoteHelpers');

console.log(Constants);
console.log(SingleQuoteHelpers);

const SingleQuoteIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'SingleQuoteIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    console.log(sessionAttributes);
  },
};

module.exports = {
  SingleQuoteIntent,
};
