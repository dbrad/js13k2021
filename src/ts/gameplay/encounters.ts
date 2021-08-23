import { GAS_PLANET_COLOURS, ROCK_PLANET_COLOURS, SPACE_BEAST_PURPLE, STAR_COLOURS } from "../colour";
import { rand, shuffle } from "../random";

import { v2 } from "../v2";

export type ENCOUNTER_TYPE = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export let ENC_STATION: ENCOUNTER_TYPE = 0;
export let ENC_STAR: ENCOUNTER_TYPE = 1;
export let ENC_PLANET_GAS: ENCOUNTER_TYPE = 2;
export let ENC_PLANET_ROCK: ENCOUNTER_TYPE = 3;
export let ENC_PIRATE: ENCOUNTER_TYPE = 4;
export let ENC_SPACE_BEAST: ENCOUNTER_TYPE = 5;
export let ENC_ASTEROID: ENCOUNTER_TYPE = 6;
export let ENC_ANOMALY: ENCOUNTER_TYPE = 7;

export type Encounter = {
  _id: number,
  _type: ENCOUNTER_TYPE,
  _title: string,
  _position?: number,
  _yOffset: number,
  _colour?: number,
  _scale?: number,
  _researchable?: boolean,
  _minable?: boolean,
  _hp?: number,
  _maxHp?: number,
  _hazardRange?: number,
  _bounty?: number,
  _exit?: boolean,
};

export type RUN_LENGTH = 0 | 1 | 2 | 3 | 4;

export let RUN_SHORT: RUN_LENGTH = 0;
export let RUN_MEDIUM: RUN_LENGTH = 1;
export let RUN_LONG: RUN_LENGTH = 2;
export let RUN_UNCHARTED: RUN_LENGTH = 3;
export let RUN_SPECIAL: RUN_LENGTH = 4;

export type THREAT_LEVEL = 0 | 1 | 2;
export let THREAT_LOW: THREAT_LEVEL = 0;
export let THREAT_MEDIUM: THREAT_LEVEL = 1;
export let THREAT_HIGH: THREAT_LEVEL = 2;

let RunLengths: v2[] = [[13, 15], [26, 30], [39, 45], [15, 45], [50, 50]];
let RunRanges: number[][] = [
  [
    1, 1, 2, 2, 2, 1
  ],
  [
    2, 2, 4, 4, 4, 2
  ],
  [
    3, 3, 6, 6, 6, 3
  ],
];

let entityId: number;
export let generateEncounterDeck = (selectedRunLength: RUN_LENGTH, threatLevel: THREAT_LEVEL): Encounter[] =>
{
  entityId = 0;
  let runLength: number = selectedRunLength;
  if (selectedRunLength === RUN_UNCHARTED) runLength = rand(0, 2) as RUN_LENGTH;
  else if (selectedRunLength === RUN_SPECIAL) runLength = 2;

  let encounterDeck: Encounter[] = [];

  let minMax = RunLengths[runLength];
  let numberOfCards = rand(minMax[0], minMax[1]);

  let runEncounters = RunRanges[runLength];
  for (let i = 0; i < runEncounters.length; i++)
  {
    for (let j = 0; j < runEncounters[i]; j++)
    {
      if (i === ENC_STAR)
      {
        encounterDeck.push(createStar());
      }
      else if (i === ENC_PLANET_GAS)
      {
        encounterDeck.push(createGasPlanet());
      }
      else if (i === ENC_PLANET_ROCK)
      {
        encounterDeck.push(createRockPlanet());
      }
      else if (i === ENC_PIRATE)
      {
        encounterDeck.push(createPirate(threatLevel));
      }
      else if (i === ENC_SPACE_BEAST)
      {
        encounterDeck.push(createSpaceBeast(threatLevel));
      }
    }
  }

  if (threatLevel >= THREAT_MEDIUM)
  {
    for (let t = 0; t < runLength + 1; t++)
    {
      encounterDeck.push(createPirate(threatLevel));
    }
  }

  if (threatLevel >= THREAT_HIGH)
  {
    for (let t = 0; t < runLength + 1; t++)
    {
      encounterDeck.push(createPirate(threatLevel));
      encounterDeck.push(createSpaceBeast(threatLevel));
    }
  }

  let fillerNeeded = numberOfCards - encounterDeck.length - 1;

  for (let i = 0; i < fillerNeeded; i++)
  {
    encounterDeck.push(createAsteroid());
  }

  encounterDeck = shuffle(encounterDeck);

  let numberOfStations = runEncounters[0];
  let interval = Math.ceil(encounterDeck.length / (numberOfStations + 1));
  for (let i = 0; i < numberOfStations; i++)
  {
    encounterDeck.splice(interval * (i + 1), 0, createStation());
  }

  if (selectedRunLength === RUN_SPECIAL)
  {
    encounterDeck.push(createAnomaly());
  }
  else
  {
    encounterDeck.push(createStation(true));
  }

  let index = 0;
  for (let encounter of encounterDeck)
  {
    encounter._position = rand(400 + index * 500, 740 + index * 500);
    index++;
  }

  return encounterDeck;
};

