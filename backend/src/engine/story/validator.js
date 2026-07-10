/*
  story/validator.js
  Validates story generation request data and engine output.
*/

const OUTPUT_KEYS = [
  'theme',
  'world',
  'crime',
  'victim',
  'murderer',
  'location',
  'timeOfDeath',
  'murderWeapon',
  'causeOfDeath',
  'motiveSummary',
  'storySeed',
];

class StoryValidator {
  static validateInput(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Story engine input must be an object.');
    }

    if (payload.theme != null && typeof payload.theme !== 'string') {
      throw new Error('Theme must be a string.');
    }

    if (payload.seed != null && typeof payload.seed !== 'string') {
      throw new Error('Story seed must be a string.');
    }
  }

  static validateOutput(result) {
    if (!result || typeof result !== 'object') {
      throw new Error('Story engine response must be an object.');
    }

    for (const key of OUTPUT_KEYS) {
      if (!result[key] || typeof result[key] !== 'string') {
        throw new Error(`Story output must include a valid '${key}'.`);
      }
    }

    if (!result.victimCharacter || typeof result.victimCharacter !== 'object') {
      throw new Error('Story output must include a valid victimCharacter object.');
    }

    if (!Array.isArray(result.suspects) || result.suspects.length === 0) {
      throw new Error('Story output must include a valid suspects array.');
    }
  }
}

export default StoryValidator;
