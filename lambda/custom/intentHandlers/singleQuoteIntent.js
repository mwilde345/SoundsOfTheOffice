const Constants = require('../common/constants');
const SingleQuoteHelpers = require('../helpers/singleQuoteHelpers');
// ask skill for a quote
// ask skill for a quote from character
// ask skill for a flash briefing
// when playing a game, this plays each question

console.log(Constants);
console.log(SingleQuoteHelpers);

const SingleQuoteIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'SingleQuoteIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    // buildClips(sessionAttributes, () => {
    //   const fileURL = getRandomQuote(sessionAttributes);
    //   speech.audio(fileURL);
    //   that.emit(':tell', speech.ssml(true));
    //   speech = new AmazonSpeech();
    // });
    console.log(sessionAttributes);
  },
};

module.exports = {
  SingleQuoteIntent,
};
