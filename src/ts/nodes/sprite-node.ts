import { Texture, getTexture } from "../texture";
import { createNode, node_render_function, node_size } from "../scene-node";
import { gl_pushTextureQuad, gl_restore, gl_save, gl_scale, gl_translate } from "../gl";

import { WHITE } from "../colour";

type SpriteParams = {
  _scale?: number,
  _colour?: number,
  _hFlip?: boolean,
  _vFlip?: boolean;
};

let node_sprite: Texture[] = [];
let node_sprite_scale: number[] = [];
let node_sprite_flip: [boolean, boolean][] = [];
let node_sprite_colour: number[] = [];

export let createSpriteNode = (textureName: string, params: SpriteParams = {}): number =>
{
  let nodeId = createNode();
  node_render_function[nodeId] = renderSpriteNode;
  updateSpriteNode(nodeId, textureName, params);
  return nodeId;
};

export let updateSpriteNode = (nodeId: number, textureName: string, params: SpriteParams = {}): void =>
{
  let scale = params._scale || 1;
  let hFlip = params._hFlip || false;
  let vFlip = params._vFlip || false;
  let colour = params._colour || WHITE;
  let texture = getTexture(textureName);

  node_sprite[nodeId] = texture;
  node_size[nodeId] = [texture._w * scale, texture._h * scale];
  node_sprite_scale[nodeId] = scale;
  node_sprite_flip[nodeId] = [hFlip, vFlip];
  node_sprite_colour[nodeId] = colour;
};

let renderSpriteNode = (nodeId: number, now: number, delta: number): void =>
{
  let texture = node_sprite[nodeId];
  let scale = node_sprite_scale[nodeId];
  let colour = node_sprite_colour[nodeId];

  gl_save();
  if (node_sprite_flip[nodeId][0])
  {
    gl_translate(texture._w * scale, 0);
    gl_scale(-1, 1);
  }
  if (node_sprite_flip[nodeId][1])
  {
    gl_translate(0, texture._h * scale);
    gl_scale(1, -1);
  }
  gl_pushTextureQuad(texture._atlas, 0, 0, texture._w * scale, texture._h * scale, texture._u0, texture._v0, texture._u1, texture._v1, colour);
  gl_restore();
};