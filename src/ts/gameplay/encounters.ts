export type ENCOUNTER_TYPE = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const ENC_STATION: ENCOUNTER_TYPE = 0;
export const ENC_STAR: ENCOUNTER_TYPE = 1;
export const ENC_PLANET_GAS: ENCOUNTER_TYPE = 2;
export const ENC_PLANET_ROCK: ENCOUNTER_TYPE = 3;
export const ENC_PIRATE: ENCOUNTER_TYPE = 4;
export const ENC_SPACE_BEAST: ENCOUNTER_TYPE = 5;
export const ENC_ASTEROID: ENCOUNTER_TYPE = 6;
export const ENC_ANOMALY: ENCOUNTER_TYPE = 7;


export const STATUS_LAWLESS = 0;
export const STATUS_NEUTRAL = 1;
export const STATUS_CIVILIZED = 2;

export type Planet = {
  _name: string,
  _type: number,
  _colour: number,
  _scale: number,
};
export type Star = {
  _index: number,
  _nodeId: number,
  _name: string,
  _colour: number,
  _scale: number,
  _x: number,
  _y: number,
  _beforePlanets: Planet[],
  _afterPlanets: Planet[],
  _civStatus: number;
};

export type Encounter = {
  _id: number,
  _type: number,
  _title: string,
  _scale: number,
  _position?: number,
  _yOffset: number,
  _colour?: number,
  _researchable?: number,
  _minable?: number,
  _hp?: number,
  _maxHp?: number,
  _hazardRange?: number,
  _attack?: [number, number],
  _bounty?: [number, number],
  _exit?: boolean,
};
