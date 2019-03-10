const Constants = require('../common/constants');
const MenuHelpers = require('../helpers/menuHelpers');

console.log(Constants);
console.log(MenuHelpers);

const MenuIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'MenuIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    console.log(sessionAttributes);
  },
};

module.exports = {
  MenuIntent,
};
