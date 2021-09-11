import { GREY_111, GREY_333, GREY_666 } from "../colour";
import { createNode, moveNode, node_render_function } from "../scene-node";

import { pushQuad } from "../draw";

let node_bar_value: number[] = [];
let node_bar_colour: number[] = [];
let node_bar_width: number[] = [];
export let createProgressBarNode = (parentId: number, x: number, y: number, colour: number, width: number): number =>
{
  let nodeId = createNode(parentId);
  node_render_function[nodeId] = renderProgressBar;
  moveNode(nodeId, x, y);
  node_bar_value[nodeId] = 0;
  node_bar_colour[nodeId] = colour;
  node_bar_width[nodeId] = width;
  return nodeId;
};

export let updateProgressBarNode = (nodeId: number, value: number): void =>
{
  node_bar_value[nodeId] = value;
};

let renderProgressBar = (nodeId: number, now: number, delta: number): void =>
{
  let width = node_bar_width[nodeId];
  let length = (node_bar_value[nodeId] / 100) * width;
  pushQuad(0, 0, width + 4, 7, GREY_666);
  pushQuad(1, 1, width + 2, 5, GREY_333);
  pushQuad(2, 2, width, 3, GREY_111);
  pushQuad(2, 2, length, 3, node_bar_colour[nodeId]);
};