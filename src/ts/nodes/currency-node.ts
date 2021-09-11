import { Align_Right, createTextNode, updateTextNode } from "./text-node";
import { createNode, moveNode, node_render_function } from "../scene-node";

import { GREY_6333 } from "../colour";
import { pushQuad } from "../draw";
import { txt_empty_string } from "../text";

let node_currency_display: number[] = [];

export let createCurrencyNode = (parentId: number, x: number, y: number, label: string, postfix: string): number =>
{
  let nodeId = createNode(parentId);
  node_render_function[nodeId] = renderCurrency;

  moveNode(nodeId, x, y);

  createTextNode(nodeId, label, 2, 3);

  createTextNode(nodeId, postfix, 114, 17, { _textAlign: Align_Right });

  let display = createTextNode(nodeId, txt_empty_string, 90, 17, { _textAlign: Align_Right });
  node_currency_display[nodeId] = display;

  return nodeId;
};

export let updateCurrencyNode = (nodeId: number, value: number): void =>
{
  updateTextNode(node_currency_display[nodeId], `${ value.toLocaleString("en-US") }`);
};


let renderCurrency = (nodeId: number, now: number, delta: number): void =>
{
  pushQuad(0, 0, 115, 28, GREY_6333);
  pushQuad(0, 14, 115, 14, GREY_6333);
};