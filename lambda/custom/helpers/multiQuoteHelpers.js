const Constants = require('../common/constants');

const mockAttributes = {
  isPaid: true,
  cache: {
    'soundsoftheoffice/free': [
      'clip1free',
      'clip2free',
      'clip3free',
      'clip4free',
    ],
    'soundsoftheoffice/paid': [
      'clip1paid',
      'clip2paid',
      'clip3paid',
      'clip4paid',
    ],
  },
  clips: [
    { clipID: 'clip1free', character: 'dwight', s3bucket: 'soundsoftheoffice/free' },
    { clipID: 'clip2free', character: 'dwight', s3bucket: 'soundsoftheoffice/free' },
    { clipID: 'clip3free', character: 'dwight', s3bucket: 'soundsoftheoffice/free' },
    { clipID: 'clip4free', character: 'dwight', s3bucket: 'soundsoftheoffice/free' },
    { clipID: 'clip1paid', character: 'dwight', s3bucket: 'soundsoftheoffice/paid' },
    { clipID: 'clip2paid', character: 'dwight', s3bucket: 'soundsoftheoffice/paid' },
    { clipID: 'clip3paid', character: 'dwight', s3bucket: 'soundsoftheoffice/paid' },
    { clipID: 'clip4paid', character: 'dwight', s3bucket: 'soundsoftheoffice/paid' },
  ],
};

function insertToCache(cache, canPlay) {
  canPlay.forEach((clip) => {
    cache[clip.s3bucket].push(clip.clipID);
  });
  return cache;
}

function clearCache(attributes, clips) {
  const sessionAttributes = attributes;
  const { cache, isPaid } = sessionAttributes;
  const clipIDs = clips.map(clip => clip.clipID);
  // remove everything in the cache that you find in clips
  cache[Constants.BUCKET_NAME_FREE] = cache[Constants.BUCKET_NAME_FREE]
    .filter(clipID => !clipIDs.includes(clipID));
  if (isPaid) {
    cache[Constants.BUCKET_NAME_PAID] = cache[Constants.BUCKET_NAME_PAID]
      .filter(clipID => !clipIDs.includes(clipID));
  }
  return cache;
}

function getS3Link(clip) {
  const link = `${Constants.S3_URL}${clip.s3bucket}/${clip.clipID}.mp3`;
  return link;
}

function filterClipsByCharacter(clips, characterName, isPaid) {
  const filteredByPaid = clips
    .filter(clip => (isPaid ? true : clip.s3bucket === Constants.BUCKET_NAME_FREE));
  return characterName
    ? filteredByPaid
      .filter(clip => clip.characterName.toLowerCase() === characterName.toLowerCase())
    : filteredByPaid;
}

function filterCacheByCharacter(clips, cache, characterName) {
  return characterName ? cache
    .filter(cachedClip => clips.map(clip => clip.clipID).includes(cachedClip))
    : cache;
}

function handlePlural(wordBase, number) {
  switch (number) {
    case 1:
      return wordBase;
    default:
      return `${wordBase}s`;
  }
}

function handleUpsell(handlerInput, productId, upsellMessage) {
  return handlerInput.responseBuilder
    .addDirective({
      type: 'Connections.SendRequest',
      name: 'Upsell',
      payload: {
        InSkillProduct: {
          productId,
        },
        upsellMessage,
      },
      token: 'correlationToken',
    })
    .getResponse();
}


