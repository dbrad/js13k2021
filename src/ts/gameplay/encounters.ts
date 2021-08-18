import { rand, shuffle } from "../random";

import { v2 } from "../v2";

export type ENCOUNTER_TYPE = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const ENC_STATION: ENCOUNTER_TYPE = 0;
export const ENC_STAR: ENCOUNTER_TYPE = 1;
export const ENC_PLANET_GAS: ENCOUNTER_TYPE = 2;
export const ENC_PLANET_ROCK: ENCOUNTER_TYPE = 3;
export const ENC_PIRATE: ENCOUNTER_TYPE = 4;
export const ENC_SPACE_BEAST: ENCOUNTER_TYPE = 5;
export const ENC_ASTEROID: ENCOUNTER_TYPE = 6;

export const ENC_ANOMALY: ENCOUNTER_TYPE = 7;

export type Encounter = {
  _type: ENCOUNTER_TYPE,
  _position?: number,
  _researchable?: boolean,
  _minable?: boolean,
  _hp?: number,
  _hazardRange?: number,
  _bounty?: number,
};

export type RUN_LENGTH = 0 | 1 | 2 | 3 | 4;

export const RUN_SHORT: RUN_LENGTH = 0;
export const RUN_MEDIUM: RUN_LENGTH = 1;
export const RUN_LONG: RUN_LENGTH = 2;
export const RUN_UNCHARTED: RUN_LENGTH = 3;
export const RUN_SPECIAL: RUN_LENGTH = 4;

export type THREAT_LEVEL = 0 | 1 | 2;
export const THREAT_LOW: THREAT_LEVEL = 0;
export const THREAT_MEDIUM: THREAT_LEVEL = 1;
export const THREAT_HIGH: THREAT_LEVEL = 2;

const RunLengths: v2[] = [[13, 15], [26, 30], [39, 45], [15, 45], [50, 50]];
const RunRanges: number[][] = [
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


export function generateEncounterDeck(runLength: RUN_LENGTH, threatLevel: THREAT_LEVEL): Encounter[]
{
  if (runLength === RUN_UNCHARTED) runLength = rand(0, 2) as RUN_LENGTH;
  let encounterDeck: Encounter[] = [];

  const minMax = RunLengths[runLength];
  const numberOfCards = rand(minMax[0], minMax[1]);

  const runEncounters = RunRanges[runLength];
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

  const fillerNeeded = numberOfCards - encounterDeck.length - 1;

  for (let i = 0; i < fillerNeeded; i++)
  {
    encounterDeck.push(createAsteroid());
  }

  encounterDeck = shuffle(encounterDeck);

  const numberOfStations = runEncounters[0];
  const interval = Math.ceil(encounterDeck.length / (numberOfStations + 1));
  for (let i = 0; i < numberOfStations; i++)
  {
    encounterDeck.splice(interval * (i + 1), 0, createStation());
  }

  encounterDeck.push(createStation());

  return encounterDeck;
}

function createStation(): Encounter
{
  return { _type: ENC_STATION };
}
function createStar(): Encounter
{
  return {
    _type: ENC_STAR,
    _researchable: true,
    _hazardRange: 100
  };
}
function createGasPlanet(): Encounter
{
  return {
    _type: ENC_PLANET_GAS,
    _researchable: true,
    _minable: true
  };
}
function createRockPlanet(): Encounter
{
  return {
    _type: ENC_PLANET_ROCK,
    _researchable: true,
    _minable: true
  };
}
function createAsteroid(): Encounter
{
  return {
    _type: ENC_ASTEROID,
    _minable: true
  };
}
function createPirate(threatLevel: THREAT_LEVEL): Encounter
{
  // TODO(dbrad): scale based on threat level
  return {
    _type: ENC_PIRATE,
    _hp: 3,
    _bounty: 100,
    _hazardRange: 100
  };
}
function createSpaceBeast(threatLevel: THREAT_LEVEL): Encounter
{
  // TODO(dbrad): scale based on threat level
  return {
    _type: ENC_SPACE_BEAST,
    _researchable: true,
    _hp: 3,
    _bounty: 100,
    _hazardRange: 100
  };
}
function createAnomaly(): Encounter
{
  return {
    _type: ENC_ANOMALY
  };
}