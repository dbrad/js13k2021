import { music, startMusic } from "./zzfx";

import { Encounter } from "./gameplay/encounters";
import { math } from "./math";

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
export const CONTRACT_MINING = 0;
export const CONTRACT_RESEARCH = 1;
export const CONTRACT_BOUNTIES = 2;
export const CONTRACT_DELIVERY = 3;
export const CONTRACT_ANOMALY = 4;

export type Contract = {
  _starId: number,
  _reward: number,
  _type: number,
  _materialsRequired?: number,
  _dataRequired?: number,
  _bountiesRequired?: number,
  _bountiesCollected?: number,
  _hasPackage?: boolean,
  _destination?: number;
};

type GameState = {
  _generatorLevel: number,
  _qLevel: number,
  _currentShield: number,
  _availablePower: number,
  _systemLevels: [number, number][],
  _currency: [number, number, number, number, number, number],
  _galaxySeed: number,
  _contracts: Contract[],
  _currentPlayerSystem: number,
  _destinationSystem: number,
  _shipPosition: number,
  _adventureEncounters: Encounter[],
};
export let gameState: GameState;

export let maxHull = (): number => 4 + (gameState._systemLevels[HULL][1]);

export let currentHull = (): number => gameState._systemLevels[HULL][0];

export let maxAvailablePower = (): number => 3 + gameState._generatorLevel * 2;

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

export let qReset = (death: boolean = false): void =>
{
  if (!death)
  {
    gameState._generatorLevel = math.min(5, gameState._generatorLevel + 1);
  }
  gameState._qLevel = 0;
  gameState._systemLevels[HULL][0] = 4;
  gameState._systemLevels[HULL][1] = 0;
  for (let i = 0; i < 5; i++)
  {
    gameState._systemLevels[i][1] = math.min(1, gameState._systemLevels[i][1]);
  }
  gameState._currency[CURRENCY_CREDITS] += gameState._currency[CURRENCY_CREDITS_INCOMING];
  gameState._currency[CURRENCY_CREDITS] = math.floor(gameState._currency[CURRENCY_CREDITS] * 0.5);

  gameState._currency[CURRENCY_MATERIALS] += gameState._currency[CURRENCY_MATERIALS_INCOMING];
  gameState._currency[CURRENCY_MATERIALS] = math.floor(gameState._currency[CURRENCY_MATERIALS] * 0.5);

  gameState._currency[CURRENCY_RESEARCH] += gameState._currency[CURRENCY_RESEARCH_INCOMING];
  gameState._currency[CURRENCY_RESEARCH] += math.floor(gameState._currency[CURRENCY_RESEARCH] * 0.5);

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
      [0, 0],
      [0, 0],
      [0, 0],
      [4, 0]
    ],
    _currency: [0, 0, 0, 0, 0, 0],
    _galaxySeed: performance.now(),
    _contracts: [],
    _currentPlayerSystem: 0,
    _destinationSystem: -1,
    _shipPosition: 0,
    _adventureEncounters: [],
  };
  softReset();
};

let saveName = `idle4xdb-save`;
let storage = window.localStorage;
export let saveGame = (): void =>
{
  let json = JSON.stringify(gameState);
  let b64 = btoa(json);
  storage.setItem(saveName, b64);
};
export let loadGame = (): void =>
{
  let b64 = storage.getItem(saveName);
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
  return storage.getItem(saveName) !== null;
};