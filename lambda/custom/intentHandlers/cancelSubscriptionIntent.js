const Constants = require('../common/constants');
const MultiQuoteHelpers = require('../helpers/multiQuoteHelpers');
// Following handler demonstrates how Skills would receive Cancel requests from customers
// and then trigger a cancel request to Alexa
// User says: Alexa, ask <skill name> to cancel <product name>
const CancelSubscriptionIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CancelSubscriptionIntent';
  },
  handle(handlerInput) {
    console.log('IN: CancelSubscriptionHandler.handle');
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if (sessionAttributes.productId) {
      return handlerInput.responseBuilder
        .addDirective({
          type: 'Connections.SendRequest',
          name: 'Cancel',
          payload: {
            InSkillProduct: {
              productId: sessionAttributes.productId,
            },
          },
          token: 'correlationToken',
        })
        .getResponse();
    }

    // requested product didn't match something from the catalog
    console.log('!!! ALERT !!!  The requested product **Premium Content** could not be found.  This could be due to no ISPs being created and linked to the skill, the ISPs being created '
        + ' incorrectly, the locale not supporting ISPs, or the customer\'s account being from an unsupported marketplace.');

    return handlerInput.responseBuilder
      .speak('I don\'t think we have a product by that name.  Can you try again?')
      .reprompt('I didn\'t catch that. Can you try again?')
      .getResponse();
  },

};

// THIS HANDLES THE CONNECTIONS.RESPONSE EVENT AFTER A CANCEL OCCURS.
const CancelResponseHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'Connections.Response'
      && handlerInput.requestEnvelope.request.name === 'Cancel';
  },
  handle(handlerInput) {
    console.log('IN: CancelResponseHandler.handle');

    const { locale } = handlerInput.requestEnvelope.request;
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
    const { productId } = handlerInput.requestEnvelope.request.payload;
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speechOutput = requestAttributes.speech;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.intentOfRequest = 'CancelSubscriptionIntent';
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    return ms.getInSkillProducts(locale).then((result) => {
      let product = result.inSkillProducts.filter(record => record.productId === productId);
      if (product.length) {
        [product] = product;
      }
      console.log(`PRODUCT = ${JSON.stringify(product)}`);
      if (handlerInput.requestEnvelope.request.status.code === '200') {
        if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'ACCEPTED') {
          return handlerInput.responseBuilder
            .speak(`You have successfully refunded your purchase of ${product.name}. `
            + 'Do you want to listen to some more quotes now?')
            .reprompt('Your purchase was refunded. Say quotes to hear some more quotes.')
            .getResponse();
        }
        if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'NOT_ENTITLED') {
          speechOutput.say('You don\'t currently have any products to refund. Let\'s get back to the office.');


          return MultiQuoteHelpers
            .getRandomQuotes(handlerInput, Constants.MULTI_QUOTE_COUNT, speechOutput);
        }
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
  CancelSubscriptionIntent,
  CancelResponseHandler,
};
