import { Contract, Encounter, RUN_LENGTH, THREAT_LEVEL, THREAT_LOW } from "./gameplay/encounters";
import { music, startMusic } from "./zzfx";

import { math } from "./math";

type GameState = {
  _generatorLevel: number,
  _qLevel: number,
  _currentShield: number,
  _availablePower: number,
  _systemLevels: [number, number][],
  _currency: [number, number, number, number, number, number];
  _threatDeck: THREAT_LEVEL[],
  _lengthDeck: RUN_LENGTH[],
  _contracts: Contract[],
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

export let CURRENCY_CREDITS_INCOMING = 0 as const;
export let CURRENCY_CREDITS = 1 as const;
export let CURRENCY_MATERIALS_INCOMING = 2 as const;
export let CURRENCY_MATERIALS = 3 as const;
export let CURRENCY_RESEARCH_INCOMING = 4 as const;
export let CURRENCY_RESEARCH = 5 as const;

export let qDriveCosts = [6000, 12000, 18000, 36000, 54000];

export let gameState: GameState;
export let musicEnabled: boolean = true;

export let toggleMusic = (): void =>
{
  if (musicEnabled)
  {
    music.stop();
    musicEnabled = false;
  }
  else
  {
    startMusic();
    musicEnabled = true;
  }
};

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

export let qReset = (): void =>
{
  gameState._generatorLevel = math.min(5, gameState._generatorLevel + 1);
  gameState._qLevel = 0;
  gameState._systemLevels[HULL][0] = 4;
  gameState._systemLevels[HULL][1] = 0;
  for (let i = 0; i < 5; i++)
  {
    gameState._systemLevels[i][1] = math.min(1, gameState._systemLevels[i][1]);
  }
  gameState._currency[CURRENCY_CREDITS] += gameState._currency[CURRENCY_CREDITS_INCOMING];
  gameState._currency[CURRENCY_CREDITS] = math.floor(gameState._currency[CURRENCY_CREDITS] * 0.25);

  gameState._currency[CURRENCY_MATERIALS] += gameState._currency[CURRENCY_MATERIALS_INCOMING];
  gameState._currency[CURRENCY_MATERIALS] = math.floor(gameState._currency[CURRENCY_MATERIALS] * 0.25);

  gameState._currency[CURRENCY_RESEARCH] += gameState._currency[CURRENCY_RESEARCH_INCOMING];
  softReset();
};
export let softReset = (): void =>
{
  gameState._currentShield = 0;
  gameState._availablePower = maxAvailablePower();
  for (let i = 0; i < 5; i++)
  {
    gameState._systemLevels[i][0] = 0;
  }
  gameState._shipPosition = 0;
  gameState._adventureReward = 0;
  gameState._adventureEncounters = [];
};
export let initGameState = (): void =>
{
  gameState = {
    _generatorLevel: 0,
    _qLevel: 0,
    _currentShield: 0,
    _availablePower: 0,
    _systemLevels: [
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 0],
      [0, 0],
      [4, 0]
    ],
    _currency: [0, 0, 0, 0, 0, 0],
    _threatDeck: [],
    _lengthDeck: [],
    _contracts: [],
    _shipPosition: 0,
    _threatLevel: THREAT_LOW,
    _adventureReward: 0,
    _adventureEncounters: [],
  };
  softReset();
};

let saveName = `idle4xdb-save`;

export let saveGame = (): void =>
{
  let json = JSON.stringify(gameState);
  let b64 = btoa(json);
  window.localStorage.setItem(saveName, b64);
};
export let loadGame = (): void =>
{
  let b64 = window.localStorage.getItem(saveName);
  if (!b64)
  {
    initGameState();
    saveGame();
    return;
  }
  gameState = JSON.parse(atob(b64)) as GameState;
};

export let hasSaveFile = (): boolean =>
{
  return window.localStorage.getItem(saveName) !== null;
};