import { GREY_111, GREY_333 } from "../colour";
import { createNode, node_position, node_render_function, node_size } from "../scene-node";

import { pushQuad } from "../draw";

export let createWindowNode = (w: number, h: number, x: number, y: number): number => 
{
  let nodeId = createNode();
  node_render_function[nodeId] = renderWindow;
  node_size[nodeId] = [w, h];
  node_position[nodeId] = [x, y];
  return nodeId;
};

let renderWindow = (nodeId: number, now: number, delta: number) =>
{
  let size = node_size[nodeId];
  pushQuad(-4, -4, size[0] + 8, size[1] + 8, GREY_333);
  pushQuad(-2, -2, size[0] + 4, size[1] + 4, GREY_111);
};