import { Align, createTextNode, parseText } from "./text-node";
import { GREY_333, GREY_666, GREY_999 } from "../colour";
import { addChildNode, createNode, moveNode, node_render_function, node_size } from "../scene-node";

import { inputContext } from "../input";
import { pushQuad } from "../draw";
import { v2 } from "../v2";

let node_button_text_id: number[] = [];
export let createButtonNode = (text: string, size: v2, textScale: number = 2): number =>
{
  let nodeId = createNode();
  node_render_function[nodeId] = renderButtonNode;
  node_size[nodeId] = size;
  let lines = parseText(text, size[0], 2);
  let textId = createTextNode(text, size[0], { _scale: textScale, _textAlign: Align.C });
  moveNode(textId, [Math.floor(size[0] / 2), Math.floor(size[1] / 2) - (8 + (10 * (lines - 1)))]);
  addChildNode(nodeId, textId);
  node_button_text_id[nodeId] = textId;
  return nodeId;
};

let renderButtonNode = (nodeId: number, now: number, delta: number): void =>
{
  let size = node_size[nodeId];
  let colour = GREY_666;
  if (inputContext._active === nodeId)
  {
    colour = GREY_333;
  }
  else if (inputContext._hot === nodeId)
  {
    colour = GREY_999;
  }
  pushQuad(0, 0, size[0], size[1], colour);
};