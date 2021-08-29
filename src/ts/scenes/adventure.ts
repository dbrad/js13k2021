import { CURRENCY_CREDITS_INCOMING, CURRENCY_MATERIALS_INCOMING, CURRENCY_RESEARCH_INCOMING, ENGINES, MINING_LASERS, SCANNERS, SHIELDS, WEAPONS, currentHull, gameState, hurtPlayer, maxAvailablePower, maxHull, saveGame } from "../game-state";
import { ENC_SPACE_BEAST, ENC_STATION, THREAT_HIGH, THREAT_MEDIUM } from "../gameplay/encounters";
import { GREY_111, GREY_666, HULL_RED, POWER_GREEN, SHIELD_BLUE, WHITE } from "../colour";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { TAG_ENTITY_NONE, TAG_ENTITY_PLAYER_SHIP, createEntityNode, updateEntityNode } from "../nodes/entity-node";
import { TAG_LOWER_POWER, TAG_RAISE_POWER, addChildNode, createNode, moveNode, node_enabled, node_interactive, node_size, node_tag, node_visible } from "../scene-node";
import { beastDieSound, hullHitSound, scanSound, shipDieSound, shootSound, zzfxP } from "../zzfx";
import { createHUDNode, updateHUDNode } from "../nodes/hud-node";
import { createProgressBarNode, updateProgressBarNode } from "../nodes/progress-bar-node";
import { createRangeIndicator, updateRangeIndicator } from "../nodes/range-indicator";
import { createSegmentedBarNode, updateSegmentedBarNode } from "../nodes/segmented-bar-node";

import { MissionSelectScene } from "./mission-select";
import { StationScene } from "./station";
import { assert } from "../debug";
import { createButtonNode } from "../nodes/button-node";
import { createCurrencyGroupNode } from "../nodes/currency-group-node";
import { createTextNode } from "../nodes/text-node";
import { inputContext } from "../input";
import { math } from "../math";
import { pushScene } from "../scene";
import { systemNames } from "../gameplay/systems";

export let AdventureScene = 2;

let MINUS_BUTTON = 0;
let PLUS_BUTTON = 1;
let POWER_BAR = 2;
let PROGRESS_BAR = 3;
let DISABLED_TEXT = 4;

let playerShip: number;

let hullBar: number;

let shieldContainer: number;
let shieldBar: number;
let shieldTimer: number = 0;
let SHIELD_COOLDOWN = 2500;

let systems: number[][] = [];
let systemCoooldowns = [-1, 1500, 1250, 1000, 750];
let systemProgress = [0, 0, 0, 0, 0];

let generatorBar: number;

let playerRange: number;
let WOO_WIDTH_BASE = 128;
let WOO_INCREMENT = 8;
let windowWidth = WOO_WIDTH_BASE;

let entityPool: number[] = [];
let hudWindows: number[] = [];

let menuButton: number;

