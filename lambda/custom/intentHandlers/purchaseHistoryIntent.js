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


const PurchaseHistoryIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'PurchaseHistoryIntent';
  },
  handle(handlerInput) {
    let speakOutput;
    let repromptOutput;
    const { locale } = handlerInput.requestEnvelope.request;
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

    return ms.getInSkillProducts(locale).then((result) => {
      const ownedProducts = result.inSkillProducts.filter(record => record.entitled === 'ENTITLED');
      const purchasableProducts = result.inSkillProducts.filter(record => record.entitled === 'NOT_ENTITLED' && record.purchasable === 'PURCHASABLE');
      if (ownedProducts.length === 0) {
        speakOutput = 'Looks like you haven\'t bought anything from this skill. ';
        if (purchasableProducts.length > 0) {
          speakOutput += `There is a product available for purchase at this time called ${getSpeakableListOfProducts(purchasableProducts)}`
          + '. To learn more about the product, say \'Tell me more about Bonus Content\'. '
          + ' If you are ready to buy say \'Buy Bonus Content\'. You can also just say \'Play more quotes\'. So what can I help you with?';
        } else {
          speakOutput += 'Do you want to hear more quotes? ';
        }
      } else {
        speakOutput = `You have purchased ${ownedProducts[0].name}. If you'd like a refund, say "return ${ownedProducts[0].name}". `
          + 'You can also say "play more quotes" to continue.';
      }
      repromptOutput = 'I didn\'t catch that. What can I help you with?';
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    });
  },
};

module.exports = {
  PurchaseHistoryIntent,
};
