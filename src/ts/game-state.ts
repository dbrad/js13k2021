type Encounter = {
  type: number,
  data: any;
};

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

export const ENGINES = 0;
export const SHIELDS = 1;
export const SCANNERS = 2;
export const MINING_LASERS = 3;
export const WEAPONS = 4;

export let gameState: GameState;

export function nextQCost(): number
{
  // TODO: Algo to figure out cost of next prestige based on generator and field levels
  return 200;
}

export function maxHull(): number
{
  return 4 + (gameState._hullLevel);
}

export function maxShield(): number
{
  return gameState._systemLevels[SHIELDS][1];
}

export function maxAvailablePower(): number
{
  return 3 + gameState._generatorLevel * 2;
}

export function reset(): void
{
  // TODO(dbrad): Reset / reduce all temporal stats.
}
export function initGameState(slot: number): void
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
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 1],
    ],
    _materials: 0,
    _credits: 0,
    _research: 0,
    _shipPosition: 0,
    _adventureReward: 0,
    _adventureEncounters: [],
  };
}
export function saveGame(slot: number): void
{
  // TODO(dbrad): save gamestate to local storage for given slot
}
export function loadGame(slot: number): void
{
  // TODO(dbrad): load gamestate from local storage for given slot
}