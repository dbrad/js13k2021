import { Align, createTextNode, updateTextNode } from "./text-node";
import { addChildNode, createNode, moveNode, node_render_function } from "../scene-node";

import { pushQuad } from "../draw";

let node_currency_label: number[] = [];
let node_currency_postfix: number[] = [];
let node_currency_pool: number[] = [];
let node_currency_value: number[] = [];
let node_currency_display: number[] = [];

export let createCurrencyNode = (label: string, postfix: string): number =>
{
  let nodeId = createNode();
  node_render_function[nodeId] = renderCurrency;

  let labelNode = createTextNode(label, label.length * 8);
  moveNode(labelNode, [2, 3]);
  addChildNode(nodeId, labelNode);
  node_currency_label[nodeId] = labelNode;

  let postfixNode = createTextNode(postfix, postfix.length * 8, { _textAlign: Align.R });
  moveNode(postfixNode, [114, 17]);
  addChildNode(nodeId, postfixNode);
  node_currency_postfix[nodeId] = postfixNode;

  node_currency_pool[nodeId] = 0;
  node_currency_value[nodeId] = 0;

  let display = createTextNode("", 11 * 8, { _textAlign: Align.R });
  moveNode(display, [90, 17]);
  addChildNode(nodeId, display);
  node_currency_display[nodeId] = display;

  return nodeId;
};

export let addToCurrencyNode = (nodeId: number, value: number): void =>
{
  node_currency_pool[nodeId] += value;
};


let renderCurrency = (nodeId: number, now: number, delta: number): void =>
{
  pushQuad(0, 0, 115, 28, 0x66333333);
  pushQuad(0, 14, 115, 14, 0x66333333);
  if (node_currency_pool[nodeId] > 10)
  {
    let amount = Math.floor(node_currency_pool[nodeId] * 0.25);
    node_currency_pool[nodeId] -= amount;
    node_currency_value[nodeId] += amount;
  }
  else if (node_currency_pool[nodeId] > 0)
  {
    node_currency_pool[nodeId]--;
    node_currency_value[nodeId]++;
  }
  updateTextNode(node_currency_display[nodeId], `${ node_currency_value[nodeId].toLocaleString("en-US") }`);
};