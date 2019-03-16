/* eslint-disable max-len */
const LANGUAGE_STRING = {
  en: {
    translation: {
      WELCOME_MESSAGE: 'Welcome to Sounds of the Office',
      MENU_MESSAGE: 'Main Menu. Would you like to hear some quotes, or play a game?',
      MENU_REPROMPT: 'Are you still there? You can say: Play some quotes. Or you can say: Play a game. Say "exit" to leave the office.',
      START_QUOTE_MESSAGE: 'Ok, next time you can also say: ',
      MULTI_SUGGESTIONS: [
        'Play a few quotes.',
        'Play a few quotes from Michael.',
        'Get me some quotes from Kevin.',
      ],
      MULTI_QUOTE_ENDING: 'I hope you enjoyed that! Would you like to hear more?',
      // TODO: yes intent should tell them about bonus quotes before going on
      MULTI_QUOTE_REPROMPT: 'Are you still there? Say "yes" or "more quotes" to hear more. Say "exit" to leave the office.',
      SINGLE_SUGGESTIONS: [
        'Play a quote.',
        'Get a quote from Michael.',
        'Get me a quote from Stanley.',
        'quote from Michael.',
      ],
      EXIT_MESSAGE: 'Thanks for dropping in. Goodbye!',
      CANCEL_MESSAGE: 'Thanks for dropping in. Goodbye!',
      STOP_MESSAGE: 'What would you like to do? Say "continue", "main menu", or "quit".',
      NO_MESSAGE: 'Thanks for dropping in. Goodbye!',

      GAME_NAME: 'Reindeer Trivia',
      HELP_MESSAGE: 'I will ask you %s multiple choice questions. Respond with the number of the answer. For example, say one, two, three, or four. To start a new game at any time, say, start game. ',
      REPEAT_QUESTION_MESSAGE: 'To repeat the last question, say, repeat. ',
      ASK_MESSAGE_START: 'Would you like to start playing?',
      HELP_REPROMPT: 'To give an answer to a question, respond with the number of the answer. ',
      TRIVIA_UNHANDLED: 'Try saying a number between 1 and %s',
      HELP_UNHANDLED: 'Say yes to continue, or no to end the game.',
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
    `Let's see...another one from ${character}: `,
    `${character} is one of my favorites!: `,
  ];
  return INTRO_STRINGS[Math.floor(Math.random() * INTRO_STRINGS.length)];
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
  DEFAULT_INTENTS: [
    'AMAZON.YesIntent',
    'AMAZON.NoIntent',
    'AMAZON.CancelIntent',
    'AMAZON.RepeatIntent',
    'AMAZON.HelpIntent',
    'AMAZON.StopIntent',
  ],
};
