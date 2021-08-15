import { addChildNode, createNode, moveNode, node_render_function } from "../scene-node";

import { createTextNode } from "./text-node";
import { pushQuad } from "../draw";

export function createHPUINode(): number
{
  const nodeId = createNode();
  node_render_function[nodeId] = renderHPUI;

  const hullText = createTextNode("HULL", 32, { _colour: 0xFFDDDDDD });
  moveNode(hullText, [4, 2]);
  addChildNode(nodeId, hullText);


  const sheildText = createTextNode("SHIELDS", 56, { _colour: 0xFFDDDDDD });
  moveNode(sheildText, [16, 28]);
  addChildNode(nodeId, sheildText);

  return nodeId;
}

function renderHPUI(nodeId: number, now: number, delta: number): void
{

  pushQuad(0, 0, 40, 12, 0xFF666666);

  // background scaled by hull level
  pushQuad(0, 12, 150, 12, 0xFF666666);
  pushQuad(4, 13, 142, 10, 0xFF222222);

  for (let i = 0; i < 7; i++)
  {
    pushQuad(6 + (20 * i), 15, 18, 6, 0xFF0000FF);

  }

  pushQuad(12, 26, 64, 12, 0xFF666666);

  // background scaled by shield level
  pushQuad(12, 38, 90, 12, 0xFF666666);
  pushQuad(16, 40, 82, 8, 0xFF222222);

  for (let i = 0; i < 4; i++)
  {
    pushQuad(18 + (20 * i), 42, 18, 4, 0xFFFF0000);

  }
}