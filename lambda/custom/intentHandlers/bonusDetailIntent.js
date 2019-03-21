const Constants = require('../common/constants');
const PurchaseHelpers = require('../helpers/purchaseHelpers');

function isProduct(product) {
  return product
    && product.length > 0;
}
const BonusDetailIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'BonusDetailIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const { locale } = handlerInput.requestEnvelope.request;
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

    return ms.getInSkillProducts(locale).then((result) => {
      // let productCategory = getResolvedValue(handlerInput.requestEnvelope, 'productCategory');
      // const spokenCategory = getSpokenValue(handlerInput.requestEnvelope, 'productCategory');

      // // nothing spoken for the slot value
      // if (spokenCategory === undefined) {
      //   return handlerInput.responseBuilder
      //     .addDelegateDirective()
      //     .getResponse();
      // }

      // // NO ENTITY RESOLUTION MATCH
      // if (productCategory === undefined) {
      //   return handlerInput.responseBuilder
      //     .speak('I don\'t think we have a product by that name.  Can you try again?')
      //     .reprompt('I didn\'t catch that. Can you try again?')
      //     .getResponse();
      // }

      // if (productCategory !== 'all_access') productCategory += '_pack';

      const product = result.inSkillProducts;
      // .filter(record => record.referenceName === productCategory);

      if (isProduct(product)) {
        const speakOutput = `${product[0].summary}. To buy it, say Buy ${product[0].name}. `;
        const repromptOutput = `I didn't catch that. To buy ${product[0].name}, say Buy ${product[0].name}. `;
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(repromptOutput)
          .getResponse();
      }

      console.log(`!!! ALERT !!!  The requested product **${'bonus crap'}** could not be found.  This could be due to no ISPs being created and linked to the skill, the ISPs being created `
        + ' incorrectly, the locale not supporting ISPs, or the customer\'s account being from an unsupported marketplace.');

      return handlerInput.responseBuilder
        .speak('I can\'t find a product by that name.  Can you try again?')
        .reprompt('I didn\'t catch that. Can you try again?')
        .getResponse();
    });
  },
};

module.exports = {
  BonusDetailIntent,
};
