import { Align, createTextNode } from "../nodes/text-node";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_size } from "../scene-node";

import { createShipNode } from "../nodes/ship-node";

export const AdventureScene = 2;

export function setupAdventure(): number
{
  const rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  const textNodeId = createTextNode("Look at all this gameplay.", SCREEN_WIDTH, { _textAlign: Align.C });
  moveNode(textNodeId, [SCREEN_CENTER_X, 20]);
  addChildNode(rootId, textNodeId);

  const ship = createShipNode();
  moveNode(ship, [SCREEN_CENTER_X - 16, SCREEN_CENTER_Y - 40]);
  addChildNode(rootId, ship);

  return rootId;
}

export function updateAdventure(now: number, delta: number): void
{

}
