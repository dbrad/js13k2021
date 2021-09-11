import { createNode, moveNode } from "../scene-node";

import { SPRITE_RANGE_BRACKET } from "../texture";
import { createSpriteNode } from "./sprite-node";

const node_range_sprites: number[][] = [];
let indicatorSize = 16;

export let createRangeIndicator = (parentId: number, x: number, y: number, colour: number, windowRadius: number): number =>
{
  let nodeId = createNode(parentId);

  moveNode(nodeId, x, y);

  let opt = { _colour: colour };
  node_range_sprites[nodeId] = [];

  node_range_sprites[nodeId][0] = createSpriteNode(nodeId, SPRITE_RANGE_BRACKET, -windowRadius, 0, opt);

  node_range_sprites[nodeId][1] = createSpriteNode(nodeId, SPRITE_RANGE_BRACKET, windowRadius - indicatorSize, 0, { ...opt, _hFlip: true });

  node_range_sprites[nodeId][2] = createSpriteNode(nodeId, SPRITE_RANGE_BRACKET, -windowRadius, 104, { ...opt, _vFlip: true });

  node_range_sprites[nodeId][3] = createSpriteNode(nodeId, SPRITE_RANGE_BRACKET, windowRadius - indicatorSize, 104, { ...opt, _hFlip: true, _vFlip: true });

  return nodeId;
};

export let updateRangeIndicator = (nodeId: number, windowRadius: number): void =>
{
  moveNode(node_range_sprites[nodeId][0], -windowRadius, 0);
  moveNode(node_range_sprites[nodeId][1], windowRadius - indicatorSize, 0);
  moveNode(node_range_sprites[nodeId][2], -windowRadius, 104);
  moveNode(node_range_sprites[nodeId][3], windowRadius - indicatorSize, 104);
};