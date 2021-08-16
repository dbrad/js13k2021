import { ENGINES, MINING_LASERS, SCANNERS, SHIELDS, WEAPONS, gameState, maxAvailablePower, maxHull } from "../game-state";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { TAG_LOWER_POWER, TAG_RAISE_POWER, addChildNode, calculateNodeSize, createNode, moveNode, node_size, node_tag, node_visible } from "../scene-node";
import { createSegmentedBarNode, updateSegmentedBarNode } from "../nodes/segmented-bar-node";

import { createButtonNode } from "../nodes/button-node";
import { createShipNode } from "../nodes/ship-node";
import { createTextNode } from "../nodes/text-node";
import { inputContext } from "../input";

export const AdventureScene = 2;

const systemNames = ["ENGINES", "SHIELDS", "SCANNERS", "MINING LASERS", "WEAPONS"];

const MINUS_BUTTON = 0;
const PLUS_BUTTON = 1;
const BAR = 2;

let hullBar: number;

let shieldContainer: number;
let shieldBar: number;

const systems: number[][] = [];

let generatorBar: number;

export function setupAdventure(): number
{
  const rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  const shipId = createShipNode();
  moveNode(shipId, [SCREEN_CENTER_X - 16, SCREEN_CENTER_Y - 40]);
  addChildNode(rootId, shipId, 100);

  ////////////////////////////////////////

  const hullText = createTextNode("HULL", 32, { _colour: 0xFFDDDDDD });
  moveNode(hullText, [2, 2]);
  addChildNode(rootId, hullText);

  hullBar = createSegmentedBarNode(0xFF0000FF, 16, 4, 4);
  moveNode(hullBar, [2, 12]);
  addChildNode(rootId, hullBar);

  ////////////////////////////////////////

  shieldContainer = createNode();
  moveNode(shieldContainer, [2, 30]);
  addChildNode(rootId, shieldContainer);

  const sheildText = createTextNode("SHIELDS", 56, { _colour: 0xFFDDDDDD });
  addChildNode(shieldContainer, sheildText);

  shieldBar = createSegmentedBarNode(0xFFFF0000, 34, 1, 0);
  moveNode(shieldBar, [0, 10]);
  addChildNode(shieldContainer, shieldBar);

  node_size[shieldContainer] = calculateNodeSize(shieldContainer);

  ////////////////////////////////////////

  for (let i = 0; i < 5; i++)
  {
    systems[i] = [];
    const systemContainer = createNode();
    moveNode(systemContainer, [0, 120 + (44 * i)]);
    addChildNode(rootId, systemContainer);

    const minusButton = createButtonNode("-", [26, 26]);
    node_tag[minusButton] |= TAG_LOWER_POWER;
    moveNode(minusButton, [2, 0]);
    addChildNode(systemContainer, minusButton);
    systems[i][MINUS_BUTTON] = minusButton;

    const plusButton = createButtonNode("+", [26, 26]);
    node_tag[plusButton] |= TAG_RAISE_POWER;
    moveNode(plusButton, [30, 0]);
    addChildNode(systemContainer, plusButton);
    systems[i][PLUS_BUTTON] = plusButton;

    const systemText = createTextNode(systemNames[i], 640, { _colour: 0xFFDDDDDD });
    moveNode(systemText, [58, 0]);
    addChildNode(systemContainer, systemText);

    const systemBar = createSegmentedBarNode(0xFF00FF00, 8, 1, 0);
    moveNode(systemBar, [58, 10]);
    addChildNode(systemContainer, systemBar);
    systems[i][BAR] = systemBar;

    node_size[systemContainer] = calculateNodeSize(systemContainer);
  }

  ////////////////////////////////////////

  const generatorText = createTextNode("AVAILABLE POWER", 640, { _colour: 0xFFDDDDDD });
  moveNode(generatorText, [2, 332]);
  addChildNode(rootId, generatorText);

  generatorBar = createSegmentedBarNode(0xFF00FF00, 8, 3, 3);
  moveNode(generatorBar, [2, 342]);
  addChildNode(rootId, generatorBar);

  return rootId;
}

let systemAffected = -1;
export function updateAdventure(now: number, delta: number): void
{
  //#region Segmented Bars
  updateSegmentedBarNode(hullBar, maxHull(), gameState._currentHull);
  updateSegmentedBarNode(shieldBar, gameState._systemLevels[SHIELDS][0], gameState._currentShield);
  node_visible[shieldContainer] = gameState._systemLevels[SHIELDS][0] > 0;

  updateSegmentedBarNode(generatorBar, maxAvailablePower(), gameState._availablePower);

  for (let i = 0; i < 5; i++)
  {
    updateSegmentedBarNode(systems[i][BAR], gameState._systemLevels[i][1], gameState._systemLevels[i][0]);
  }

  switch (inputContext._fire)
  {
    case systems[ENGINES][PLUS_BUTTON]:
    case systems[ENGINES][MINUS_BUTTON]:
      systemAffected = ENGINES;
      break;
    case systems[SHIELDS][PLUS_BUTTON]:
    case systems[SHIELDS][MINUS_BUTTON]:
      systemAffected = SHIELDS;
      break;
    case systems[SCANNERS][PLUS_BUTTON]:
    case systems[SCANNERS][MINUS_BUTTON]:
      systemAffected = SCANNERS;
      break;
    case systems[MINING_LASERS][PLUS_BUTTON]:
    case systems[MINING_LASERS][MINUS_BUTTON]:
      systemAffected = MINING_LASERS;
      break;
    case systems[WEAPONS][PLUS_BUTTON]:
    case systems[WEAPONS][MINUS_BUTTON]:
      systemAffected = WEAPONS;
      break;
  }

  if (systemAffected !== -1)
  {
    if ((node_tag[inputContext._fire] & TAG_LOWER_POWER) && gameState._systemLevels[systemAffected][0] > 0)
    {
      gameState._systemLevels[systemAffected][0] -= 1;
      gameState._availablePower += 1;
    }

    if ((node_tag[inputContext._fire] & TAG_RAISE_POWER) && gameState._systemLevels[systemAffected][0] < gameState._systemLevels[systemAffected][1] && gameState._availablePower > 0)
    {
      gameState._systemLevels[systemAffected][0] += 1;
      gameState._availablePower -= 1;
    }
  }
  systemAffected = -1;
  //#endregion Segmented Bars

}