let stationButton: number;
let leaveButton: number;
export let setupAdventure = (): number =>
{
  let rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  playerShip = createEntityNode(TAG_ENTITY_PLAYER_SHIP);
  moveNode(playerShip, SCREEN_CENTER_X - 16, SCREEN_CENTER_Y - 40);
  addChildNode(rootId, playerShip, 10);

  ////////////////////////////////////////

  // Populate an entity pool, I think at most 3 are on screen, maybee a max of 5 active when you add in the gutters.
  // 10 used to make sure the stars don't align and cause us to have none available.
  for (let i = 0; i < 10; i++)
  {
    let entity = createEntityNode();
    moveNode(entity, 480, SCREEN_CENTER_Y - 40);
    addChildNode(rootId, entity);
    entityPool.push(entity);
  }

  ////////////////////////////////////////

  let hullText = createTextNode("hull", 32);
  moveNode(hullText, 2, 2);
  addChildNode(rootId, hullText);

  hullBar = createSegmentedBarNode(HULL_RED, 16, 4, 4);
  moveNode(hullBar, 2, 12);
  addChildNode(rootId, hullBar);

  ////////////////////////////////////////

  shieldContainer = createNode();
  moveNode(shieldContainer, 2, 30);
  addChildNode(rootId, shieldContainer);

  let sheildText = createTextNode("shields", 56);
  addChildNode(shieldContainer, sheildText);

  shieldBar = createSegmentedBarNode(SHIELD_BLUE, 34, 1, 0);
  moveNode(shieldBar, 0, 10);
  addChildNode(shieldContainer, shieldBar);

  ////////////////////////////////////////
  // NOTE(dbrad): This is where I set up the system power allocation per system
  for (let i = 0; i < 5; i++)
  {
    systems[i] = [];
    let systemContainer = createNode();
    moveNode(systemContainer, 0, 75 + (52 * i));
    addChildNode(rootId, systemContainer);

    let minusButton = createButtonNode("-", [26, 26]);
    node_tag[minusButton] = TAG_LOWER_POWER;
    moveNode(minusButton, 2, 0);
    addChildNode(systemContainer, minusButton);
    systems[i][MINUS_BUTTON] = minusButton;

    let plusButton = createButtonNode("+", [26, 26]);
    node_tag[plusButton] = TAG_RAISE_POWER;
    moveNode(plusButton, 30, 0);
    addChildNode(systemContainer, plusButton);
    systems[i][PLUS_BUTTON] = plusButton;

    let textShadow = createTextNode(systemNames[i], 640, { _colour: GREY_111 });
    moveNode(textShadow, 58, 1);
    addChildNode(systemContainer, textShadow);

    let systemText = createTextNode(systemNames[i], 640, { _colour: WHITE });
    moveNode(systemText, 58, 0);
    addChildNode(systemContainer, systemText);

    let notInstalledText = createTextNode("not installed", 640, { _colour: GREY_666 });
    moveNode(notInstalledText, 58, 14);
    addChildNode(systemContainer, notInstalledText);
    systems[i][DISABLED_TEXT] = notInstalledText;

    let powerBar = createSegmentedBarNode(POWER_GREEN, 8, 1, 0);
    moveNode(powerBar, 58, 10);
    addChildNode(systemContainer, powerBar);
    systems[i][POWER_BAR] = powerBar;

    if (i !== ENGINES)
    {
      let progressBar = createProgressBarNode();
      moveNode(progressBar, 2, 28);
      addChildNode(systemContainer, progressBar);
      systems[i][PROGRESS_BAR] = progressBar;
    }

    node_size[systemContainer] = [100, 30];
  }

  ////////////////////////////////////////

  let generatorText = createTextNode("available power", 640, { _colour: WHITE });
  moveNode(generatorText, 2, 332);
  addChildNode(rootId, generatorText);

  generatorBar = createSegmentedBarNode(POWER_GREEN, 8, 3, 3);
  moveNode(generatorBar, 2, 342);
  addChildNode(rootId, generatorBar);

  ////////////////////////////////////////

  playerRange = createRangeIndicator(0x99FFFFFF, windowWidth);
  moveNode(playerRange, SCREEN_CENTER_X, SCREEN_CENTER_Y - 84);
  addChildNode(rootId, playerRange);

  ////////////////////////////////////////

  let currency = createCurrencyGroupNode();
  moveNode(currency, 219, 0);
  addChildNode(rootId, currency);

  menuButton = createButtonNode("menu", [70, 28]);
  moveNode(menuButton, SCREEN_WIDTH - 70, 0);
  addChildNode(rootId, menuButton);

  ////////////////////////////////////////

  for (let h = 0; h < 2; h++)
  {
    let hudWindow = createHUDNode();
    moveNode(hudWindow, 192, SCREEN_CENTER_Y + 44 * (h + 1));
    addChildNode(rootId, hudWindow);
    hudWindows.push(hudWindow);
  }

  ////////////////////////////////////////

  stationButton = createButtonNode("visit station", [160, 80]);
  moveNode(stationButton, SCREEN_WIDTH - 162, SCREEN_HEIGHT - 82);
  addChildNode(rootId, stationButton);

  ////////////////////////////////////////

  leaveButton = createButtonNode("exit system", [160, 80]);
  moveNode(leaveButton, SCREEN_WIDTH - 162, SCREEN_HEIGHT - 82);
  addChildNode(rootId, leaveButton);

  ////////////////////////////////////////

  return rootId;
};

