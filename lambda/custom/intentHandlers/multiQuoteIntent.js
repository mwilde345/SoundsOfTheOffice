const Constants = require('../common/constants');
const MultiQuoteHelpers = require('../helpers/multiQuoteHelpers');
// ask skill for some quotes
// ask skill for some quotes from character
// do you want some quotes or do you want to play a game?
// // which character?
// // // Any character, x, y z
// next time say ask skill for some quotes from x

function getS3Link(clip) {
  const link = `${Constants.S3_URL}${clip.s3bucket}/${clip.clipID}.mp3`;
  return link;
}

const MultiQuoteIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return request.type === 'IntentRequest' && request.intent.name === 'MultiQuoteIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const randomSuggestions = requestAttributes.t('MULTI_SUGGESTIONS');
    let speechOutput = requestAttributes.speech
      .say(requestAttributes.t('START_QUOTE_MESSAGE'))
      .pause('200ms')
      .say(randomSuggestions[Math.floor(Math.random() * randomSuggestions.length)])
      .pause('200ms');
    Object.assign(sessionAttributes, MultiQuoteHelpers
      .getRandomQuotes(sessionAttributes, Constants.MULTI_QUOTE_COUNT));
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    sessionAttributes.randomClips.forEach((clip) => {
      speechOutput
        .say(Constants.getRandomIntro(clip.characterName))
        .audio(getS3Link(clip))
        .pause('200ms');
    });
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
