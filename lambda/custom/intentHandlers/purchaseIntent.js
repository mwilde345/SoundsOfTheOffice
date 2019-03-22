const Constants = require('../common/constants');
const PurchaseHelpers = require('../helpers/purchaseHelpers');
const MultiQuoteHelpers = require('../helpers/multiQuoteHelpers');

const PurchaseIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'PurchaseIntent';
  },
  handle(handlerInput) {
    const { locale } = handlerInput.requestEnvelope.request;
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
    return ms.getInSkillProducts(locale).then((result) => {
      console.log(result.inSkillProducts);
      const product = result.inSkillProducts;
      // .filter(record => record.referenceName === productCategory);
      if (product.length > 0) {
        return handlerInput.responseBuilder
          .addDirective({
            type: 'Connections.SendRequest',
            name: 'Buy',
            payload: {
              InSkillProduct: {
                productId: product[0].productId,
              },
            },
            token: 'correlationToken',
          })
          .getResponse();
      }
    });
  },
};

const BuyResponseHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'Connections.Response'
      && (handlerInput.requestEnvelope.request.name === 'Buy'
        || handlerInput.requestEnvelope.request.name === 'Upsell');
  },
  handle(handlerInput) {
    console.log('IN: BuyResponseHandler.handle');

    const { locale } = handlerInput.requestEnvelope.request;
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
    const { productId } = handlerInput.requestEnvelope.request.payload;
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const speechOutput = requestAttributes.speech;
    return ms.getInSkillProducts(locale).then((result) => {
      const product = result.inSkillProducts.filter(record => record.productId === productId);
      console.log(`PRODUCT = ${JSON.stringify(product)}`);
      if (handlerInput.requestEnvelope.request.status.code === '200') {
        let speakOutput;
        let repromptOutput;
        sessionAttributes.intentOfRequest = 'PurchaseIntent';
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        switch (handlerInput.requestEnvelope.request.payload.purchaseResult) {
          case 'ACCEPTED':
            speechOutput.say(
              `You have unlocked the ${product[0].name}.  I'll shuffle them in with the free quotes. Do you want to hear some more quotes?`,
            );
            speakOutput = `You have unlocked the ${product[0].name}.  I'll shuffle them in with the free quotes. Do you want to hear some more quotes?`;
            repromptOutput = 'Say "more quotes" to hear more. Say "quit" to exit.';
            break;
            // return MultiQuoteHelpers
            //   .getRandomQuotes(handlerInput, Constants.MULTI_QUOTE_COUNT, speechOutput);
          case 'DECLINED':
            if (handlerInput.requestEnvelope.request.name === 'Buy') {
              // response when declined buy request
              speakOutput = `Thanks for your interest in the ${product[0].name}. Wanna hear more free quotes?`;
              repromptOutput = 'Are you still there? Say "more quotes" to listen to some more free quotes.';
              break;
            }
            // response when declined upsell request
            speakOutput = 'Do you want to hear some more free quotes?';
            repromptOutput = 'Are you still there? Say "more quotes" to listen to some more free quotes.';
            break;
          case 'ALREADY_PURCHASED':
            speakOutput = 'I\'ll go ahead and shuffle the bonus quotes in with the free ones. Would you like to hear more quotes?';
            repromptOutput = 'Say "more quotes" to hear more. Say "quit" to exit.';
            break;
            // speechOutput.say('I\'m shuffling the bonus quotes in with the free ones.'
            // + 'Let\'s hear some!');
            // return MultiQuoteHelpers
            //   .getRandomQuotes(handlerInput, Constants.MULTI_QUOTE_COUNT, speechOutput);
          default:
            console.log(`unhandled purchaseResult: ${handlerInput.requestEnvelope.payload.purchaseResult}`);
            speakOutput = `Something unexpected happened, but thanks for your interest in the ${product[0].name}.  Would you like to hear more free quotes?`;
            repromptOutput = 'Would you like another free quote?';
            break;
        }
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(repromptOutput)
          .getResponse();
      }
      // Something failed.
      console.log(`Connections.Response indicated failure. error: ${handlerInput.requestEnvelope.request.status.message}`);

      return handlerInput.responseBuilder
        .speak('There was an error handling your purchase request. Please try again or contact us for help.')
        .getResponse();
    });
  },
};

module.exports = {
  PurchaseIntent,
  BuyResponseHandler,
};
