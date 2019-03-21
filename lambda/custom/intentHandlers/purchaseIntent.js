const Constants = require('../common/constants');
const PurchaseHelpers = require('../helpers/purchaseHelpers');

const PurchaseIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'PurchaseIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
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
      return handlerInput.responseBuilder
        .speak('I don\'t think we have a product by that name.  Can you try again?')
        .reprompt('I didn\'t catch that. Can you try again?')
        .getResponse();
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

    return ms.getInSkillProducts(locale).then((result) => {
      const product = result.inSkillProducts.filter(record => record.productId === productId);
      console.log(`PRODUCT = ${JSON.stringify(product)}`);
      if (handlerInput.requestEnvelope.request.status.code === '200') {
        let speakOutput;
        let repromptOutput;
        switch (handlerInput.requestEnvelope.request.payload.purchaseResult) {
          case 'ACCEPTED':

            speakOutput = `You have unlocked the ${product[0].name}.  Here is one of your new quotes: lolz.`;
            repromptOutput = 'sup reprompt';
            break;
          case 'DECLINED':
            if (handlerInput.requestEnvelope.request.name === 'Buy') {
              // response when declined buy request
              speakOutput = `Thanks for your interest in the ${product[0].name}. sucker.`;
              repromptOutput = 'Would you like another random fact?';
              break;
            }
            // response when declined upsell request
            speakOutput = 'OK.  Here\'s a random fact: poop. Would you like another random fact?';
            repromptOutput = 'Would you like another random fact?';
            break;
          case 'ALREADY_PURCHASED':
            // may have access to more than what was asked for, but give them a random
            // fact from the product they asked to buy

            speakOutput = 'Here is your fact: already bought that shiz.';
            repromptOutput = 'sup reprompt';
            break;
          default:
            console.log(`unhandled purchaseResult: ${handlerInput.requestEnvelope.payload.purchaseResult}`);
            speakOutput = `Something unexpected happened, but thanks for your interest in the ${product[0].name}.  Would you like another random fact?`;
            repromptOutput = 'Would you like another random fact?';
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
