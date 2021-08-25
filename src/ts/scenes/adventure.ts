import { Align, createTextNode } from "../nodes/text-node";
import { ENC_SPACE_BEAST, ENC_STATION, THREAT_HIGH, THREAT_MEDIUM } from "../gameplay/encounters";
import { ENGINES, MINING_LASERS, SCANNERS, SHIELDS, WEAPONS, gameState, maxAvailablePower, maxHull } from "../game-state";
import { GREY_111, HULL_RED, POWER_GREEN, SHIELD_BLUE, WHITE } from "../colour";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { TAG_ENTITY_NONE, TAG_ENTITY_PLAYER_SHIP, createEntityNode, setEntityNode } from "../nodes/entity-node";
import { TAG_LOWER_POWER, TAG_RAISE_POWER, addChildNode, createNode, moveNode, node_enabled, node_interactive, node_size, node_tag, node_visible } from "../scene-node";
import { addToCurrencyNode, createCurrencyNode } from "../nodes/currency-node";
import { beastDieSound, powerSound, scanSound, shipDieSound, shootSound, zzfxP } from "../zzfx";
import { createHUDNode, updateHUDNode } from "../nodes/hud-node";
import { createProgressBarNode, updateProgressBarNode } from "../nodes/progress-bar-node";
import { createSegmentedBarNode, updateSegmentedBarNode } from "../nodes/segmented-bar-node";

import { assert } from "../debug";
import { createButtonNode } from "../nodes/button-node";
import { createSpriteNode } from "../nodes/sprite-node";
import { createWindowNode } from "../nodes/window-node";
import { inputContext } from "../input";
import { v2 } from "../v2";

export let AdventureScene = 2;

let shoppingMode = false;

let systemNames = ["engines", "shields", "scanners", "mining lasers", "weapons"];
let systemUpgradeCosts: [number, number][] = [[10, 10], [10, 10], [10, 10], [10, 10]];

let MINUS_BUTTON = 0;
let PLUS_BUTTON = 1;
let POWER_BAR = 2;
let PROGRESS_BAR = 3;

let stationWindow: number;
let gameContainer: number;

let playerShip: number;

let hullBar: number;

let shieldContainer: number;
let shieldBar: number;
let shieldTimer: number = 0;
let SHIELD_COOLDOWN = 1000;

let systems: number[][] = [];
let systemCoooldowns = [-1, 1500, 1250, 1000, 750];
let systemProgress = [0, 0, 0, 0, 0];

let generatorBar: number;

let windowOfOppertunity: number[] = [];
let WOO_WIDTH_BASE = 128;
let WOO_INCREMENT = 8;
let windowWidth = WOO_WIDTH_BASE;

let entityPool: number[] = [];
let hudWindows: number[] = [];

let credits: number;
let rawMaterials: number;
let researchData: number;

let menuButton: number;