let systemAffected = -1;
let shipMovementTimer = 0;
let shipTimings = [32, 16, 16, 16, 16];
let shipDistance = [1, 1, 2, 3, 4];
let stopped = false;
export let updateAdventure = (now: number, delta: number): void =>
{
  node_enabled[stationButton] = false;
  node_enabled[leaveButton] = false;

  if (gameState._adventureReward === 0) return;

  if (inputContext._fire === stationButton)
  {
    pushScene(StationScene);
    return;
  }

  if (inputContext._fire === leaveButton)
  {
    gameState._currency[CURRENCY_CREDITS_INCOMING] += gameState._adventureReward;
    gameState._adventureReward = 0;
    gameState._adventureEncounters = [];
    gameState._shipPosition = 0;
    pushScene(MissionSelectScene);
    return;
  }

  if (inputContext._fire === menuButton)
  {
    saveGame();
    // TODO(dbrad): Open menu
  }

  let threatMultiplier = gameState._threatLevel === THREAT_HIGH ? 2 : gameState._threatLevel === THREAT_MEDIUM ? 1.5 : 1;

  //#region SHIP MOVEMENET
  shipMovementTimer += delta;
  if (shipMovementTimer > shipTimings[gameState._systemLevels[ENGINES][0]] && !stopped)
  {
    shipMovementTimer -= shipTimings[gameState._systemLevels[ENGINES][0]];
    if (shipMovementTimer > shipTimings[gameState._systemLevels[ENGINES][0]]) shipMovementTimer = 0;
    gameState._shipPosition += shipDistance[gameState._systemLevels[ENGINES][0]];
    gameState._qLevel += shipDistance[gameState._systemLevels[ENGINES][0]];
  }
  stopped = false;
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
    if ((node_tag[inputContext._fire] === TAG_LOWER_POWER) && gameState._systemLevels[systemAffected][0] > 0)
    {
      gameState._systemLevels[systemAffected][0] -= 1;
      gameState._availablePower += 1;
      if (systemAffected === SHIELDS)
      {
        gameState._currentShield = math.min(gameState._currentShield, gameState._systemLevels[SHIELDS][0]);
      }
    }

    if ((node_tag[inputContext._fire] === TAG_RAISE_POWER) && gameState._systemLevels[systemAffected][0] < gameState._systemLevels[systemAffected][1] && gameState._availablePower > 0)
    {
      gameState._systemLevels[systemAffected][0] += 1;
      gameState._availablePower -= 1;
    }
  }
  systemAffected = -1;

  updateSegmentedBarNode(hullBar, maxHull(), currentHull());
  updateSegmentedBarNode(shieldBar, gameState._systemLevels[SHIELDS][0], gameState._currentShield);
  node_visible[shieldContainer] = gameState._systemLevels[SHIELDS][0] > 0;

  updateSegmentedBarNode(generatorBar, maxAvailablePower(), gameState._availablePower);

  for (let i = 0; i < 5; i++)
  {
    let systemEnabled = gameState._systemLevels[i][1] > 0;
    node_enabled[systems[i][POWER_BAR]] = systemEnabled;
    node_enabled[systems[i][PROGRESS_BAR]] = systemEnabled;
    node_enabled[systems[i][DISABLED_TEXT]] = !systemEnabled;
    node_interactive[systems[i][PLUS_BUTTON]] = systemEnabled;
    node_interactive[systems[i][MINUS_BUTTON]] = systemEnabled;

    updateSegmentedBarNode(systems[i][POWER_BAR], gameState._systemLevels[i][1], gameState._systemLevels[i][0]);
    if ((i === WEAPONS || i === SCANNERS || i === MINING_LASERS))
    {
      if (systemProgress[i] > 100)
      {
        systemProgress[i] = 0;
      }
      else if (gameState._systemLevels[i][0] > 0)
      {
        systemProgress[i] = math.min(100, systemProgress[i] + (delta / systemCoooldowns[gameState._systemLevels[i][0]]) * 100);
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
  updateRangeIndicator(playerRange, windowWidth);
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
        updateEntityNode(entityPool[entityIndex], TAG_ENTITY_NONE);
      }
      else
      {
        updateEntityNode(entityPool[entityIndex], encounter._type, encounter._id, { _scale: encounter._scale, _colour: encounter._colour, _range: encounter._hazardRange });
        let position = (SCREEN_CENTER_X - 16) + (encounter._position - gameState._shipPosition);
        moveNode(entityPool[entityIndex], position, SCREEN_CENTER_Y - 40 + encounter._yOffset);
      }
      entityIndex++;
    }

    // Check if in range and alive if it has HP
    if (encounter._position + 16 * (encounter._scale || 1) > gameState._shipPosition - windowWidth + 16
      && encounter._position < gameState._shipPosition + windowWidth + 16
      && (!encounter._maxHp || (encounter._maxHp && encounter._hp)))
    {
      updateHUDNode(hudWindows[hudIndex], encounter);
      hudIndex++;

      // NOTE(dbrad): STATION
      if (encounter._type === ENC_STATION)
      {
        if (encounter._exit)
        {
          stopped = true;
          node_enabled[leaveButton] = true;
        }
        else 
        {
          node_enabled[stationButton] = true;
        }
      }

      // NOTE(dbrad): MINABLE
      if (encounter._minable && systemProgress[MINING_LASERS] >= 100)
      {
        systemProgress[MINING_LASERS]++;
        let amount = 13 * threatMultiplier;
        gameState._currency[CURRENCY_MATERIALS_INCOMING] += amount;
        zzfxP(shootSound);
        // TODO(dbrad): add mining effects
      }

      // NOTE(dbrad): RESARCHABLE
      if (encounter._researchable && systemProgress[SCANNERS] >= 100 && (encounter._maxHp === undefined || (encounter._maxHp && encounter._hp)))
      {
        systemProgress[SCANNERS]++;
        let amount = 8 * threatMultiplier;
        gameState._currency[CURRENCY_RESEARCH_INCOMING] += amount;
        zzfxP(scanSound);
        // TODO(dbrad): add research effects
      }

      // NOTE(dbrad): COMBAT
      if (encounter._hp && encounter._hp > 0 && systemProgress[WEAPONS] >= 100)
      {
        systemProgress[WEAPONS]++;
        encounter._hp = math.max(0, encounter._hp - 1);
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
            gameState._currency[encounter._bounty[1]] += encounter._bounty[0];
          }
        }
        zzfxP(shootSound);
        // TODO(dbrad): add combat effects
      }

      if (encounter._hazardRange)
      {
        // TODO(dbrad): FIX ME, I think this position comparison is slightly off, maybe need to visualize it.
        if (encounter._position + 8 + encounter._hazardRange > gameState._shipPosition
          && encounter._position + 8 - encounter._hazardRange < gameState._shipPosition + 16)
        {
          assert(encounter._attack !== undefined, "hazard range with no attack setup");
          encounter._attack[0] += delta;
          if (encounter._attack[0] >= encounter._attack[1])
          {
            encounter._attack[0] = 0;
            hurtPlayer();
            zzfxP(hullHitSound);
          }
        }
      }
    }
  }
  for (let e = entityIndex; e < 10; e++)
  {
    updateEntityNode(entityPool[entityIndex], TAG_ENTITY_NONE);
  }
  //#endregion Entities / Encounters

  //#region SHIELDS
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
  //#endregion SHIELDS

};
