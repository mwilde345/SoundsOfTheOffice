const Constants = require('../common/constants');
const PurchaseHelpers = require('../helpers/purchaseHelpers');

console.log(Constants);
console.log(PurchaseHelpers);

const PurchaseIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'PurchaseIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    console.log(sessionAttributes);
  },
};

module.exports = {
  PurchaseIntent,
};