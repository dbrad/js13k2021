import { Align, createTextNode } from "./text-node";
import { addChildNode, createNode, moveNode, node_render_function, node_size } from "../scene-node";

import { inputContext } from "../input";
import { pushQuad } from "../draw";
import { v2 } from "../v2";

const node_button_text_id: number[] = [];
export function createButtonNode(text: string, size: v2): number
{
  const nodeId = createNode();
  node_render_function[nodeId] = renderButtonNode;
  node_size[nodeId] = size;
  const textId = createTextNode(text, size[0], { textAlign: Align.C });
  moveNode(textId, [Math.floor(size[0] / 2), Math.floor(size[1] / 2) - 4]);
  addChildNode(nodeId, textId);
  node_button_text_id[nodeId] = textId;
  return nodeId;
}

function renderButtonNode(nodeId: number, now: number, delta: number): void 
{
  const size = node_size[nodeId];
  let colour = 0xFF666666;
  if (inputContext._active === nodeId)
  {
    colour = 0xFF333333;
  }
  else if (inputContext._hot === nodeId)
  {
    colour = 0xFF999999;
  }
  pushQuad(0, 0, size[0], size[1], colour);
}