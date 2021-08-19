import { Texture, getTexture } from "../texture";
import { createNode, node_render_function, node_size } from "../scene-node";
import { gl_pushTextureQuad, gl_restore, gl_save, gl_scale, gl_translate } from "../gl";

type SpriteParams = {
  _scale?: number,
  _colour?: number,
  _hFlip?: boolean,
  _vFlip?: boolean;
};

type Frame = [Texture, number];
let node_sprite: Frame[][] = [];
let node_sprite_duration: number[] = [];
let node_sprite_scale: number[] = [];
let node_sprite_flip: [boolean, boolean][] = [];
let node_sprite_colour: number[] = [];

let node_sprite_timestamp: number[] = [];
let node_sprite_loop: boolean[] = [];

export let createSpriteNode = (textureName: string, params: SpriteParams = {}): number =>
{
  let nodeId = createNode();
  node_render_function[nodeId] = renderSpriteNode;
  setSpriteNode(nodeId, textureName, params);
  return nodeId;
};

export let setSpriteNode = (nodeId: number, textureName: string, params: SpriteParams = {}): void =>
{
  let scale = params._scale || 1;
  let hFlip = params._hFlip || false;
  let vFlip = params._vFlip || false;
  let colour = params._colour || 0xFFFFFFFF;
  let texture = getTexture(textureName);

  node_sprite[nodeId] = [[texture, 0]];
  node_size[nodeId] = [texture._w * scale, texture._h * scale];
  node_sprite_scale[nodeId] = scale;
  node_sprite_flip[nodeId] = [hFlip, vFlip];
  node_sprite_colour[nodeId] = colour;

  // TODO(dbrad): We might not need animation code, refacter and remove it all later if that is the case.
  node_sprite_timestamp[nodeId] = 0;
  node_sprite_loop[nodeId] = false;
};

// export let createAnimatedSpriteNode = (frames: [string, number][], params: SpriteParams = {}): number =>
// {
//   let scale = params._scale || 1;
//   let hFlip = params._hFlip || false;
//   let vFlip = params._vFlip || false;
//   let colour = params._colour || 0xFFFFFFFF;

//   let nodeId = createNode();
//   node_render_function[nodeId] = renderSpriteNode;

//   let duration = 0;
//   node_sprite[nodeId] = [];

//   for (let frame of frames)
//   {
//     let texture = getTexture(frame[0]);
//     duration += frame[1];
//     node_sprite[nodeId].push([texture, frame[1]]);
//     node_size[nodeId] = [texture._w * scale, texture._h * scale];
//   }
//   node_sprite_duration[nodeId] = duration;
//   node_sprite_scale[nodeId] = scale;
//   node_sprite_flip[nodeId] = [hFlip, vFlip];
//   node_sprite_colour[nodeId] = colour;
//   node_sprite_timestamp[nodeId] = 0;
//   node_sprite_loop[nodeId] = true;

//   return nodeId;
// }

let renderSpriteNode = (nodeId: number, now: number, delta: number): void =>
{
  let duration = node_sprite_duration[nodeId];
  let frames = node_sprite[nodeId];
  let scale = node_sprite_scale[nodeId];
  let colour = node_sprite_colour[nodeId];

  if (duration === 0)
  {
    let t = frames[0][0];
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
    for (let frame of frames)
    {
      totalDuration += frame[1];
      if (node_sprite_timestamp[nodeId] <= totalDuration)
      {
        currentFrame = frame;
        break;
      }
    }
    let t = currentFrame[0];
    gl_save();
    if (node_sprite_flip[nodeId][0])
    {
      gl_translate(t._w * scale, 0);
      gl_scale(-1, 1);
    }
    if (node_sprite_flip[nodeId][1])
    {
      gl_translate(0, t._h * scale);
      gl_scale(1, -1);
    }
    gl_pushTextureQuad(t._atlas, 0, 0, t._w * scale, t._h * scale, t._u0, t._v0, t._u1, t._v1, colour);
    gl_restore();
  }
};