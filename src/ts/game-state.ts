import { music, qDriveSound, startMusic, zzfxP } from "./zzfx";

import { Encounter } from "./gameplay/encounters";
import { MainMenu } from "./scenes/main-menu";
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
  // _starId: number,
  a: number,
  // _reward: number,
  b: number,
  // _type: number,
  c: number,
  // _materialsRequired?: number,
  d?: number,
  // _dataRequired?: number,
  e?: number,
  // _bountiesRequired?: number,
  f?: number,
  // _bountiesCollected?: number,
  g?: number,
  // _hasPackage?: boolean,
  h?: boolean,
  // _destination?: number;
  i?: number;
};

type GameState = {
  // _generatorLevel: number,
  a: number,
  // _currentShield: number,
  b: number,
  // _availablePower: number,
  c: number,
  // _systemLevels: [number, number][],
  d: [number, number][],
  // _currency: [number, number, number, number, number, number],
  e: [number, number, number, number, number, number],
  // _galaxySeed: number,
  f: number,
  // _contractsCompleted: number,
  g: number,
  // _contracts: Contract[],
  h: Contract[],
  // _currentPlayerSystem: number,
  i: number,
  // _destinationSystem: number,
  j: number,
  // _shipPosition: number,
  k: number,
  // _adventureEncounters: Encounter[],
  l: Encounter[],
  // _tutorial01: boolean,
  m: boolean,
  // _tutorial02: boolean,
  n: boolean,
};
export let gameState: GameState;

export let maxHull = (): number => 4 + (gameState.d[HULL][1]);

export let currentHull = (): number => gameState.d[HULL][0];

export let maxAvailablePower = (): number => 3 + gameState.a * 2;

export let hurtPlayer = (): void =>
{
  if (gameState.b > 0)
  {
    gameState.b--;
  }
  else
  {
    gameState.d[HULL][0] = math.max(0, gameState.d[HULL][0] - 1);
  }
};


export let quamtumLeap = (): void =>
{
  zzfxP(qDriveSound);
  if (gameState.a === 5)
  {
    initGameState();
    storage.removeItem(saveName);
    setDialogText("the anomaly embraces you.\nit absorbs your power and begins to pull all nearby matter into itself.\n\nnothing escapes, everything becomes one.");
    pushScene(MainMenu._sceneId, 2000, WHITE);
    return;
  }
  gameState.a = math.min(5, gameState.a + 1);
  softReset();
  gameState.h = gameState.h.filter(contract => contract.c !== CONTRACT_ANOMALY);
  setDialogText("the anomaly rejects you, but bolsters your strength.\n\n+2 max power");
  pushScene(MissionSelect._sceneId, 1000, WHITE);
  saveGame();
};

export let deathReset = (): void =>
{
  let currency = gameState.e;
  gameState.d[HULL][0] = 4;
  gameState.d[HULL][1] = 0;
  for (let i = 0; i < 5; i++)
  {
    gameState.d[i][1] = math.max(math.min(gameState.d[i][1], 1), gameState.d[i][1] - 1);
  }
  currency[CURRENCY_CREDITS] = math.floor((currency[CURRENCY_CREDITS] + currency[CURRENCY_CREDITS_INCOMING]) * 0.5);
  currency[CURRENCY_MATERIALS] = math.floor((currency[CURRENCY_MATERIALS] + currency[CURRENCY_MATERIALS_INCOMING]) * 0.5);
  currency[CURRENCY_RESEARCH] += math.floor((currency[CURRENCY_RESEARCH] + currency[CURRENCY_RESEARCH_INCOMING]) * 0.5);

  softReset();
  setDialogText("before your vessel is destroyed, a white light blinds you. the quantum drive in your vessel has moved you to another timeline, sparing your life.\nhalf of your resources have been lost, and all of your systems have been damaged.");
};

export let softReset = (): void =>
{
  gameState.b = 0;
  gameState.c = maxAvailablePower();
  for (let i = 0; i < 5; i++)
  {
    gameState.d[i][0] = 0;
  }
  gameState.k = 0;
  gameState.l = [];
};
export let initGameState = (): void =>
{
  gameState = {
    a: 0,
    b: 0,
    c: 0,
    d: [
      [0, 1],
      [0, 1],
      [0, 0],
      [0, 0],
      [0, 0],
      [4, 0]
    ],
    e: [0, 0, 0, 0, 0, 0],
    f: performance.now(),
    g: 0,
    h: [],
    i: 0,
    j: -1,
    k: 0,
    l: [],
    m: false,
    n: false,
  };
  softReset();
};

let saveName = `2d4x13k-save`;
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