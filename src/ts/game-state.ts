import { music, qDriveSound, startMusic, zzfxP } from "./zzfx";

import { Encounter } from "./gameplay/encounters";
import { MissionSelect } from "./scenes/mission-select";
import { WHITE } from "./colour";
import { math } from "./math";
import { pushScene } from "./scene";
import { setDialogText } from "./scenes/dialog";

// Ship System Indexes
export let ENGINES = 0;
export let SHIELDS = 1;
export let SCANNERS = 2;
export let MINING_LASERS = 3;
export let WEAPONS = 4;
export let HULL = 5;

export let CURRENCY_CREDITS_INCOMING = 0;
export let CURRENCY_CREDITS = 1;
export let CURRENCY_MATERIALS_INCOMING = 2;
export let CURRENCY_MATERIALS = 3;
export let CURRENCY_RESEARCH_INCOMING = 4;
export let CURRENCY_RESEARCH = 5;

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
  _currentShield: number,
  _availablePower: number,
  _systemLevels: [number, number][],
  _currency: [number, number, number, number, number, number],
  _galaxySeed: number,
  _contractsCompleted: number,
  _contracts: Contract[],
  _currentPlayerSystem: number,
  _destinationSystem: number,
  _shipPosition: number,
  _adventureEncounters: Encounter[],
  _tutorial01: boolean,
  _tutorial02: boolean,
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


export let quamtumLeap = (): void =>
{
  zzfxP(qDriveSound);
  if (gameState._generatorLevel === 5)
  {
    setDialogText("the anomaly embraces you, releasing you from your duty to the galaxy.\n\nthank you for playing");
    return;
  }
  gameState._generatorLevel = math.min(5, gameState._generatorLevel + 1);
  softReset();
  gameState._contracts = gameState._contracts.filter(contract => contract._type !== CONTRACT_ANOMALY);
  setDialogText("the anomaly rejects you, but bolsters your strength.\n\n+2 max power");
  pushScene(MissionSelect._sceneId, 1000, WHITE);
};

export let deathReset = (): void =>
{
  let currency = gameState._currency;
  gameState._systemLevels[HULL][0] = 4;
  gameState._systemLevels[HULL][1] = 0;
  for (let i = 0; i < 5; i++)
  {
    gameState._systemLevels[i][1] = math.max(math.min(gameState._systemLevels[i][1], 1), gameState._systemLevels[i][1] - 1);
  }
  currency[CURRENCY_CREDITS] = math.floor((currency[CURRENCY_CREDITS] + currency[CURRENCY_CREDITS_INCOMING]) * 0.5);
  currency[CURRENCY_MATERIALS] = math.floor((currency[CURRENCY_MATERIALS] + currency[CURRENCY_MATERIALS_INCOMING]) * 0.5);
  currency[CURRENCY_RESEARCH] += math.floor((currency[CURRENCY_RESEARCH] + currency[CURRENCY_RESEARCH_INCOMING]) * 0.5);

  softReset();
  setDialogText("before your vessel is destroyed, a white light blinds you. the quantum drive in your vessel has moved you to another timeline, sparing your life.\nhalf of your resources have been lost, and all of your systems have been damaged.");
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
    _contractsCompleted: 0,
    _contracts: [],
    _currentPlayerSystem: 0,
    _destinationSystem: -1,
    _shipPosition: 0,
    _adventureEncounters: [],
    _tutorial01: false,
    _tutorial02: false,
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