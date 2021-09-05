import { addChildNode, createNode, moveNode } from "../scene-node";

import { SPRITE_RANGE_BRACKET } from "../texture";
import { createSpriteNode } from "./sprite-node";

const node_range_sprites: number[][] = [];
let indicatorSize = 16;

export let createRangeIndicator = (colour: number, windowRadius: number): number =>
{
  let nodeId = createNode();

  let opt = { _colour: colour };
  node_range_sprites[nodeId] = [];

  node_range_sprites[nodeId][0] = createSpriteNode(SPRITE_RANGE_BRACKET, opt);
  moveNode(node_range_sprites[nodeId][0], -windowRadius, 0);
  addChildNode(nodeId, node_range_sprites[nodeId][0]);

  node_range_sprites[nodeId][1] = createSpriteNode(SPRITE_RANGE_BRACKET, { ...opt, _hFlip: true });
  moveNode(node_range_sprites[nodeId][1], windowRadius - indicatorSize, 0);
  addChildNode(nodeId, node_range_sprites[nodeId][1]);

  node_range_sprites[nodeId][2] = createSpriteNode(SPRITE_RANGE_BRACKET, { ...opt, _vFlip: true });
  moveNode(node_range_sprites[nodeId][2], -windowRadius, 104);
  addChildNode(nodeId, node_range_sprites[nodeId][2]);

  node_range_sprites[nodeId][3] = createSpriteNode(SPRITE_RANGE_BRACKET, { ...opt, _hFlip: true, _vFlip: true });
  moveNode(node_range_sprites[nodeId][3], windowRadius - indicatorSize, 104);
  addChildNode(nodeId, node_range_sprites[nodeId][3]);

  return nodeId;
};

export let updateRangeIndicator = (nodeId: number, windowRadius: number): void =>
{
  moveNode(node_range_sprites[nodeId][0], -windowRadius, 0);
  moveNode(node_range_sprites[nodeId][1], windowRadius - indicatorSize, 0);
  moveNode(node_range_sprites[nodeId][2], -windowRadius, 104);
  moveNode(node_range_sprites[nodeId][3], windowRadius - indicatorSize, 104);
};