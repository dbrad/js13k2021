import { createNode, moveNode, nodeSize, node_render_function, node_size } from "../scene-node";

import { pushQuad } from "../draw";

export let createWindowNode = (w: number, h: number, x: number, y: number): number => 
{
  let nodeId = createNode();
  node_render_function[nodeId] = renderWindow;
  nodeSize(nodeId, w, h);
  moveNode(nodeId, x, y);
  return nodeId;
};

let renderWindow = (nodeId: number, now: number, delta: number) =>
{
  let [w, h] = node_size[nodeId];
  pushQuad(-4, -4, w + 8, h + 8, 0xCC222222);
};