import { Align_Right, createTextNode, updateTextNode } from "./text-node";
import { addChildNode, createNode, moveNode, node_render_function } from "../scene-node";

import { GREY_6333 } from "../colour";
import { pushQuad } from "../draw";
import { txt_empty_string } from "../text";

let node_currency_display: number[] = [];

export let createCurrencyNode = (label: string, postfix: string): number =>
{
  let nodeId = createNode();
  node_render_function[nodeId] = renderCurrency;

  let labelNode = createTextNode(label);
  moveNode(labelNode, 2, 3);
  addChildNode(nodeId, labelNode);

  let postfixNode = createTextNode(postfix, { _textAlign: Align_Right });
  moveNode(postfixNode, 114, 17);
  addChildNode(nodeId, postfixNode);

  let display = createTextNode(txt_empty_string, { _textAlign: Align_Right });
  moveNode(display, 90, 17);
  addChildNode(nodeId, display);
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