//#region Encounter Factories
let createStation = (exit: boolean = false): Encounter =>
{
  return {
    _id: entityId++,
    _type: ENC_STATION,
    _title: "station",
    _yOffset: rand(-30, 30),
    _scale: 3,
    _exit: exit
  };
};
function createStar(): Encounter
{
  return {
    _id: entityId++,
    _type: ENC_STAR,
    _title: "star",
    _yOffset: rand(-50, 20),
    _colour: STAR_COLOURS[rand(0, 2)],
    _scale: rand(8, 10),
    _researchable: true,
    _hazardRange: 100
  };
}
let createGasPlanet = (): Encounter =>
{
  return {
    _id: entityId++,
    _type: ENC_PLANET_GAS,
    _title: "gas planet",
    _yOffset: rand(-40, 30),
    _colour: GAS_PLANET_COLOURS[rand(0, 2)],
    _scale: rand(4, 7),
    _researchable: true,
    _minable: true
  };
};
let createRockPlanet = (): Encounter =>
{
  return {
    _id: entityId++,
    _type: ENC_PLANET_ROCK,
    _title: "rocky planet",
    _yOffset: rand(-30, 30),
    _colour: ROCK_PLANET_COLOURS[rand(0, 2)],
    _scale: rand(3, 5),
    _researchable: true,
    _minable: true
  };
};
let createAsteroid = (): Encounter =>
{
  return {
    _id: entityId++,
    _type: ENC_ASTEROID,
    _title: "asteroid",
    _yOffset: rand(-50, 50),
    _minable: true,
    _scale: rand(1, 2)
  };
};
let hpLevel = [3, 4, 5];
let createPirate = (threatLevel: THREAT_LEVEL): Encounter =>
{
  return {
    _id: entityId++,
    _type: ENC_PIRATE,
    _title: "pirate ship",
    _yOffset: rand(-30, 30),
    _maxHp: hpLevel[threatLevel],
    _hp: hpLevel[threatLevel],
    _bounty: rand(100, 200) * (threatLevel + 1),
    _hazardRange: 100
  };
};
let createSpaceBeast = (threatLevel: THREAT_LEVEL): Encounter =>
{
  return {
    _id: entityId++,
    _type: ENC_SPACE_BEAST,
    _title: "???",
    _yOffset: rand(-30, 30),
    _colour: SPACE_BEAST_PURPLE,
    _researchable: true,
    _maxHp: hpLevel[threatLevel],
    _hp: hpLevel[threatLevel],
    _hazardRange: 100,
    _scale: 3
  };
};
let createAnomaly = (): Encounter =>
{
  return {
    _id: entityId++,
    _type: ENC_ANOMALY,
    _title: "quantum anomaly",
    _yOffset: rand(-30, 30),
    _scale: 3,
    _exit: true
  };
};
//#endregion Encounter Factories