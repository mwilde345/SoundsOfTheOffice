const Constants = require('../common/constants');
const MultiQuoteHelpers = require('../helpers/multiQuoteHelpers');
// ask skill for some quotes
// ask skill for some quotes from character
// do you want some quotes or do you want to play a game?
// // which character?
// // // Any character, x, y z
// next time say ask skill for some quotes from x

console.log(Constants);
console.log(MultiQuoteHelpers);

const MultiQuoteIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'MultiQuoteIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    console.log(sessionAttributes);
  },
};

module.exports = {
  MultiQuoteIntent,
};
