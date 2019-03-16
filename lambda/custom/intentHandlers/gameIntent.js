const Constants = require('../common/constants');
const GameHelpers = require('../helpers/gameHelpers');

const GameIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'GameIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    console.log(sessionAttributes);
  },
};

module.exports = {
  GameIntent,
};