function getRandomQuotes(handlerInput, numClips, speechOutput) {
  // TODO: add haveHeardMenu to attributes. So after each chunk of quotes we don't annoy them
  // TODO: add givenCharacterName to sessionAttributes to preserve it
  //  when hitting YES and STOP intents
  //   so when saying "yes" after quotes played, or "continue" when stopped, it can keep going.
  // if we are continuing from a yes/stop intent, don't say oh i knew you would choose character.
  // just say, i'll keep playing quotes from character.
  // TODO: characterInfo intent. list off all the characters.
  //  add characterName slot that will give # of quotes in free and paid bucket
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
  const {
    isPaid, paidClipCount, freeClipCount, clipsPerCharacter, cache, productId,
  } = sessionAttributes;
  let listenedToAll = false;
  const characterName = handlerInput.requestEnvelope.request.intent.slots
    && handlerInput.requestEnvelope.request.intent.slots.characterName
    ? handlerInput.requestEnvelope.request.intent.slots.characterName.value : null;
  // if they invoke this intent from welcome screen, it means they may
  // not know how to invoke it directly. But if they come from the Menu screen,
  // they still may not know because they may have come from the game screen.
  if (sessionAttributes.intentOfRequest === 'WelcomeIntent') {
    speechOutput
      .say(requestAttributes.t('START_QUOTE_MESSAGE'))
      .pause('200ms')
      .say(
        requestAttributes.t('MULTI_SUGGESTION', characterName ? `from ${characterName}.` : '.'),
      )
      .pause('700ms');
  }
  // blip from alexa about what character they chose.
  if (characterName) {
    speechOutput
      .say(Constants.getRandomIntroGivenCharacter(characterName))
      .pause('1s');
  }

  const newCache = sessionAttributes.isPaid ? cache[Constants.BUCKET_NAME_FREE]
    .concat(cache[Constants.BUCKET_NAME_PAID])
    : cache[Constants.BUCKET_NAME_FREE];
  let paidClipsForCharacterCount = 0;
  const allowedClips = sessionAttributes.clips
    .filter(clip => (isPaid ? true : clip.s3bucket === Constants.BUCKET_NAME_FREE));
  let filteredClips = filterClipsByCharacter(allowedClips, characterName, isPaid);
  let maximumViableClips = Math.min(filteredClips.length, numClips);
  if (!filteredClips.length) {
    if (!sessionAttributes.clips.length) {
      speechOutput.say('Sorry, I don\'t have any quotes I can play for you.');
      if (!isPaid && paidClipCount > 0) {
        speechOutput.say(`You can purchase the bonus content and get access to ${paidClipCount} bonus quotes.`
          + 'Say "get bonus quotes" for more details.');
      } else if (isPaid) {
        speechOutput.say('Thank you for purchasing the premium pack, I\'m sorry that I don\'t have any quotes right now.'
        + 'There must be a mistake. I\'ll fix it soon!');
      }
      return speechOutput;
    }
    if (characterName) {
      paidClipsForCharacterCount = clipsPerCharacter[Constants.BUCKET_NAME_PAID][characterName]
        .length;
      speechOutput.say(`Oops! That's embarrassing. I actually don't have any quotes from ${characterName}.`);
      if (!isPaid && paidClipsForCharacterCount) {
        speechOutput.say(`However, I have ${paidClipsForCharacterCount} `
        + `${handlePlural('quote', paidClipsForCharacterCount)} from ${characterName} in the bonus `
        + 'quotes pack. Say "get bonus quotes" to learn more.');
      }
      speechOutput.say('In the meantime, here are some quotes from random characters: ');
      filteredClips = sessionAttributes.clips;
      maximumViableClips = Math.min(filteredClips.length, numClips);
    }
  } else if (maximumViableClips < numClips) {
    if (characterName) {
      // TODO: keep track of whether or not they've heard the bonus upsell for a specific character
      speechOutput.say(`Turns out I only have ${maximumViableClips} `
      + `${handlePlural('quote', maximumViableClips)} from ${characterName}.`);
      if (!isPaid && paidClipsForCharacterCount > maximumViableClips) {
        speechOutput.say(`In the bonus quote pack, I have ${paidClipsForCharacterCount} `
        + `${handlePlural('quote', paidClipsForCharacterCount)} from ${characterName}`
        + ' that you can listen to. Say "get bonus quotes" to learn more. Anyway, let\'s see what '
        + `${characterName} has to say: `);
      }
    }
  }
  const filteredCache = filterCacheByCharacter(filteredClips, newCache, characterName);
  let canPlay = filteredClips.filter(clip => (!filteredCache.includes(clip.clipID)));
  if (allowedClips.length === newCache.length + canPlay.length) {
    console.log('listened to all the quotes');
    listenedToAll = true;
  }
  if (canPlay.length < maximumViableClips) {
    sessionAttributes.cache = clearCache(sessionAttributes, filteredClips);
    filteredClips.forEach((clip) => {
      // make sure we don't put duplicates into canPlay from the clips
      if (canPlay.length !== maximumViableClips
          && !canPlay.map(item => item.clipID).includes(clip.clipID)) {
        canPlay.push(clip);
      }
    });
  } else {
    canPlay = canPlay.slice(0, maximumViableClips);
  }
  canPlay.forEach((clip) => {
    // if they provide a character alias, don't prefix every clip with a blip about who says it.
    speechOutput
      .say(
        characterName ? '' : Constants.getRandomIntro(clip.characterName),
      )
      .audio(getS3Link(clip))
      .pause('200ms');
  });

  speechOutput.say(Constants.generateQuoteEnding());
  if (listenedToAll) {
    if (isPaid) {
      speechOutput.say(`Nice job! You've listend to all ${freeClipCount} free quotes, and all ${paidClipCount} bonus quotes.`
        + 'Check back soon for brand new quotes that will be added! I\'ll go ahead and reshuffle them. Wanna keep going?');
    } else {
      speechOutput.say(`Nice job! You've listened to all ${freeClipCount} free quotes. Did you know there are ${paidClipCount} `
        + 'more bonus quotes you can get? Don\'t miss out on hearing more of your favorite characters! Want to learn more?');
      return handleUpsell(handlerInput, productId, speechOutput.ssml());
    }
  } else {
    speechOutput.say(requestAttributes.t('MULTI_QUOTE_ENDING'));
  }
  if (!sessionAttributes.haveHeardMenu) {
    speechOutput.say('Say: "yes", to hear random quotes.');
    speechOutput.say(`You can also say: "more from ${characterName
      || Constants.getRandomCharacter()}"`);
    sessionAttributes.haveHeardMenu = true;
  }
  sessionAttributes.cache = insertToCache(sessionAttributes.cache, canPlay);
  // sessionAttributes.cache = sessionAttributes.cache.concat(canPlay.map(clip => clip.clipID));
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  return speechOutput;
}

// console.log(getRandomQuotes(mockAttributes, Constants.MULTI_QUOTE_COUNT));

module.exports = {
  getRandomQuotes,
};