let stationButton: number;
let leaveStationButton: number;
export let setupAdventure = (): number =>
{
  let rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  gameContainer = createNode();
  node_size[gameContainer] = [SCREEN_WIDTH, SCREEN_HEIGHT];
  addChildNode(rootId, gameContainer, 1);

  playerShip = createEntityNode(TAG_ENTITY_PLAYER_SHIP);
  moveNode(playerShip, [SCREEN_CENTER_X - 16, SCREEN_CENTER_Y - 40]);
  addChildNode(gameContainer, playerShip, 10);

  ////////////////////////////////////////

  for (let i = 0; i < 10; i++)
  {
    let entity = createEntityNode();
    moveNode(entity, [480, SCREEN_CENTER_Y - 40]);
    addChildNode(gameContainer, entity);
    entityPool.push(entity);
  }

  ////////////////////////////////////////

  let hullText = createTextNode("hull", 32, { _colour: WHITE });
  moveNode(hullText, [2, 2]);
  addChildNode(rootId, hullText);

  hullBar = createSegmentedBarNode(HULL_RED, 16, 4, 4);
  moveNode(hullBar, [2, 12]);
  addChildNode(rootId, hullBar);

  ////////////////////////////////////////

  shieldContainer = createNode();
  moveNode(shieldContainer, [2, 30]);
  addChildNode(gameContainer, shieldContainer);

  let sheildText = createTextNode("shields", 56, { _colour: WHITE });
  addChildNode(shieldContainer, sheildText);

  shieldBar = createSegmentedBarNode(SHIELD_BLUE, 34, 1, 0);
  moveNode(shieldBar, [0, 10]);
  addChildNode(shieldContainer, shieldBar);

  ////////////////////////////////////////

  for (let i = 0; i < 5; i++)
  {
    systems[i] = [];
    let systemContainer = createNode();
    moveNode(systemContainer, [0, 112 + (44 * i)]);
    addChildNode(gameContainer, systemContainer);

    let minusButton = createButtonNode("-", [26, 26]);
    node_tag[minusButton] = TAG_LOWER_POWER;
    moveNode(minusButton, [2, 0]);
    addChildNode(systemContainer, minusButton);
    systems[i][MINUS_BUTTON] = minusButton;

    let plusButton = createButtonNode("+", [26, 26]);
    node_tag[plusButton] = TAG_RAISE_POWER;
    moveNode(plusButton, [30, 0]);
    addChildNode(systemContainer, plusButton);
    systems[i][PLUS_BUTTON] = plusButton;

    let textShadow = createTextNode(systemNames[i], 640, { _colour: GREY_111 });
    moveNode(textShadow, [58, 1]);
    addChildNode(systemContainer, textShadow);

    let systemText = createTextNode(systemNames[i], 640, { _colour: WHITE });
    moveNode(systemText, [58, 0]);
    addChildNode(systemContainer, systemText);

    let powerBar = createSegmentedBarNode(POWER_GREEN, 8, 1, 0);
    moveNode(powerBar, [58, 10]);
    addChildNode(systemContainer, powerBar);
    systems[i][POWER_BAR] = powerBar;

    if (i !== ENGINES)
    {
      let progressBar = createProgressBarNode();
      moveNode(progressBar, [2, 27]);
      addChildNode(systemContainer, progressBar);
      systems[i][PROGRESS_BAR] = progressBar;
    }

    node_size[systemContainer] = [100, 30];
  }

  ////////////////////////////////////////

  let generatorText = createTextNode("available power", 640, { _colour: WHITE });
  moveNode(generatorText, [2, 332]);
  addChildNode(gameContainer, generatorText);

  generatorBar = createSegmentedBarNode(POWER_GREEN, 8, 3, 3);
  moveNode(generatorBar, [2, 342]);
  addChildNode(gameContainer, generatorBar);

  ////////////////////////////////////////

  let bracket = "brk";

  windowOfOppertunity[0] = createSpriteNode(bracket);
  moveNode(windowOfOppertunity[0], [SCREEN_CENTER_X - windowWidth, SCREEN_CENTER_Y - 84]);
  addChildNode(gameContainer, windowOfOppertunity[0]);

  windowOfOppertunity[1] = createSpriteNode(bracket, { _hFlip: true });
  moveNode(windowOfOppertunity[1], [SCREEN_CENTER_X + windowWidth - 16, SCREEN_CENTER_Y - 84]);
  addChildNode(gameContainer, windowOfOppertunity[1]);

  windowOfOppertunity[2] = createSpriteNode(bracket, { _vFlip: true });
  moveNode(windowOfOppertunity[2], [SCREEN_CENTER_X - windowWidth, SCREEN_CENTER_Y + 20]);
  addChildNode(gameContainer, windowOfOppertunity[2]);

  windowOfOppertunity[3] = createSpriteNode(bracket, { _hFlip: true, _vFlip: true });
  moveNode(windowOfOppertunity[3], [SCREEN_CENTER_X + windowWidth - 16, SCREEN_CENTER_Y + 20]);
  addChildNode(gameContainer, windowOfOppertunity[3]);

  ////////////////////////////////////////

  credits = createCurrencyNode("credits", "cr");
  moveNode(credits, [SCREEN_WIDTH - 70 - 345 - 6, 0]);
  addChildNode(rootId, credits);

  rawMaterials = createCurrencyNode("raw materials", "kg");
  moveNode(rawMaterials, [SCREEN_WIDTH - 70 - 230 - 4, 0]);
  addChildNode(rootId, rawMaterials);

  researchData = createCurrencyNode("research data", "kb");
  moveNode(researchData, [SCREEN_WIDTH - 70 - 115 - 2, 0]);
  addChildNode(rootId, researchData);

  menuButton = createButtonNode("menu", [70, 28]);
  moveNode(menuButton, [SCREEN_WIDTH - 70, 0]);
  addChildNode(gameContainer, menuButton);

  for (let h = 0; h < 2; h++)
  {
    let hudWindow = createHUDNode();
    moveNode(hudWindow, [192, SCREEN_HEIGHT - 44 * (h + 1)]);
    addChildNode(gameContainer, hudWindow);
    hudWindows.push(hudWindow);
  }

  ////////////////////////////////////////

  stationButton = createButtonNode("visit station", [160, 80]);
  moveNode(stationButton, [SCREEN_WIDTH - 162, SCREEN_HEIGHT - 82]);
  addChildNode(gameContainer, stationButton);

  ////////////////////////////////////////

  let shopSize: v2 = [600, 250];
  let divSize: v2 = [(shopSize[0] - 12) / 2, shopSize[1] - 8];

  stationWindow = createWindowNode(shopSize);
  node_enabled[stationWindow] = false;
  moveNode(stationWindow, [20, 50]);
  addChildNode(rootId, stationWindow, 2);

  let systemUpdatesDiv = createWindowNode(divSize);
  moveNode(systemUpdatesDiv, [4, 4]);
  addChildNode(stationWindow, systemUpdatesDiv);

  let shipUpgradesDiv = createWindowNode(divSize);
  moveNode(shipUpgradesDiv, [divSize[0] + 8, 4]);
  addChildNode(stationWindow, shipUpgradesDiv);

  let upgradeHeader = createTextNode("systems", 128, { _textAlign: Align.C, _scale: 2 });
  moveNode(upgradeHeader, [divSize[0] / 2, 0]);
  addChildNode(systemUpdatesDiv, upgradeHeader);

  let shipHeader = createTextNode("ship", 128, { _textAlign: Align.C, _scale: 2 });
  moveNode(shipHeader, [divSize[0] / 2, 0]);
  addChildNode(shipUpgradesDiv, shipHeader);

  leaveStationButton = createButtonNode('leave', [divSize[0], 50]);
  addChildNode(shipUpgradesDiv, leaveStationButton);

  for (let i = 0; i < 5; i++)
  {
  }
  // 5x Fully Upgraded Texts
  // 5x upgrade buttons
  // repair button
  // hull upgrade button
  // close button

  return rootId;
};

