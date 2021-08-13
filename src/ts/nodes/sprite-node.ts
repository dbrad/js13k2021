import { Texture, getTexture } from "../texture";
import { createNode, node_render_function, node_size } from "../scene-node";
import { gl_pushTextureQuad, gl_restore, gl_save, gl_scale, gl_translate } from "../gl";

type Frame = [Texture, number];
const node_sprite: Frame[][] = [];
const node_sprite_duration: number[] = [];
const node_sprite_scale: number[] = [];
const node_sprite_flip: boolean[] = [];
const node_sprite_colour: number[] = [];
const node_sprite_timestamp: number[] = [];
const node_sprite_loop: boolean[] = [];
export function createSpriteNode(textureName: string, scale: number = 1, flip: boolean = false, colour: number = 0xFFFFFFFF): number
{
  const nodeId = createNode();
  node_render_function[nodeId] = renderSpriteNode;

  const texture = getTexture(textureName);
  node_sprite[nodeId] = [[texture, 0]];
  node_size[nodeId] = [texture._w * scale, texture._h * scale];
  node_sprite_scale[nodeId] = scale;
  node_sprite_flip[nodeId] = flip;
  node_sprite_colour[nodeId] = colour;
  node_sprite_timestamp[nodeId] = 0;
  node_sprite_loop[nodeId] = false;

  return nodeId;
}

export function createAnimatedSpriteNode(frames: [string, number][], scale: number = 1, flip: boolean = false, colour: number = 0xFFFFFFFF): number
{
  const nodeId = createNode();
  node_render_function[nodeId] = renderSpriteNode;

  let duration = 0;
  node_sprite[nodeId] = [];

  for (const frame of frames)
  {
    const texture = getTexture(frame[0]);
    duration += frame[1];
    node_sprite[nodeId].push([texture, frame[1]]);
    node_size[nodeId] = [texture._w * scale, texture._h * scale];
  }
  node_sprite_duration[nodeId] = duration;
  node_sprite_scale[nodeId] = scale;
  node_sprite_flip[nodeId] = flip;
  node_sprite_colour[nodeId] = colour;
  node_sprite_timestamp[nodeId] = 0;
  node_sprite_loop[nodeId] = true;

  return nodeId;
}

function renderSpriteNode(nodeId: number, now: number, delta: number): void
{
  const duration = node_sprite_duration[nodeId];
  const frames = node_sprite[nodeId];
  const scale = node_sprite_scale[nodeId];
  const colour = node_sprite_colour[nodeId];

  if (duration === 0)
  {
    const t = frames[0][0];
    gl_save();
    if (node_sprite_flip[nodeId])
    {
      gl_translate(t._w * scale, 0);
      gl_scale(-1, 1);
    }
    gl_pushTextureQuad(t._atlas, 0, 0, t._w * scale, t._h * scale, t._u0, t._v0, t._u1, t._v1, colour);
    gl_restore();
  }
  else
  {
    node_sprite_timestamp[nodeId] += delta;
    if (node_sprite_timestamp[nodeId] > duration && node_sprite_loop[nodeId])
    {
      node_sprite_timestamp[nodeId] = 0;
    }
    else if (node_sprite_timestamp[nodeId] > duration && !node_sprite_loop[nodeId])
    {
      node_sprite_timestamp[nodeId] -= delta;
    }
    let currentFrame = frames[0];
    let totalDuration: number = 0;
    for (const frame of frames)
    {
      totalDuration += frame[1];
      if (node_sprite_timestamp[nodeId] <= totalDuration)
      {
        currentFrame = frame;
        break;
      }
    }
    const t = currentFrame[0];
    gl_save();
    if (node_sprite_flip[nodeId])
    {
      gl_translate(t._w * scale, 0);
      gl_scale(-1, 1);
    }
    gl_pushTextureQuad(t._atlas, 0, 0, t._w * scale, t._h * scale, t._u0, t._v0, t._u1, t._v1, colour);
    gl_restore();
  }
}