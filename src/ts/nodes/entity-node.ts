import { SHIELD_BLUE, SPACE_BEAST_PURPLE, WHITE, colourToHex } from "../colour";
import { addChildNode, createNode, moveNode, node_position, node_render_function, node_visible } from "../scene-node";
import { createSpriteNode, setSpriteNode } from "./sprite-node";

import { gameState } from "../game-state";
import { pushQuad } from "../draw";
import { rand } from "../random";

let node_entity_tag: number[] = [];
let node_entity_spriteId: number[] = [];

let node_entity_shield_sprite: number[] = [];
let node_entity_particles: [number, number, number][][] = [];

// current value, direction value (1 vs -1)
let node_entity_yOffset: [number, number][] = [];

// curent timer value, timerduration value
let node_entity_offsetTimer: [number, number][] = [];


export let TAG_ENTITY_NONE = -1;
export let TAG_ENTITY_STATION = 0;
export let TAG_ENTITY_STAR = 1;
export let TAG_ENTITY_GAS_PLANET = 2;
export let TAG_ENTITY_ROCK_PLANET = 3;
export let TAG_ENTITY_PIRATE_SHIP = 4;
export let TAG_ENTITY_SPACE_BEAST = 5;
export let TAG_ENTITY_ASTEROID = 6;
export let TAG_ENTITY_ANOMALY = 7;
export let TAG_ENTITY_PLAYER_SHIP = 9;


export let createEntityNode = (tag: number): number =>
{
  let nodeId = createNode();
  node_render_function[nodeId] = renderShipNode;

  let sprite = createSpriteNode('#');
  addChildNode(nodeId, sprite);
  node_entity_spriteId[nodeId] = sprite;

  let shieldSprite = createSpriteNode("shld", { _scale: 4, _colour: SHIELD_BLUE });
  moveNode(shieldSprite, [-16, -16]);
  addChildNode(sprite, shieldSprite);
  node_entity_shield_sprite[nodeId] = shieldSprite;

  node_entity_particles[nodeId] = [];
  for (let i = 0; i < 50; i++)
  {
    node_entity_particles[nodeId].push([0, 10, Math.random() * 5]);
  }

  setEntityNode(nodeId, tag);

  return nodeId;
};

export type EncounterParams = {
  _scale?: number,
  _colour?: number;
};
export let setEntityNode = (nodeId: number, tag: number, extraParams: EncounterParams = {}): void =>
{
  let textureName: string = "#";
  let colour = extraParams._colour || WHITE;
  let scale = extraParams._scale || 2;
  let sprite = node_entity_spriteId[nodeId];
  if (scale > 3)
  {
    moveNode(sprite, [0, -8 * scale]);
  }
  else
  {
    moveNode(sprite, [0, 0]);
  }
  node_visible[sprite] = true;

  if (tag === TAG_ENTITY_PLAYER_SHIP)
  {
    textureName = "p_ship";
    node_entity_yOffset[nodeId] = [0, 1];
    node_entity_offsetTimer[nodeId] = [0, 250];
  }
  else if (tag === TAG_ENTITY_ASTEROID)
  {
    textureName = "ast";
  }
  else if (tag === TAG_ENTITY_ANOMALY)
  {
    textureName = "ano";
    scale = 3;
  }
  else if (tag === TAG_ENTITY_SPACE_BEAST)
  {
    textureName = "bst";
    colour = SPACE_BEAST_PURPLE;
    scale = 3;
    node_entity_yOffset[nodeId] = [0, 1];
    node_entity_offsetTimer[nodeId] = [0, 250];
  }
  else if (tag === TAG_ENTITY_PIRATE_SHIP)
  {
    textureName = "prt";
    node_entity_yOffset[nodeId] = [0, 1];
    node_entity_offsetTimer[nodeId] = [0, 250];
  }
  else if (tag === TAG_ENTITY_ROCK_PLANET)
  {
    textureName = "rock";
  }
  else if (tag === TAG_ENTITY_GAS_PLANET)
  {
    textureName = "gas";
  }
  else if (tag === TAG_ENTITY_STAR)
  {
    textureName = "star";
  }
  else if (tag === TAG_ENTITY_STATION)
  {
    textureName = "stn";
    scale = 3;
  }
  else
  {
    node_visible[sprite] = false;
  }

  setSpriteNode(sprite, textureName, { _scale: scale, _colour: colour });
  node_entity_tag[nodeId] = tag;
};

let renderShipNode = (nodeId: number, now: number, delta: number): void =>
{
  let tag = node_entity_tag[nodeId];
  let offset = node_entity_yOffset[nodeId];
  let particleDirection = tag === TAG_ENTITY_PLAYER_SHIP ? 1 : -1;

  if (tag === TAG_ENTITY_PLAYER_SHIP || tag === TAG_ENTITY_PIRATE_SHIP || tag === TAG_ENTITY_SPACE_BEAST)
  {
    node_entity_offsetTimer[nodeId][0] += delta;
    if (node_entity_offsetTimer[nodeId][0] > node_entity_offsetTimer[nodeId][1])
    {
      node_entity_offsetTimer[nodeId][0] = 0;
      node_entity_offsetTimer[nodeId][1] = rand(150, 500);
      if (offset[0] > 2 || offset[0] < -2)
        offset[1] *= -1;
      offset[0] += offset[1];
      node_position[node_entity_spriteId[nodeId]][1] = offset[0];
    }
  }

  // Hide shield for everything but player ship for now.
  node_visible[node_entity_shield_sprite[nodeId]] = tag === TAG_ENTITY_PLAYER_SHIP && gameState._currentShield > 0;

  // Only render particles for ships
  if ((tag === TAG_ENTITY_PLAYER_SHIP) || (tag === TAG_ENTITY_PIRATE_SHIP))
  {
    let particles = node_entity_particles[nodeId];
    let colour = 0;
    let size = 0;
    for (let particle of particles)
    {
      particle[0] += particle[2] * 2;
      if (particle[0] > 20)
      {
        particle[0] = 0;
        particle[1] = 10;
      }
      particle[1] += rand(-1, 1);
      if (particle[1] > 14 || particle[1] < 6)
      {
        particle[1] = 8;
      }
      colour = colourToHex(255 - 225 * (particle[0] / 20), rand(175, 255), 100, 100);
      size = 2;
      let offsetX = particleDirection === -1 ? 32 : 0;
      pushQuad(offsetX + particleDirection * -particle[0], offset[0] + particle[1] - size / 2, size, size, colour);
    }
  }
};