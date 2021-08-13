import { Align, createTextNode } from "../nodes/text-node";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_size } from "../scene-node";

import { createButtonNode } from "../nodes/button-node";

export const MissionSelectScene = 1;

let smallSystemId: number;
let mediumSystemId: number;
let largeSystemId: number;
let unchartedSystemId: number;

export function setupMissionSelect(): number
{
  const rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  const textNodeId = createTextNode("Select System Size", SCREEN_WIDTH, { textAlign: Align.C });
  moveNode(textNodeId, [SCREEN_CENTER_X, 20]);
  addChildNode(rootId, textNodeId);

  smallSystemId = createButtonNode("Small", [120, 40]);
  moveNode(smallSystemId, [SCREEN_CENTER_X - 60, SCREEN_CENTER_Y - 100]);
  addChildNode(rootId, smallSystemId);

  mediumSystemId = createButtonNode("Medium", [120, 40]);
  moveNode(mediumSystemId, [SCREEN_CENTER_X - 60, SCREEN_CENTER_Y - 50]);
  addChildNode(rootId, mediumSystemId);

  largeSystemId = createButtonNode("Large", [120, 40]);
  moveNode(largeSystemId, [SCREEN_CENTER_X - 60, SCREEN_CENTER_Y]);
  addChildNode(rootId, largeSystemId);

  unchartedSystemId = createButtonNode("Uncharted", [120, 40]);
  moveNode(unchartedSystemId, [SCREEN_CENTER_X - 60, SCREEN_CENTER_Y + 50]);
  addChildNode(rootId, unchartedSystemId);

  return rootId;
}

export function updateMissionSelect(now: number, delta: number): void
{

}

function generateEncounterDeck(): void
{

}