type Encounter = {
  type: number,
  data: any;
};

type GameState = {
  _generatorLevel: number,
  _fieldLevel: number,
  _qLevel: number,
  _hullLevel: number,
  _availablePower: number,
  _enginedLevel: [number, number],
  _shieldLevel: [number, number],
  _scannerLevel: [number, number],
  _minerLevel: [number, number],
  _weaponLevel: [number, number],
  _materials: number,
  _credits: number,
  _research: number,
  _distance: number,
  _adventureReward: number,
  _adventureEncounters: Encounter[],
};

export let gameState: GameState;

export function nextQCost(): number
{
  // TODO: Algo to figure out cost of next prestige based on generator and field levels
  return 200;
}

function availablePower(): number
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
    _availablePower: 3,
    _enginedLevel: [0, 0],
    _shieldLevel: [0, 0],
    _scannerLevel: [0, 0],
    _minerLevel: [0, 0],
    _weaponLevel: [0, 0],
    _materials: 0,
    _credits: 0,
    _research: 0,
    _distance: 0,
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