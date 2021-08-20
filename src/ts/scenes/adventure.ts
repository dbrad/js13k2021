import { ENGINES, MINING_LASERS, SCANNERS, SHIELDS, WEAPONS, gameState, maxAvailablePower, maxHull } from "../game-state";
import { GREY_111, HULL_RED, POWER_GREEN, SHIELD_BLUE, WHITE } from "../colour";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { TAG_ENTITY_NONE, TAG_ENTITY_PLAYER_SHIP, createEntityNode, setEntityNode } from "../nodes/entity-node";
import { TAG_LOWER_POWER, TAG_RAISE_POWER, addChildNode, calculateNodeSize, createNode, moveNode, node_size, node_tag, node_visible } from "../scene-node";
import { createSegmentedBarNode, updateSegmentedBarNode } from "../nodes/segmented-bar-node";

import { assert } from "../debug";
import { createButtonNode } from "../nodes/button-node";
import { createSpriteNode } from "../nodes/sprite-node";
import { createTextNode } from "../nodes/text-node";
import { inputContext } from "../input";

export let AdventureScene = 2;

let systemNames = ["ENGINES", "SHIELDS", "SCANNERS", "MINING LASERS", "WEAPONS"];

let MINUS_BUTTON = 0;
let PLUS_BUTTON = 1;
let BAR = 2;

let hullBar: number;

let shieldContainer: number;
let shieldBar: number;
let shieldTimer: number = 0;
let SHIELD_COOLDOWN = 1000;

let systems: number[][] = [];

let generatorBar: number;

let windowOfOppertunity: number[] = [];
let WOO_WIDTH_BASE = 128;
let WOO_INCREMENT = 8;
let windowWidth = WOO_WIDTH_BASE;

let entityPool: number[] = [];

export let setupAdventure = (): number =>
{
  let rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  let shipId = createEntityNode(TAG_ENTITY_PLAYER_SHIP);
  moveNode(shipId, [SCREEN_CENTER_X - 16, SCREEN_CENTER_Y - 40]);
  addChildNode(rootId, shipId, 10);

  ////////////////////////////////////////

  for (let i = 0; i < 10; i++)
  {
    let entity = createEntityNode(TAG_ENTITY_NONE);
    moveNode(entity, [480, SCREEN_CENTER_Y - 40]);
    addChildNode(rootId, entity);
    entityPool.push(entity);
  }

  ////////////////////////////////////////

  let hullText = createTextNode("HULL", 32, { _colour: WHITE });
  moveNode(hullText, [2, 2]);
  addChildNode(rootId, hullText);

  hullBar = createSegmentedBarNode(HULL_RED, 16, 4, 4);
  moveNode(hullBar, [2, 12]);
  addChildNode(rootId, hullBar);

  ////////////////////////////////////////

  shieldContainer = createNode();
  moveNode(shieldContainer, [2, 30]);
  addChildNode(rootId, shieldContainer);

  let sheildText = createTextNode("SHIELDS", 56, { _colour: WHITE });
  addChildNode(shieldContainer, sheildText);

  shieldBar = createSegmentedBarNode(SHIELD_BLUE, 34, 1, 0);
  moveNode(shieldBar, [0, 10]);
  addChildNode(shieldContainer, shieldBar);

  ////////////////////////////////////////

  for (let i = 0; i < 5; i++)
  {
    systems[i] = [];
    let systemContainer = createNode();
    moveNode(systemContainer, [0, 120 + (44 * i)]);
    addChildNode(rootId, systemContainer);

    let minusButton = createButtonNode("-", [26, 26]);
    node_tag[minusButton] |= TAG_LOWER_POWER;
    moveNode(minusButton, [2, 0]);
    addChildNode(systemContainer, minusButton);
    systems[i][MINUS_BUTTON] = minusButton;

    let plusButton = createButtonNode("+", [26, 26]);
    node_tag[plusButton] |= TAG_RAISE_POWER;
    moveNode(plusButton, [30, 0]);
    addChildNode(systemContainer, plusButton);
    systems[i][PLUS_BUTTON] = plusButton;

    let shadow = createTextNode(systemNames[i], 640, { _colour: GREY_111 });
    moveNode(shadow, [58, 1]);
    addChildNode(systemContainer, shadow);

    let systemText = createTextNode(systemNames[i], 640, { _colour: WHITE });
    moveNode(systemText, [58, 0]);
    addChildNode(systemContainer, systemText);

    let systemBar = createSegmentedBarNode(POWER_GREEN, 8, 1, 0);
    moveNode(systemBar, [58, 10]);
    addChildNode(systemContainer, systemBar);
    systems[i][BAR] = systemBar;

    node_size[systemContainer] = calculateNodeSize(systemContainer);
  }

  ////////////////////////////////////////

  let generatorText = createTextNode("AVAILABLE POWER", 640, { _colour: WHITE });
  moveNode(generatorText, [2, 332]);
  addChildNode(rootId, generatorText);

  generatorBar = createSegmentedBarNode(POWER_GREEN, 8, 3, 3);
  moveNode(generatorBar, [2, 342]);
  addChildNode(rootId, generatorBar);

  ////////////////////////////////////////

  windowOfOppertunity[0] = createSpriteNode("brk");
  moveNode(windowOfOppertunity[0], [SCREEN_CENTER_X - windowWidth, SCREEN_CENTER_Y - 84]);
  addChildNode(rootId, windowOfOppertunity[0]);

  windowOfOppertunity[1] = createSpriteNode("brk", { _hFlip: true });
  moveNode(windowOfOppertunity[1], [SCREEN_CENTER_X + windowWidth - 16, SCREEN_CENTER_Y - 84]);
  addChildNode(rootId, windowOfOppertunity[1]);

  windowOfOppertunity[2] = createSpriteNode("brk", { _vFlip: true });
  moveNode(windowOfOppertunity[2], [SCREEN_CENTER_X - windowWidth, SCREEN_CENTER_Y + 20]);
  addChildNode(rootId, windowOfOppertunity[2]);

  windowOfOppertunity[3] = createSpriteNode("brk", { _hFlip: true, _vFlip: true });
  moveNode(windowOfOppertunity[3], [SCREEN_CENTER_X + windowWidth - 16, SCREEN_CENTER_Y + 20]);
  addChildNode(rootId, windowOfOppertunity[3]);

  ////////////////////////////////////////

  let menuButton = createButtonNode("Menu", [70, 28]);
  moveNode(menuButton, [SCREEN_WIDTH - 70, 0]);
  addChildNode(rootId, menuButton);

  return rootId;
};

