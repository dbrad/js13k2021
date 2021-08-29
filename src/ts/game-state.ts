import { Encounter, THREAT_LEVEL, THREAT_LOW } from "./gameplay/encounters";

import { log } from "./debug";
import { math } from "./math";

type GameState = {
  _generatorLevel: number,
  _qLevel: number,
  _currentShield: number,
  _availablePower: number,
  _systemLevels: [number, number][],
  _currency: [number, number, number, number, number, number];
  _shipPosition: number,
  _threatLevel: THREAT_LEVEL,
  _adventureReward: number,
  _adventureEncounters: Encounter[],
};

// Ship System Indexes
export let ENGINES = 0 as const;
export let SHIELDS = 1 as const;
export let SCANNERS = 2 as const;
export let MINING_LASERS = 3 as const;
export let WEAPONS = 4 as const;
export let HULL = 5 as const;

export let CURRENCY_CREDITS_INCOMING = 0;
export let CURRENCY_CREDITS = 1;
export let CURRENCY_MATERIALS_INCOMING = 2;
export let CURRENCY_MATERIALS = 3;
export let CURRENCY_RESEARCH_INCOMING = 4;
export let CURRENCY_RESEARCH = 5;

export let gameState: GameState;

export let qDriveCosts = [6000, 12000, 18000, 36000, 54000];

export let maxHull = (): number =>
{
  return 4 + (gameState._systemLevels[HULL][1]);
};

export let currentHull = (): number =>
{
  return gameState._systemLevels[HULL][0];
};

export let maxAvailablePower = (): number =>
{
  return 3 + gameState._generatorLevel * 2;
};

export let hurtPlayer = (): void =>
{
  if (gameState._currentShield > 0)
  {
    gameState._currentShield--;
  }
  else
  {
    gameState._systemLevels[HULL][0] = math.max(0, gameState._systemLevels[HULL][0] - 1);
  }
};

export let reset = (): void =>
{
  // TODO(dbrad): Reset / reduce all temporal stats.
};
export let initGameState = (): void =>
{
  gameState = {
    _generatorLevel: 0,
    _qLevel: 0,
    _currentShield: 0,
    _availablePower: 3,
    _systemLevels: [
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 0],
      [0, 0],
      [4, 0]
    ],
    _currency: [0, 0, 0, 0, 0, 0],
    _shipPosition: 0,
    _threatLevel: THREAT_LOW,
    _adventureReward: 0,
    _adventureEncounters: [],
  };
};

let saveName = `idle4xdb-save`;

export let saveGame = (): void =>
{
  let json = JSON.stringify(gameState);
  log(json);
  let b64 = btoa(json);
  window.localStorage.setItem(saveName, b64);
};
export let loadGame = (): void =>
{
  let b64 = window.localStorage.getItem(saveName);
  log(b64);
  if (!b64)
  {
    initGameState();
    saveGame();
    return;
  }
  log(atob(b64));
  gameState = JSON.parse(atob(b64)) as GameState;
};

export let hasSaveFile = (): boolean =>
{
  return window.localStorage.getItem(saveName) !== null;
};