import { gl_restore, gl_save, gl_translate } from "./gl";

import { inputContext } from "./input";
import { v2 } from "./v2";

let nextNodeId = 0;
export let node_render_function: ((nodeId: number, now: number, delta: number) => void)[] = [];
export let node_position: v2[] = [];
export let node_size: v2[] = [];
export let node_enabled: boolean[] = [];
export let node_interactive: boolean[] = [];
let node_parent: number[] = [];
let node_children: number[][] = [[]];
export let node_tag: number[] = [];

//#region TAGS
export let TAG_LOWER_POWER = 0;
export let TAG_RAISE_POWER = 1;
//#endregion TAGS

export let createNode = (parentId: number = 0): number =>
{
  let nodeId = ++nextNodeId;

  moveNode(nodeId, 0, 0);
  nodeSize(nodeId, 1, 1);

  node_enabled[nodeId] = true;
  node_interactive[nodeId] = true;

  addChildNode(parentId, nodeId);
  node_children[nodeId] = [];

  node_tag[nodeId] = 0;

  return nodeId;
};

let addChildNode = (parentNodeId: number, childNodeId: number): void =>
{
  node_parent[childNodeId] = parentNodeId;
  node_children[parentNodeId].push(childNodeId);
};

export let moveNode = (nodeId: number, x: number, y: number): void =>
{
  node_position[nodeId] = [x, y];
};


export let nodeSize = (nodeId: number, w: number, h: number): void =>
{
  node_size[nodeId] = [w, h];
};

export let nodeInput = (nodeId: number, cursorPosition: number[] = inputContext._cursor): void =>
{
  if (!node_enabled[nodeId] || !node_interactive[nodeId]) return;
  let [cx, cy] = cursorPosition;
  let [px, py] = node_position[nodeId];
  let [w, h] = node_size[nodeId];
  let relativePosition: v2 = [cx - px, cy - py];

  if (cx >= px
    && cy >= py
    && cx < px + w
    && cy < py + h)
  {
    inputContext._hot = nodeId;
    if (inputContext._active === nodeId)
    {
      if (!inputContext._mouseDown)
      {
        if (inputContext._hot === nodeId)
        {
          inputContext._fire = nodeId;
        }
        inputContext._active = -1;
      }
    }
    else if (inputContext._hot === nodeId)
    {
      if (inputContext._mouseDown)
      {
        inputContext._active = nodeId;
      }
    }

    let children = node_children[nodeId];
    for (let childId of children)
    {
      nodeInput(childId, relativePosition);
    }
  }
};

export let renderNode = (nodeId: number, now: number, delta: number): void =>
{
  if (node_enabled[nodeId])
  {
    let [x, y] = node_position[nodeId];
    gl_save();
    gl_translate(x, y);

    if (node_render_function[nodeId])
    {
      node_render_function[nodeId](nodeId, now, delta);
    }

    for (let childId of node_children[nodeId])
    {
      renderNode(childId, now, delta);
    }
    gl_restore();
  }
};