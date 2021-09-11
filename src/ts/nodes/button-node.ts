import { Align_Center, createTextNode, parseText, updateTextNode } from "./text-node";
import { GREY_222, GREY_333, GREY_666, GREY_999, WHITE } from "../colour";
import { buttonSound, zzfxP } from "../zzfx";
import { createNode, moveNode, nodeSize, node_interactive, node_render_function, node_size } from "../scene-node";

import { inputContext } from "../input";
import { math } from "../math";
import { pushQuad } from "../draw";

let node_button_text_id: number[] = [];
export let createButtonNode = (parentId: number, text: string, w: number, h: number, x: number = 0, y: number = 0): number =>
{
  let nodeId = createNode(parentId);
  node_render_function[nodeId] = renderButtonNode;
  nodeSize(nodeId, w, h);
  moveNode(nodeId, x, y);
  let lines = parseText(text, w, 2);
  let textId = createTextNode(nodeId, text, math.floor(w / 2), math.floor(h / 2) - (8 + (10 * (lines - 1))), { _width: w, _scale: 2, _textAlign: Align_Center });
  node_button_text_id[nodeId] = textId;
  return nodeId;
};

export let updateButtonNode = (nodeId: number, text: string): void =>
{
  let [w, h] = node_size[nodeId];
  let textId = node_button_text_id[nodeId];

  let lines = parseText(text, w, 2);
  moveNode(textId, math.floor(w / 2), math.floor(h / 2) - (8 + (10 * (lines - 1))));
  updateTextNode(textId, text);
};

let renderButtonNode = (nodeId: number, now: number, delta: number): void =>
{
  let [w, h] = node_size[nodeId];
  let colour = GREY_666;
  updateTextNode(node_button_text_id[nodeId], null, { _colour: WHITE });
  if (!node_interactive[nodeId])
  {
    colour = GREY_222;
    updateTextNode(node_button_text_id[nodeId], null, { _colour: GREY_666 });
  }
  else if (inputContext._fire === nodeId)
  {
    zzfxP(buttonSound);
  }
  else if (inputContext._active === nodeId)
  {
    colour = GREY_333;
  }
  else if (inputContext._hot === nodeId)
  {
    colour = GREY_999;
  }
  pushQuad(0, 0, w, h, colour);
};