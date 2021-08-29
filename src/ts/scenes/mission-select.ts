import { RUN_SHORT, THREAT_LOW, generateEncounterDeck } from "../gameplay/encounters";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_size } from "../scene-node";
import { gameState, saveGame } from "../game-state";

import { AdventureScene } from "./adventure";
import { StationScene } from "./station";
import { createButtonNode } from "../nodes/button-node";
import { createCurrencyGroupNode } from "../nodes/currency-group-node";
import { inputContext } from "../input";
import { pushScene } from "../scene";

export let MissionSelectScene = 1;

let smallSystemId: number;
let mediumSystemId: number;
let largeSystemId: number;
let unchartedSystemId: number;

let menuButton: number;
let stationButton: number;

export let setupMissionSelect = (): number =>
{
  let rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  let currency = createCurrencyGroupNode();
  moveNode(currency, 219, 0);
  addChildNode(rootId, currency);

  menuButton = createButtonNode("menu", [70, 28]);
  moveNode(menuButton, SCREEN_WIDTH - 70, 0);
  addChildNode(rootId, menuButton);

  smallSystemId = createButtonNode("small", [180, 40]);
  moveNode(smallSystemId, SCREEN_CENTER_X - 90, SCREEN_CENTER_Y - 100);
  addChildNode(rootId, smallSystemId);

  mediumSystemId = createButtonNode("medium", [180, 40]);
  moveNode(mediumSystemId, SCREEN_CENTER_X - 90, SCREEN_CENTER_Y - 50);
  addChildNode(rootId, mediumSystemId);

  largeSystemId = createButtonNode("large", [180, 40]);
  moveNode(largeSystemId, SCREEN_CENTER_X - 90, SCREEN_CENTER_Y);
  addChildNode(rootId, largeSystemId);

  unchartedSystemId = createButtonNode("uncharted", [180, 40]);
  moveNode(unchartedSystemId, SCREEN_CENTER_X - 90, SCREEN_CENTER_Y + 50);
  addChildNode(rootId, unchartedSystemId);

  stationButton = createButtonNode("upgrade ship", [160, 80]);
  moveNode(stationButton, SCREEN_WIDTH - 162, SCREEN_HEIGHT - 82);
  addChildNode(rootId, stationButton);

  return rootId;
};

export let updateMissionSelect = (now: number, delta: number): void =>
{
  if (inputContext._fire === menuButton)
  {
    saveGame();
    // TODO(dbrad): Open menu
  }

  if (inputContext._fire === stationButton)
  {
    pushScene(StationScene);
    return;
  }

  if (inputContext._fire === smallSystemId)
  {
    gameState._adventureEncounters = generateEncounterDeck(RUN_SHORT, THREAT_LOW);
    gameState._adventureReward = 1000;
    gameState._shipPosition = 0;
    gameState._threatLevel = THREAT_LOW;
    pushScene(AdventureScene);
  }
};