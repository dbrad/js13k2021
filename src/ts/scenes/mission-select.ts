import { Align, createTextNode } from "../nodes/text-node";
import { RUN_MEDIUM, RUN_SHORT, THREAT_LOW, generateEncounterDeck } from "../gameplay/encounters";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_size } from "../scene-node";

import { AdventureScene } from "./adventure";
import { createButtonNode } from "../nodes/button-node";
import { gameState } from "../game-state";
import { inputContext } from "../input";
import { pushScene } from "../scene";

export let MissionSelectScene = 1;

let smallSystemId: number;
let mediumSystemId: number;
let largeSystemId: number;
let unchartedSystemId: number;

export let setupMissionSelect = (): number =>
{
  let rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  let textNodeId = createTextNode("Select System Size", SCREEN_WIDTH, { _textAlign: Align.C });
  moveNode(textNodeId, [SCREEN_CENTER_X, 20]);
  addChildNode(rootId, textNodeId);

  smallSystemId = createButtonNode("Small", [180, 40]);
  moveNode(smallSystemId, [SCREEN_CENTER_X - 90, SCREEN_CENTER_Y - 100]);
  addChildNode(rootId, smallSystemId);

  mediumSystemId = createButtonNode("Medium", [180, 40]);
  moveNode(mediumSystemId, [SCREEN_CENTER_X - 90, SCREEN_CENTER_Y - 50]);
  addChildNode(rootId, mediumSystemId);

  largeSystemId = createButtonNode("Large", [180, 40]);
  moveNode(largeSystemId, [SCREEN_CENTER_X - 90, SCREEN_CENTER_Y]);
  addChildNode(rootId, largeSystemId);

  unchartedSystemId = createButtonNode("Uncharted", [180, 40]);
  moveNode(unchartedSystemId, [SCREEN_CENTER_X - 90, SCREEN_CENTER_Y + 50]);
  addChildNode(rootId, unchartedSystemId);

  return rootId;
};

export let updateMissionSelect = (now: number, delta: number): void =>
{
  if (inputContext._fire === smallSystemId)
  {
    gameState._adventureEncounters = generateEncounterDeck(RUN_MEDIUM, THREAT_LOW);
    console.log(gameState._adventureEncounters);
    pushScene(AdventureScene);
  }
};