let systemAffected = -1;
let shipMovementTimer = 0;
let shipTimings = [32, 16, 16, 16, 16];
let shipDistance = [1, 1, 2, 3, 4];
export let updateAdventure = (now: number, delta: number): void =>
{
  node_enabled[stationButton] = false;
  node_enabled[stationWindow] = shoppingMode;
  node_enabled[gameContainer] = !shoppingMode;
  node_interactive[gameContainer] = !shoppingMode;

  if (shoppingMode)
  {
    if (inputContext._fire === leaveStationButton)
    {
      shoppingMode = false;
      return;
    }
    // TODO(dbrad): shopping mode handlers here
  }
  else
  {
    if (inputContext._fire === stationButton)
    {
      shoppingMode = true;
      return;
    }

    let threatMultiplier = gameState._threatLevel === THREAT_HIGH ? 2 : gameState._threatLevel === THREAT_MEDIUM ? 1.5 : 1;

    if (inputContext._fire === menuButton)
    {
      addToCurrencyNode(credits, 13);
    }

    //#region SHIP MOVEMENET
    shipMovementTimer += delta;
    if (shipMovementTimer > shipTimings[gameState._systemLevels[ENGINES][0]])
    {
      shipMovementTimer -= shipTimings[gameState._systemLevels[ENGINES][0]];
      if (shipMovementTimer > shipTimings[gameState._systemLevels[ENGINES][0]]) shipMovementTimer = 0;
      gameState._shipPosition += shipDistance[gameState._systemLevels[ENGINES][0]];
    }
    //#endregion SHIP MOVEMENET

    //#region Systems
    if (inputContext._fire === systems[ENGINES][PLUS_BUTTON] || inputContext._fire === systems[ENGINES][MINUS_BUTTON])
    {
      systemAffected = ENGINES;
    }
    else if (inputContext._fire === systems[SHIELDS][PLUS_BUTTON] || inputContext._fire === systems[SHIELDS][MINUS_BUTTON])
    {
      systemAffected = SHIELDS;
    }
    else if (inputContext._fire === systems[SCANNERS][PLUS_BUTTON] || inputContext._fire === systems[SCANNERS][MINUS_BUTTON])
    {
      systemAffected = SCANNERS;
    }
    else if (inputContext._fire === systems[MINING_LASERS][PLUS_BUTTON] || inputContext._fire === systems[MINING_LASERS][MINUS_BUTTON])
    {
      systemAffected = MINING_LASERS;
    }
    else if (inputContext._fire === systems[WEAPONS][PLUS_BUTTON] || inputContext._fire === systems[WEAPONS][MINUS_BUTTON])
    {
      systemAffected = WEAPONS;
    }

    if (systemAffected !== -1)
    {
      zzfxP(powerSound);
      if ((node_tag[inputContext._fire] === TAG_LOWER_POWER) && gameState._systemLevels[systemAffected][0] > 0)
      {
        gameState._systemLevels[systemAffected][0] -= 1;
        gameState._availablePower += 1;
        if (systemAffected === SHIELDS)
        {
          gameState._currentShield = Math.min(gameState._currentShield, gameState._systemLevels[SHIELDS][0]);
        }
      }

      if ((node_tag[inputContext._fire] === TAG_RAISE_POWER) && gameState._systemLevels[systemAffected][0] < gameState._systemLevels[systemAffected][1] && gameState._availablePower > 0)
      {
        gameState._systemLevels[systemAffected][0] += 1;
        gameState._availablePower -= 1;
      }
    }
    systemAffected = -1;

    updateSegmentedBarNode(hullBar, maxHull(), gameState._currentHull);
    updateSegmentedBarNode(shieldBar, gameState._systemLevels[SHIELDS][0], gameState._currentShield);
    node_visible[shieldContainer] = gameState._systemLevels[SHIELDS][0] > 0;

    updateSegmentedBarNode(generatorBar, maxAvailablePower(), gameState._availablePower);

    for (let i = 0; i < 5; i++)
    {
      updateSegmentedBarNode(systems[i][POWER_BAR], gameState._systemLevels[i][1], gameState._systemLevels[i][0]);
      if ((i === WEAPONS || i === SCANNERS || i === MINING_LASERS))
      {
        if (gameState._systemLevels[i][0] > 0)
        {
          systemProgress[i] = Math.min(100, systemProgress[i] + (delta / systemCoooldowns[gameState._systemLevels[i][0]]) * 100);
        }
        else
        {
          systemProgress[i] = 0;
        }
        updateProgressBarNode(systems[i][PROGRESS_BAR], systemProgress[i]);
      }
    }
    //#endregion Systems

    //#region Window of Oppertunity
    windowWidth = WOO_WIDTH_BASE + (WOO_INCREMENT * gameState._systemLevels[SCANNERS][0]);
    moveNode(windowOfOppertunity[0], [SCREEN_CENTER_X - windowWidth, SCREEN_CENTER_Y - 84]);
    moveNode(windowOfOppertunity[1], [SCREEN_CENTER_X + windowWidth - 16, SCREEN_CENTER_Y - 84]);
    moveNode(windowOfOppertunity[2], [SCREEN_CENTER_X - windowWidth, SCREEN_CENTER_Y + 20]);
    moveNode(windowOfOppertunity[3], [SCREEN_CENTER_X + windowWidth - 16, SCREEN_CENTER_Y + 20]);
    //#endregion Window of Oppertunity

    //#region Entities / Encounters
    let entityIndex = 0;
    let hudIndex = 0;
    node_visible[hudWindows[0]] = false;
    node_visible[hudWindows[1]] = false;

    for (let encounter of gameState._adventureEncounters)
    {
      assert(encounter._position !== undefined, "No position for encounter");
      if (encounter._position > gameState._shipPosition - 480 && encounter._position < gameState._shipPosition + 480)
      {
        if (encounter._maxHp && !encounter._hp)
        {
          setEntityNode(entityPool[entityIndex], TAG_ENTITY_NONE);
        }
        else
        {
          setEntityNode(entityPool[entityIndex], encounter._type, encounter._id, { _scale: encounter._scale, _colour: encounter._colour });
          let position = (SCREEN_CENTER_X - 16) + (encounter._position - gameState._shipPosition);
          moveNode(entityPool[entityIndex], [position, SCREEN_CENTER_Y - 40 + encounter._yOffset]);
        }
        entityIndex++;
      }
      if (encounter._position + 16 * (encounter._scale || 1) > gameState._shipPosition - windowWidth + 16 && encounter._position < gameState._shipPosition + windowWidth + 16 && (!encounter._maxHp || (encounter._maxHp && encounter._hp)))
      {
        updateHUDNode(hudWindows[hudIndex], encounter);
        hudIndex++;

        if (encounter._type === ENC_STATION)
        {
          node_enabled[stationButton] = true;
        }

        if (encounter._minable && systemProgress[MINING_LASERS] >= 100)
        {
          systemProgress[MINING_LASERS] = 0;
          let amount = 13 * threatMultiplier;
          gameState._materials += amount;
          addToCurrencyNode(rawMaterials, amount);
          zzfxP(shootSound);
          // TODO(dbrad): add mining effects
        }

        if (encounter._researchable && systemProgress[SCANNERS] >= 100 && (encounter._maxHp === undefined || (encounter._maxHp && encounter._hp)))
        {
          systemProgress[SCANNERS] = 0;
          let amount = 8 * threatMultiplier;
          gameState._research += amount;
          addToCurrencyNode(researchData, amount);
          zzfxP(scanSound);
          // TODO(dbrad): add research effects
        }

        if (encounter._hp && encounter._hp > 0 && systemProgress[WEAPONS] >= 100)
        {
          systemProgress[WEAPONS] = 0;
          encounter._hp = Math.max(0, encounter._hp - 1);
          if (encounter._hp === 0)
          {
            if (encounter._type === ENC_SPACE_BEAST)
            {
              zzfxP(beastDieSound);
            }
            else
            {
              zzfxP(shipDieSound);
            }

            if (encounter._bounty)
            {
              gameState._credits += encounter._bounty;
              addToCurrencyNode(credits, encounter._bounty);
            }
          }
          zzfxP(shootSound);
          // TODO(dbrad): add combat effects
        }
      }
    }
    for (let e = entityIndex; e < 10; e++)
    {
      setEntityNode(entityPool[entityIndex], TAG_ENTITY_NONE);
    }
    //#endregion Entities / Encounters

    //#region SHIELDS GUI
    // NOTE(david): We only increment the sheild cooldown is the current shield value is lower than the max.
    if (gameState._currentShield < gameState._systemLevels[SHIELDS][0])
    {
      shieldTimer += delta;
    }
    else
    {
      shieldTimer = 0;
    }

    if (shieldTimer > SHIELD_COOLDOWN)
    {
      shieldTimer -= SHIELD_COOLDOWN;
      if (gameState._currentShield < gameState._systemLevels[SHIELDS][0])
      {
        gameState._currentShield += 1;
      }
    }
    updateProgressBarNode(systems[SHIELDS][PROGRESS_BAR], shieldTimer / SHIELD_COOLDOWN * 100);
    //#endregion SHIELDS GUI
  }
};
