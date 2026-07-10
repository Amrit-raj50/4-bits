/*
  story.prompt.js
  Builds the prompt used by the Story Engine.
  No execution logic is included here.
*/

export function buildStoryPrompt({ theme, seed, playerCount }) {
  const count = playerCount || 3;
  return `You are an AI story engine for a multiplayer murder mystery game.

Generate story content using the following structure only:
- theme: A concise title or theme for the mystery.
- world: A short description of the setting and atmosphere.
- crime: A concise description of the crime.
- victim: The name of the victim.
- murderer: The name of the murderer.
- location: The location where the murder occurred.
- timeOfDeath: The approximate time of death.
- murderWeapon: The weapon or method used to kill.
- causeOfDeath: The cause of death.
- motiveSummary: A short explanation of why the murder happened.
- storySeed: A unique seed for the game session.
- victimCharacter: An object containing detailed info of the victim:
  - name: String (must match the "victim" field)
  - age: Number
  - occupation: String
  - personality: String
  - publicBackground: String
  - privateSecret: String
  - objective: String ("Rest in peace")
  - inventory: Array of 2 strings (personal items they carried)
  - alibi: String ("Deceased")
  - motive: String ("None")
- suspects: An array of exactly ${count} suspect characters. One of them MUST have isMurderer set to true and their name must match the "murderer" field. Each suspect object must have:
  - name: String
  - age: Number
  - occupation: String
  - personality: String
  - publicBackground: String
  - privateSecret: String (For the murderer, it must begin with "IS THE MURDERER." and explain their crime. For others, it's their personal secret)
  - objective: String (their primary goal during the investigation)
  - alibi: String (where they were at the time of the murder)
  - motive: String (their potential reason to want the victim dead)
  - inventory: Array of 2 strings (items they carry)
  - isMurderer: Boolean (true for exactly one suspect who is the murderer, false for others)

Respond with valid JSON only using the following schema:
{
  "theme": "string",
  "world": "string",
  "crime": "string",
  "victim": "string",
  "murderer": "string",
  "location": "string",
  "timeOfDeath": "string",
  "murderWeapon": "string",
  "causeOfDeath": "string",
  "motiveSummary": "string",
  "storySeed": "string",
  "victimCharacter": {
    "name": "string",
    "age": 55,
    "occupation": "string",
    "personality": "string",
    "publicBackground": "string",
    "privateSecret": "string",
    "objective": "string",
    "inventory": ["string", "string"],
    "alibi": "string",
    "motive": "string"
  },
  "suspects": [
    {
      "name": "string",
      "age": 30,
      "occupation": "string",
      "personality": "string",
      "publicBackground": "string",
      "privateSecret": "string",
      "objective": "string",
      "alibi": "string",
      "motive": "string",
      "inventory": ["string", "string"],
      "isMurderer": false
    }
  ]
}

Do not include any markdown, explanation, or extra fields.

Context:
- theme: ${theme || 'murder mystery'}
- seed: ${seed || 'none'}
`;
}
