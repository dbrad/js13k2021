import { Align, createTextNode } from "../nodes/text-node";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_size } from "../scene-node";

import { createButtonNode } from "../nodes/button-node";

export const MainMenuScene = 0;

let startButtonId;

export function setupMainMenu(): number
{
  const rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  const textNodeId = createTextNode("Js13kGames Jam 2021", SCREEN_WIDTH, { textAlign: Align.C });
  moveNode(textNodeId, [SCREEN_CENTER_X, 20]);
  addChildNode(rootId, textNodeId);

  const textNodeId02 = createTextNode("Entry by David Brad", SCREEN_WIDTH, { textAlign: Align.C });
  moveNode(textNodeId02, [SCREEN_CENTER_X, 30]);
  addChildNode(rootId, textNodeId02);

  startButtonId = createButtonNode("Start", [60, 30]);
  moveNode(startButtonId, [SCREEN_CENTER_X - 30, SCREEN_CENTER_Y]);
  addChildNode(rootId, startButtonId);

  return rootId;
}

export function updateMainMenu(now: number, delta: number): void
{

}