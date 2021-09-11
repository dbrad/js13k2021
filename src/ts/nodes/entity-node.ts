import { ENGINES, gameState } from "../game-state";
import { SHIELD_BLUE, WHITE, colourToHex } from "../colour";
import { SPRITE_ANOMALY, SPRITE_ASTEROID, SPRITE_GAS_PLANET, SPRITE_PIRATE_SHIP, SPRITE_PLAYER_SHIP, SPRITE_ROCK_PLANET, SPRITE_SHIELD, SPRITE_SPACE_BEAST, SPRITE_STAR, SPRITE_STATION } from "../texture";
import { createNode, moveNode, node_enabled, node_position, node_render_function } from "../scene-node";
import { createRangeIndicator, updateRangeIndicator } from "./range-indicator";
import { createSpriteNode, updateSpriteNode } from "./sprite-node";

import { math } from "../math";
import { pushQuad } from "../draw";
import { rand } from "../random";

let node_entity_tag: number[] = [];
let node_entity_id: number[] = [];
let node_entity_sprite: number[] = [];

let node_entity_range: number[] = [];

let node_entity_shield_sprite: number[] = [];
let node_entity_particles: [number, number, number][][] = [];
let node_entity_enable_animations: boolean[] = [];

// current value, direction value (1 vs -1)
let node_entity_yOffset: [number, number][] = [];

// curent timer value, timer duration value
let node_entity_offsetTimer: [number, number][] = [];

export const TAG_ENTITY_NONE = -1;
export const TAG_ENTITY_STATION = 0;
export const TAG_ENTITY_STAR = 1;
export const TAG_ENTITY_GAS_PLANET = 2;
export const TAG_ENTITY_ROCK_PLANET = 3;
export const TAG_ENTITY_PIRATE_SHIP = 4;
export const TAG_ENTITY_SPACE_BEAST = 5;
export const TAG_ENTITY_ASTEROID = 6;
export const TAG_ENTITY_ANOMALY = 7;
export const TAG_ENTITY_PLAYER_SHIP = 8;


export let createEntityNode = (parentId: number, x: number, y: number, tag: number = TAG_ENTITY_NONE, enableAnimations: boolean = true): number =>
{
  let nodeId = createNode(parentId);
  node_render_function[nodeId] = renderEntity;

  moveNode(nodeId, x, y);

  node_entity_id[nodeId] = -2;

  let sprite = createSpriteNode(nodeId, '#', 0, 0);
  node_entity_sprite[nodeId] = sprite;

  node_entity_range[nodeId] = createRangeIndicator(nodeId, 0, 0, 0x990000FF, 0);

  node_entity_shield_sprite[nodeId] = createSpriteNode(sprite, SPRITE_SHIELD, -16, -16, { _scale: 4, _colour: SHIELD_BLUE });

  node_entity_particles[nodeId] = [];
  for (let i = 0; i < 50; i++)
  {
    node_entity_particles[nodeId].push([rand(0, 20), 10, rand(1, 3)]);
  }

  node_entity_enable_animations[nodeId] = enableAnimations;

  node_entity_yOffset[nodeId] = [0, 1];
  node_entity_offsetTimer[nodeId] = [0, 250];

  updateEntityNode(nodeId, tag);

  return nodeId;
};

export type EncounterParams = {
  _scale?: number,
  _colour?: number,
  _enableAnimations?: boolean,
  _range?: number;
};
let textureMap = [SPRITE_STATION, SPRITE_STAR, SPRITE_GAS_PLANET, SPRITE_ROCK_PLANET, SPRITE_PIRATE_SHIP, SPRITE_SPACE_BEAST, SPRITE_ASTEROID, SPRITE_ANOMALY, SPRITE_PLAYER_SHIP];
export let updateEntityNode = (nodeId: number, tag: number, entityId: number = -1, extraParams: EncounterParams = {}): void =>
{
  if (entityId === node_entity_id[nodeId]) return;
  node_entity_id[nodeId] = entityId;

  let textureName: string = "#";
  let colour = extraParams._colour || WHITE;
  let scale = extraParams._scale || 2;
  let sprite = node_entity_sprite[nodeId];
  let range = extraParams._range || 0;

  node_enabled[node_entity_range[nodeId]] = range > 0;
  node_entity_enable_animations[nodeId] = extraParams._enableAnimations || node_entity_enable_animations[nodeId];

  node_enabled[sprite] = true;
  moveNode(sprite, 0, 0);

  if (tag >= 0)
  {
    textureName = textureMap[tag];
  }
  else
  {
    node_enabled[sprite] = false;
  }

  updateSpriteNode(sprite, textureName, { _scale: scale, _colour: colour });

  if (range > 0)
  {
    updateRangeIndicator(node_entity_range[nodeId], range);
    moveNode(node_entity_range[nodeId], scale * 8, -60 + scale * 8);
  }
  node_entity_tag[nodeId] = tag;
};

let renderEntity = (nodeId: number, now: number, delta: number): void =>
{
  let tag = node_entity_tag[nodeId];
  let offset = node_entity_yOffset[nodeId];
  let enableAnimations = node_entity_enable_animations[nodeId];
  let isPlayerShip = tag === TAG_ENTITY_PLAYER_SHIP;
  let isPirateShip = tag === TAG_ENTITY_PIRATE_SHIP;
  let particleDirection = isPlayerShip ? 1 : -1;

  if (enableAnimations
    && (isPlayerShip || isPirateShip || tag === TAG_ENTITY_SPACE_BEAST))
  {
    node_entity_offsetTimer[nodeId][0] += delta;
    if (node_entity_offsetTimer[nodeId][0] > node_entity_offsetTimer[nodeId][1])
    {
      node_entity_offsetTimer[nodeId][0] = 0;
      node_entity_offsetTimer[nodeId][1] = rand(150, 500);
      if (offset[0] > 2 || offset[0] < -2)
      {
        offset[1] *= -1;
      }
      offset[0] += offset[1];
      node_position[node_entity_sprite[nodeId]][1] = offset[0];
    }
  }

  // Hide shield for everything but player ship
  node_enabled[node_entity_shield_sprite[nodeId]] = isPlayerShip && gameState._currentShield > 0;

  // Only render particles for ships
  if (enableAnimations
    && ((isPlayerShip && gameState._systemLevels[ENGINES][0] > 0)
      || isPirateShip))
  {
    let particles = node_entity_particles[nodeId];
    let colour = 0;
    let offsetX = particleDirection === -1 ? 32 : 0;
    for (let particle of particles)
    {
      particle[0] += particle[2];
      if (particle[0] > 21)
      {
        particle[0] = 0;
        particle[1] = 10;
      }
      particle[1] += rand(-1, 1);
      if (particle[1] > 14 || particle[1] < 6)
      {
        particle[1] = 8;
      }
      colour = colourToHex(math.max(0, 255 - math.ceil(255 * (particle[0] / 20))), rand(125, 255), 100, 100);
      pushQuad(offsetX + particleDirection * -particle[0], offset[0] + particle[1] - 1, 2, 2, colour);
    }
    if (isPlayerShip && gameState._systemLevels[ENGINES][0] === 0) return;
  }
};