let systemAffected = -1;
let shipMovementTimer = 0;
let shipTimings = [80, 64, 48, 32, 16];
export let updateAdventure = (now: number, delta: number): void =>
{
  shipMovementTimer += delta;
  if (shipMovementTimer > shipTimings[gameState._systemLevels[ENGINES][0]])
  {
    shipMovementTimer = 0;
    gameState._shipPosition++;
  }
  windowWidth = WOO_WIDTH_BASE + (WOO_INCREMENT * gameState._systemLevels[SCANNERS][0]);
  moveNode(windowOfOppertunity[0], [SCREEN_CENTER_X - windowWidth, SCREEN_CENTER_Y - 84]);
  moveNode(windowOfOppertunity[1], [SCREEN_CENTER_X + windowWidth - 16, SCREEN_CENTER_Y - 84]);
  moveNode(windowOfOppertunity[2], [SCREEN_CENTER_X - windowWidth, SCREEN_CENTER_Y + 20]);
  moveNode(windowOfOppertunity[3], [SCREEN_CENTER_X + windowWidth - 16, SCREEN_CENTER_Y + 20]);

  let entityIndex = 0;
  for (let encounter of gameState._adventureEncounters)
  {
    assert(encounter._position !== undefined, "No position for encounter");
    if (encounter._position > gameState._shipPosition - 480 && encounter._position < gameState._shipPosition + 480)
    {
      setEntityNode(entityPool[entityIndex], encounter._type, { _scale: encounter._scale, _colour: encounter._colour });
      let position = (SCREEN_CENTER_X - 16) + (encounter._position - gameState._shipPosition);
      moveNode(entityPool[entityIndex], [position, SCREEN_CENTER_Y - 40 + encounter._yOffset]);
      entityIndex++;
    }
  }
  for (let e = entityIndex; e < 10; e++)
  {
    setEntityNode(entityPool[entityIndex], TAG_ENTITY_NONE, {});
  }

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
  //#endregion SHIELDS

  //#region Segmented Bars
  updateSegmentedBarNode(hullBar, maxHull(), gameState._currentHull);
  updateSegmentedBarNode(shieldBar, gameState._systemLevels[SHIELDS][0], gameState._currentShield);
  node_visible[shieldContainer] = gameState._systemLevels[SHIELDS][0] > 0;

  updateSegmentedBarNode(generatorBar, maxAvailablePower(), gameState._availablePower);

  for (let i = 0; i < 5; i++)
  {
    updateSegmentedBarNode(systems[i][BAR], gameState._systemLevels[i][1], gameState._systemLevels[i][0]);
  }

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
    if ((node_tag[inputContext._fire] & TAG_LOWER_POWER) && gameState._systemLevels[systemAffected][0] > 0)
    {
      gameState._systemLevels[systemAffected][0] -= 1;
      gameState._availablePower += 1;
      if (systemAffected === SHIELDS)
      {
        gameState._currentShield = Math.min(gameState._currentShield, gameState._systemLevels[SHIELDS][0]);
      }
    }

    if ((node_tag[inputContext._fire] & TAG_RAISE_POWER) && gameState._systemLevels[systemAffected][0] < gameState._systemLevels[systemAffected][1] && gameState._availablePower > 0)
    {
      gameState._systemLevels[systemAffected][0] += 1;
      gameState._availablePower -= 1;
    }
  }
  systemAffected = -1;
  //#endregion Segmented Bars
};
