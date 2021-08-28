import { GREY_111, GREY_666, POWER_GREEN } from "../colour";
import { createNode, node_render_function } from "../scene-node";

import { pushQuad } from "../draw";

let node_bar_value: number[] = [];
export let createProgressBarNode = (): number =>
{
  let nodeId = createNode();
  node_render_function[nodeId] = renderProgressBar;
  node_bar_value[nodeId] = 0;
  return nodeId;
};

export let updateProgressBarNode = (nodeId: number, value: number): void =>
{
  node_bar_value[nodeId] = value;
};

let renderProgressBar = (nodeId: number, now: number, delta: number): void =>
{
  pushQuad(0, 0, 102, 5, GREY_666);
  pushQuad(1, 1, 100, 3, GREY_111);
  pushQuad(1, 1, node_bar_value[nodeId], 3, POWER_GREEN);
};