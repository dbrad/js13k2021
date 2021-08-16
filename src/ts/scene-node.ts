import { Interpolators, None, createInterpolationData } from "./interpolate";
import { gl_restore, gl_save, gl_translate } from "./gl";

import { inputContext } from "./input";
import { v2 } from "./v2";

let nextNodeId = 0;
export const node_render_function: ((nodeId: number, now: number, delta: number) => void)[] = [];
export const node_position: v2[] = [];
export const node_z_index: number[] = [];
export const node_size: v2[] = [];
export const node_enabled: boolean[] = [];
export const node_visible: boolean[] = [];
export const node_interactive: boolean[] = [];
export const node_parent: number[] = [];
export const node_children: number[][] = [];
export const node_tag: number[] = [];

//#region TAGS
export const TAG_LOWER_POWER = 1 << 0;
export const TAG_RAISE_POWER = 1 << 1;
//#endregion TAGS

export function createNode(): number
{
  const nodeId = ++nextNodeId;

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
}

export function addChildNode(nodeId: number, childNodeId: number, zIndex: number = 0): void
{
  // If the child node already has a parent, we want to clean that data up.
  const oldParentId = node_parent[childNodeId];
  if (oldParentId > 0)
  {
    let index = 0;
    for (const searchId of node_children[oldParentId])
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
}

export function calculateNodeSize(nodeId: number): v2
{
  let maxX = 0;
  let maxY = 0;
  for (const child of node_children[nodeId])
  {
    const size = node_size[child];
    const position = node_position[child];
    if (position[0] + size[0] > maxX) maxX = position[0] + size[0];
    if (position[1] + size[1] > maxY) maxY = position[1] + size[1];
  }
  return [maxX, maxY];
}

export function moveNode(nodeId: number, pos: v2, ease: number = None, duration: number = 0): Promise<void>
{
  // We haven't moved? Just return.
  if (node_position[nodeId][0] === pos[0] && node_position[nodeId][1] === pos[1])
  {
    return Promise.resolve();
  }

  const interpKey = `node-mv-${ nodeId }`;
  // Check if we've been given an easing function, a duration, and we don't currently have an interpolation ongoing.
  if (ease !== None && duration > 0)
  {
    if (Interpolators.has(interpKey)) return Promise.resolve();
    return new Promise((resolve, _) =>
    {
      // Setup a new interpolator, it will begin iterating on the next frame.
      Interpolators.set(interpKey, createInterpolationData(duration, node_position[nodeId], pos, ease, resolve));
    });
  }

  // No easing or duration? Let's just move right now!
  node_position[nodeId][0] = pos[0];
  node_position[nodeId][1] = pos[1];
  return Promise.resolve();
}

export function iterateNodeMovement(nodeId: number): void
{
  const interpKey = `node-mv-${ nodeId }`;
  if (Interpolators.has(interpKey))
  {
    const interp = Interpolators.get(interpKey);
    if (interp?._lastResult)
    {
      moveNode(nodeId, [interp._lastResult._values[0], interp._lastResult._values[1]]);
    }
  }

  const children = node_children[nodeId];
  for (const childId of children)
  {
    iterateNodeMovement(childId);
  }
}

export function nodeInput(nodeId: number, cursorPosition: number[] = inputContext._cursor): void
{
  if (!node_enabled[nodeId] || !node_interactive[nodeId]) return;
  const position = node_position[nodeId];
  const size = node_size[nodeId];
  const relativePosition = [cursorPosition[0] - position[0], cursorPosition[1] - position[1]];

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

    const children = node_children[nodeId];
    for (const childId of children)
    {
      nodeInput(childId, relativePosition);
    }
  }
}

export function renderNode(nodeId: number, now: number, delta: number): void
{
  if (node_enabled[nodeId] && node_visible[nodeId])
  {
    const position = node_position[nodeId];
    gl_save();
    gl_translate(position[0], position[1]);

    if (node_render_function[nodeId])
    {
      node_render_function[nodeId](nodeId, now, delta);
    }

    for (const childId of node_children[nodeId])
    {
      renderNode(childId, now, delta);
    }
    gl_restore();
  }
}