/* eslint-disable max-len */
const LANGUAGE_STRING = {
  en: {
    translation: {
      WELCOME_MESSAGE: 'Welcome to Sounds of the Office',
      // GAME_NAME: 'Reindeer Trivia',
      // HELP_MESSAGE: 'I will ask you %s multiple choice questions. Respond with the number of the answer. For example, say one, two, three, or four. To start a new game at any time, say, start game. ',
      // REPEAT_QUESTION_MESSAGE: 'To repeat the last question, say, repeat. ',
      // ASK_MESSAGE_START: 'Would you like to start playing?',
      // HELP_REPROMPT: 'To give an answer to a question, respond with the number of the answer. ',
      // STOP_MESSAGE: 'Would you like to keep playing?',
      // CANCEL_MESSAGE: 'Ok, let\'s play again soon.',
      // NO_MESSAGE: 'Ok, we\'ll play another time. Goodbye!',
      // TRIVIA_UNHANDLED: 'Try saying a number between 1 and %s',
      // HELP_UNHANDLED: 'Say yes to continue, or no to end the game.',
      // START_UNHANDLED: 'Say start to start a new game.',
      // NEW_GAME_MESSAGE: 'Welcome to %s. ',
      // WELCOME_MESSAGE: 'I will ask you %s questions, try to get as many right as you can. Just say the number of the answer. Let\'s begin. ',
      // ANSWER_CORRECT_MESSAGE: 'correct. ',
      // ANSWER_WRONG_MESSAGE: 'wrong. ',
      // CORRECT_ANSWER_MESSAGE: 'The correct answer is %s: %s. ',
      // ANSWER_IS_MESSAGE: 'That answer is ',
      // TELL_QUESTION_MESSAGE: 'Question %s. %s ',
      // GAME_OVER_MESSAGE: 'You got %s out of %s questions correct. Thank you for playing!',
      // SCORE_IS_MESSAGE: 'Your score is %s. ',
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

module.exports = {
  ANSWER_COUNT: 4,
  GAME_LENGTH: 5,
  BUCKET_NAME_FREE: 'soundsoftheoffice/free',
  BUCKET_NAME_PAID: 'soundsoftheoffice/paid',
  LANGUAGE_STRING,
};
