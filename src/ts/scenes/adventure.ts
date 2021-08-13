import { Align, createTextNode } from "../nodes/text-node";
import { SCREEN_CENTER_X, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_size } from "../scene-node";

export const AdventureScene = 1;

export function setupAdventure(): number
{
  const rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  const textNodeId = createTextNode("Look at all this gameplay.", SCREEN_WIDTH, { textAlign: Align.C });
  moveNode(textNodeId, [SCREEN_CENTER_X, 20]);
  addChildNode(rootId, textNodeId);

  return rootId;
}

export function updateAdventure(now: number, delta: number): void
{

}
