const Constants = require('../common/constants');
const PurchaseHelpers = require('../helpers/purchaseHelpers');
/*
    Helper function that returns a speakable list of product names from a list of
    entitled products.
*/
function getSpeakableListOfProducts(entitleProductsList) {
  const productNameList = entitleProductsList.map(item => item.name);
  let productListSpeech = productNameList.join(', '); // Generate a single string with comma separated product names
  productListSpeech = productListSpeech.replace(/_([^_]*)$/, 'and $1'); // Replace last comma with an 'and '
  return productListSpeech;
}


const PurchaseOptionsIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'PurchaseOptionsIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    let speakOutput;
    let repromptOutput;
    const { locale } = handlerInput.requestEnvelope.request;
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

    return ms.getInSkillProducts(locale).then((result) => {
      const purchasableProducts = result.inSkillProducts.filter(record => record.entitled === 'NOT_ENTITLED' && record.purchasable === 'PURCHASABLE');

      if (purchasableProducts.length > 0) {
        speakOutput = `Products available for purchase at this time are ${getSpeakableListOfProducts(purchasableProducts)}`
          + '. To learn more about a product, say \'Tell me more about\' followed by the product name. '
          + ' If you are ready to buy say \'Buy\' followed by the product name. So what can I help you with?';
        repromptOutput = 'I didn\'t catch that. What can I help you with?';

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(repromptOutput)
          .getResponse();
      }
      // no products!
      console.log('!!! ALERT !!!  The product list came back as empty.  This could be due to no ISPs being created and linked to the skill, the ISPs being created '
        + ' incorrectly, the locale not supporting ISPs, or the customer\'s account being from an unsupported marketplace.');
      speakOutput = 'I\'ve checked high and low, however I can\'t find any products to offer to you right now.  Sorry about that.  '
        + 'I can\t guarantee it, but I might be able to find something later.  Would you like a random quote now instead?';
      repromptOutput = 'I didn\'t catch that. What can I help you with?';

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    });
  },
};

module.exports = {
  PurchaseOptionsIntent,
};
