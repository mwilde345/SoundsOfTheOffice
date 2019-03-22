/* eslint-disable max-len */
function generateQuoteEnding() {
  const ENDING_STRINGS = [
    'Having fun yet?',
    'I can\'t help but laugh at these!',
    'These are hilarious. I love my job.',
    'I haven\'t had this much fun in a while!',
    'How do these people not laugh while filming!?',
  ];
  return ENDING_STRINGS[Math.floor(Math.random() * ENDING_STRINGS.length)];
}
const LANGUAGE_STRING = {
  en: {
    translation: {
      WELCOME_MESSAGE_FREE: 'Welcome to Sounds of the Office.',
      WELCOME_MESSAGE_PREMIUM: 'Welcome to Sounds of the Office: Premium Version.',
      MENU_MESSAGE_PREMIUM: 'You have access to all premium quotes. Say: "Play Quotes" to get started!',
      MENU_MESSAGE_FREE: 'To get started say: "Play Quotes". To get lots of bonus quotes, say: "bonus quotes".',
      MENU_REPROMPT: 'Are you still there? You can say: "Play some quotes". Say "help" for more help. Say "exit" to leave the office.',
      START_QUOTE_MESSAGE: 'Next time you can skip the menu by saying: ',
      MULTI_SUGGESTION: 'Ask Sounds of the Office to play a few quotes %s',
      MULTI_QUOTE_ENDING: 'Would you like to hear more?',
      MULTI_QUOTE_REPROMPT: 'Are you still there? Say "more quotes" to hear more. Say "exit" to leave the office.',
      SINGLE_SUGGESTION: 'Ask Sounds of the Office to play a quote %s',
      EXIT_MESSAGE: 'Thanks for dropping in. Goodbye!',
      CANCEL_MESSAGE: 'Thanks for dropping in. Goodbye!',
      STOP_MESSAGE: 'What would you like to do? Say "continue", "main menu", or "stop".',
      NO_MESSAGE: 'Thanks for dropping in. Goodbye!',

      GAME_NAME: 'Reindeer Trivia',
      HELP_MESSAGE: 'I will ask you %s multiple choice questions. Respond with the number of the answer. For example, say one, two, three, or four. To start a new game at any time, say, start game. ',
      REPEAT_QUESTION_MESSAGE: 'To repeat the last question, say, repeat. ',
      ASK_MESSAGE_START: 'Would you like to start playing?',
      HELP_REPROMPT: 'To give an answer to a question, respond with the number of the answer. ',
      TRIVIA_UNHANDLED: 'Try saying a number between 1 and %s',
      HELP_UNHANDLED: 'Say quotes to hear quotes. Say menu to start over. Say exit to leave.',
      START_UNHANDLED: 'Say start to start a new game.',
      NEW_GAME_MESSAGE: 'Welcome to %s. ',
      ANSWER_CORRECT_MESSAGE: 'correct. ',
      ANSWER_WRONG_MESSAGE: 'wrong. ',
      CORRECT_ANSWER_MESSAGE: 'The correct answer is %s: %s. ',
      ANSWER_IS_MESSAGE: 'That answer is ',
      TELL_QUESTION_MESSAGE: 'Question %s. %s ',
      GAME_OVER_MESSAGE: 'You got %s out of %s questions correct. Thank you for playing!',
      SCORE_IS_MESSAGE: 'Your score is %s. ',
    },
  },
  'en-US': {
    translation: {
      GAME_NAME: 'American Reindeer Trivia',
    },
  },
  'en-GB': {
    translation: {
      GAME_NAME: 'British Reindeer Trivia',
    },
  },
  de: {
    translation: {
      GAME_NAME: 'Wissenswertes über Rentiere in Deutsch',
    },
  },
};

function getRandomIntro(character) {
  const INTRO_STRINGS = [
    `${character} says: `,
    `Oh, here's a good one from ${character}: `,
    `This quote is from ${character}: `,
  ];
  return INTRO_STRINGS[Math.floor(Math.random() * INTRO_STRINGS.length)];
}

function getRandomIntroGivenCharacter(character) {
  const INTRO_STRINGS = [
    `Good choice, ${character} is hilarious.:`,
    `That's funny, I think you and ${character} look a lot alike.:`,
    `Ha! I knew you would pick ${character}. I just knew it.:`,
    `${character} is a comedic genius!:`,
    `Finally! I've been waiting for you to choose ${character}.:`,
    `${character} is one of my favorites!:`,
    `Here's what I have for ${character}:`,
  ];
  return INTRO_STRINGS[Math.floor(Math.random() * INTRO_STRINGS.length)];
}
// unused for now because we want to suggest what people they can actually listen to
function getRandomCharacter() {
  const CHARACTERS = [
    'dwight',
    'michael',
    'pam',
    'jim',
    'kevin',
    'toby',
    'andy',
    'angela',
    'erin',
    'creed',
    'stanley',
    'jan',
    'ryan',
    'holly',
    'darryl',
    'meredith',
    'kelly',
    'gabe',
    'nellie',
    'robert',
    'charles',
    'phyllis',
    'oscar',
    'pete',
    'roy',
    'jo',
    'deangelo',
    'josh',
    'kat',
    'sam',
    'clark',
  ];
  return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
}

module.exports = {
  ANSWER_COUNT: 4,
  GAME_LENGTH: 5,
  BUCKET_NAME_BASE: 'soundsoftheoffice',
  BUCKET_NAME_FREE: 'soundsoftheoffice/free',
  BUCKET_NAME_PAID: 'soundsoftheoffice/paid',
  BUCKET_NAME_CONTENT: 'soundsoftheoffice/content',
  LANGUAGE_STRING,
  S3_URL: 'https://s3.amazonaws.com/',
  MULTI_QUOTE_COUNT: 3,
  getRandomIntro,
  getRandomIntroGivenCharacter,
  DEFAULT_INTENTS: [
    'AMAZON.YesIntent',
    'AMAZON.NoIntent',
    'AMAZON.CancelIntent',
    'AMAZON.RepeatIntent',
    'AMAZON.HelpIntent',
    'AMAZON.StopIntent',
  ],
  getRandomCharacter,
  generateQuoteEnding,
};
