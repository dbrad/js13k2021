import { Encounter } from "./gameplay/encounters";

type GameState = {
  _generatorLevel: number,
  _fieldLevel: number,
  _hullLevel: number,
  _qLevel: number,
  _currentHull: number,
  _currentShield: number,
  _availablePower: number,
  _systemLevels: [number, number][],
  _materials: number,
  _credits: number,
  _research: number,
  _shipPosition: number,
  _adventureReward: number,
  _adventureEncounters: Encounter[],
};

// Ship System Indexes
export let ENGINES = 0;
export let SHIELDS = 1;
export let SCANNERS = 2;
export let MINING_LASERS = 3;
export let WEAPONS = 4;


export let gameState: GameState;

export let nextQCost = (): number =>
{
  // TODO: Algo to figure out cost of next prestige based on generator and field levels
  return 200;
};

export let maxHull = (): number =>
{
  return 4 + (gameState._hullLevel);
};

export let maxShield = (): number =>
{
  return gameState._systemLevels[SHIELDS][1];
};

export let maxAvailablePower = (): number =>
{
  return 3 + gameState._generatorLevel * 2;
};

export let reset = (): void =>
{
  // TODO(dbrad): Reset / reduce all temporal stats.
};
export let initGameState = (slot: number): void =>
{
  gameState = {
    _generatorLevel: 0,
    _fieldLevel: 0,
    _hullLevel: 0,
    _qLevel: 0,
    _currentHull: 4,
    _currentShield: 0,
    _availablePower: 3,
    _systemLevels: [
      [0, 4],
      [0, 4],
      [0, 4],
      [0, 4],
      [0, 4],
    ],
    _materials: 0,
    _credits: 0,
    _research: 0,
    _shipPosition: 0,
    _adventureReward: 0,
    _adventureEncounters: [],
  };
};
export let saveGame = (slot: number): void =>
{
  // TODO(dbrad): save gamestate to local storage for given slot
};
export let loadGame = (slot: number): void =>
{
  // TODO(dbrad): load gamestate from local storage for given slot
};