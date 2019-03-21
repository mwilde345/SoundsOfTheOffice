const Constants = require('../common/constants');
const MultiQuoteHelpers = require('../helpers/multiQuoteHelpers');
// ask skill for some quotes
// ask skill for some quotes from character
// do you want some quotes or do you want to play a game?
// // which character?
// // // Any character, x, y z
// next time say ask skill for some quotes from x

const MultiQuoteIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return request.type === 'IntentRequest' && request.intent.name === 'MultiQuoteIntent';
  },
  handle(handlerInput) {
    // TODO: if given a character slot, and character has less than quote count quotes,
    // let the user know. Then let them know how many are in the paid bucket if they are not paid.
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    // if invoking the intent directly, give suggestions for what to say in the future.
    // otherwise just continue playing quotes.
    // TODO: only do the suggestion message if coming from the menu. directly invoking should
    // not have that.
    // TODO: for the suggestion, use the character name if they specify it.
    let speechOutput = requestAttributes.speech;
    speechOutput = MultiQuoteHelpers
      .getRandomQuotes(handlerInput, Constants.MULTI_QUOTE_COUNT, speechOutput);
    speechOutput = speechOutput.ssml();
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(requestAttributes.t('MULTI_QUOTE_REPROMPT'))
      .getResponse();
  },
};


module.exports = {
  MultiQuoteIntent,
};
