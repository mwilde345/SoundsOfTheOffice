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

function buildCanPlay(sessionAttributes) {
  // clips is list of object [{clipID: 'clip1', character: '', s3bucket: ''}]
  const { clips } = sessionAttributes;
  // cache is list of string clipIDs ['clip1','clip2']
  const { cache } = sessionAttributes;
  const newCache = sessionAttributes.isPaid ? cache[Constants.BUCKET_NAME_FREE]
    .concat(cache[Constants.BUCKET_NAME_PAID])
    : cache[Constants.BUCKET_NAME_FREE];
  const canPlay = clips.filter(clip => (!newCache.includes(clip.clipID)));
  return canPlay;
}

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

function filterClipsByCharacter(clips, characterName) {
  return characterName
    ? clips
      .filter(clip => clip.characterName.toLowerCase() === characterName.toLowerCase())
    : clips;
}

function filterCacheByCharacter(clips, cache, characterName) {
  return characterName ? cache
    .filter(cachedClip => clips.map(clip => clip.clipID).includes(cachedClip))
    : cache;
}

function getRandomQuotes(handlerInput, numClips, speechOutput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  const characterName = handlerInput.requestEnvelope.request.intent.slots.characterName
    ? handlerInput.requestEnvelope.request.intent.slots.characterName.value : null;
  const { cache } = sessionAttributes;
  const newCache = sessionAttributes.isPaid ? cache[Constants.BUCKET_NAME_FREE]
    .concat(cache[Constants.BUCKET_NAME_PAID])
    : cache[Constants.BUCKET_NAME_FREE];
  console.log(newCache);
  let filteredClips = filterClipsByCharacter(sessionAttributes.clips, characterName);
  console.log(filteredClips);
  let maximumViableClips = Math.min(filteredClips.length, numClips);
  console.log(maximumViableClips);
  // TODO: only suggest to buy premium if the numQuotes there is
  // more than what is available in free version. If they are paid, then say
  // we will add more quotes or they can request some
  if (!filteredClips.length) {
    if (!sessionAttributes.clips.length) {
      speechOutput.say('Sorry, I don\'t have any quotes I can play for you.');
      // if !isPaid, but I have x (> currentCount) premium quotes. buy now.
      return speechOutput;
    }
    if (characterName) {
      speechOutput.say(`Sorry, I don't have any quotes from ${characterName}. But `
        + 'here are some quotes from other characters.');
      filteredClips = sessionAttributes.clips;
      maximumViableClips = Math.min(filteredClips.length, numClips);
      //    if !isPaid, in the premium version I have x (> currentCount) quotes
      //      from ${characterName}. buy now
      //    (this means the s3 call would always need to get both paid and free)
    }
  } else if (maximumViableClips < numClips) {
    if (characterName) {
      speechOutput.say(`Turns out I only have ${maximumViableClips} quotes from ${characterName}.`);
      // if !isPaid, in the premium version I have x (> currentCount) quotes
      //    from characterName. buy now
    }
    // else just play what you got.
  }
  const filteredCache = filterCacheByCharacter(filteredClips, newCache, characterName);
  let canPlay = filteredClips.filter(clip => (!filteredCache.includes(clip.clipID)));
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
    speechOutput
      .say(Constants.getRandomIntro(clip.characterName))
      .audio(getS3Link(clip))
      .pause('200ms');
  });
  sessionAttributes.cache = insertToCache(sessionAttributes.cache, canPlay);
  // sessionAttributes.cache = sessionAttributes.cache.concat(canPlay.map(clip => clip.clipID));
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  return speechOutput;
}

// console.log(getRandomQuotes(mockAttributes, Constants.MULTI_QUOTE_COUNT));

module.exports = {
  getRandomQuotes,
};
