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

function insertToCache(sessionAttributes, clip) {
  sessionAttributes.cache[clip.s3bucket].push(clip.clipID);
  return sessionAttributes.cache;
}

function clearCache(attributes) {
  const sessionAttributes = attributes;
  const { cache, isPaid } = sessionAttributes;
  cache[Constants.BUCKET_NAME_FREE] = [];
  if (isPaid) {
    cache[Constants.BUCKET_NAME_PAID] = [];
  }
  return cache;
}

function getRandomQuotes(attributes, numClips) {
  const sessionAttributes = attributes;
  sessionAttributes.randomClips = [];
  const randomClips = [];
  let canPlay = [];
  while (randomClips.length < numClips) {
    canPlay = buildCanPlay(sessionAttributes);
    // if canPlay has clips, take it from their
    if (canPlay.length) {
      const nextClip = canPlay[0];
      randomClips.push(nextClip);
      canPlay = canPlay.filter(clip => (clip.clipID !== nextClip.clipID));
      sessionAttributes.cache = insertToCache(sessionAttributes, nextClip);
    } else {
      // cache needs to be emptied
      sessionAttributes.cache = clearCache(sessionAttributes);
      canPlay = buildCanPlay(sessionAttributes);
    }
  }
  sessionAttributes.randomClips = randomClips;
  return sessionAttributes;
}

// console.log(getRandomQuotes(mockAttributes, Constants.MULTI_QUOTE_COUNT));

module.exports = {
  getRandomQuotes,
};
