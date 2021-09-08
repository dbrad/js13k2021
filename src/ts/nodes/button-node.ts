import { Align_Center, createTextNode, parseText, updateTextNode } from "./text-node";
import { GREY_222, GREY_333, GREY_666, GREY_999, WHITE } from "../colour";
import { addChildNode, createNode, moveNode, node_interactive, node_render_function, node_size } from "../scene-node";
import { buttonSound, zzfxP } from "../zzfx";

import { inputContext } from "../input";
import { math } from "../math";
import { pushQuad } from "../draw";
import { v2 } from "../v2";

export let node_button_text_id: number[] = [];
export let createButtonNode = (text: string, size: v2, textScale: number = 2): number =>
{
  let nodeId = createNode();
  node_render_function[nodeId] = renderButtonNode;
  node_size[nodeId] = size;
  let lines = parseText(text, size[0], 2);
  let textId = createTextNode(text, { _width: size[0], _scale: textScale, _textAlign: Align_Center });
  moveNode(textId, math.floor(size[0] / 2), math.floor(size[1] / 2) - (8 + (10 * (lines - 1))));
  addChildNode(nodeId, textId);
  node_button_text_id[nodeId] = textId;
  return nodeId;
};

export let updateButtonNode = (nodeId: number, text: string): void =>
{
  let size = node_size[nodeId];
  let textId = node_button_text_id[nodeId];

  let lines = parseText(text, size[0], 2);
  moveNode(textId, math.floor(size[0] / 2), math.floor(size[1] / 2) - (8 + (10 * (lines - 1))));
  updateTextNode(textId, text);
};

let renderButtonNode = (nodeId: number, now: number, delta: number): void =>
{
  let size = node_size[nodeId];
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
  pushQuad(0, 0, size[0], size[1], colour);
};