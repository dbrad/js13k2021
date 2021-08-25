import { gl_restore, gl_save, gl_translate } from "./gl";

import { inputContext } from "./input";
import { v2 } from "./v2";

let nextNodeId = 0;
export let node_render_function: ((nodeId: number, now: number, delta: number) => void)[] = [];
export let node_position: v2[] = [];
export let node_z_index: number[] = [];
export let node_size: v2[] = [];
export let node_enabled: boolean[] = [];
export let node_visible: boolean[] = [];
export let node_interactive: boolean[] = [];
export let node_parent: number[] = [];
export let node_children: number[][] = [];
export let node_tag: number[] = [];

//#region TAGS
export let TAG_LOWER_POWER = 0;
export let TAG_RAISE_POWER = 1;
//#endregion TAGS

export let createNode = (): number =>
{
  let nodeId = ++nextNodeId;

  node_position[nodeId] = [0, 0];
  node_z_index[nodeId] = 0;
  node_size[nodeId] = [1, 1];

  node_enabled[nodeId] = true;
  node_visible[nodeId] = true;
  node_interactive[nodeId] = true;

  node_parent[nodeId] = 0;
  node_children[nodeId] = [];

  node_tag[nodeId] = 0;

  return nodeId;
};

export let addChildNode = (nodeId: number, childNodeId: number, zIndex: number = 0): void =>
{
  // If the child node already has a parent, we want to clean that data up.
  let oldParentId = node_parent[childNodeId];
  if (oldParentId > 0)
  {
    let index = 0;
    for (let searchId of node_children[oldParentId])
    {
      if (searchId === childNodeId)
      {
        node_children[oldParentId] = node_children[oldParentId].splice(index, 1);
        break;
      }
      index++;
    }
  }

  node_parent[childNodeId] = nodeId;
  node_z_index[childNodeId] = zIndex;

  node_children[nodeId].push(childNodeId);
  node_children[nodeId].sort((nodeIdA: number, nodeIdB: number) =>
  {
    return node_z_index[nodeIdA] - node_z_index[nodeIdB];
  });
};

export let moveNode = (nodeId: number, pos: v2): void =>
{
  node_position[nodeId][0] = pos[0];
  node_position[nodeId][1] = pos[1];
};

export let nodeInput = (nodeId: number, cursorPosition: number[] = inputContext._cursor): void =>
{
  if (!node_enabled[nodeId] || !node_interactive[nodeId]) return;
  let position = node_position[nodeId];
  let size = node_size[nodeId];
  let relativePosition = [cursorPosition[0] - position[0], cursorPosition[1] - position[1]];

  if (cursorPosition[0] >= position[0]
    && cursorPosition[1] >= position[1]
    && cursorPosition[0] < position[0] + size[0]
    && cursorPosition[1] < position[1] + size[1])
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
  if (node_enabled[nodeId] && node_visible[nodeId])
  {
    let position = node_position[nodeId];
    gl_save();
    gl_translate(position[0], position[1]);

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