import { addChildNode, createNode, moveNode, node_position, node_render_function, node_visible } from "../scene-node";
import { createSpriteNode, setSpriteNode } from "./sprite-node";

import { colourToHex } from "../colour";
import { gameState } from "../game-state";
import { pushQuad } from "../draw";
import { rand } from "../random";

const node_entity_tag: number[] = [];
const node_entity_spriteId: number[] = [];

const node_entity_shield_sprite: number[] = [];
const node_entity_particles: [number, number, number][][] = [];

// current value, direction value (1 vs -1)
const node_entity_yOffset: [number, number][] = [];

// curent timer value, timerduration value
const node_entity_offsetTimer: [number, number][] = [];


export const TAG_ENTITY_NONE = 0;
export const TAG_ENTITY_STATION = 1;
export const TAG_ENTITY_STAR = 2;
export const TAG_ENTITY_GAS_PLANET = 3;
export const TAG_ENTITY_ROCK_PLANET = 4;
export const TAG_ENTITY_PIRATE_SHIP = 5;
export const TAG_ENTITY_SPACE_BEAST = 6;
export const TAG_ENTITY_ANOMALY = 7;
export const TAG_ENTITY_ASTEROID = 8;
export const TAG_ENTITY_PLAYER_SHIP = 9;


export function createEntityNode(tag: number): number
{
  const nodeId = createNode();
  node_render_function[nodeId] = renderShipNode;

  const sprite = createSpriteNode('#');
  addChildNode(nodeId, sprite);
  node_entity_spriteId[nodeId] = sprite;

  const shieldSprite = createSpriteNode("shld", { _scale: 4, _colour: 0xBBFFAAAA });
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
}

export type EncounterParams = {
  _scale?: number,
  _colour?: number;
};
export function setEntityNode(nodeId: number, tag: number, extraParams: EncounterParams = {}): void
{
  if (node_entity_tag[nodeId] === tag) return;

  let textureName: string = "#";
  let colour = extraParams._colour || 0xFFFFFFFF;
  let scale = extraParams._scale || 2;
  const sprite = node_entity_spriteId[nodeId];
  if (scale > 3)
  {
    moveNode(sprite, [0, -8 * scale]);
  } else
  {
    moveNode(sprite, [0, 0]);
  }

  switch (tag)
  {
    case TAG_ENTITY_PLAYER_SHIP:
      textureName = "p_ship";
      node_entity_yOffset[nodeId] = [0, 1];
      node_entity_offsetTimer[nodeId] = [0, 250];
      break;
    case TAG_ENTITY_ASTEROID:
      textureName = "ast";
      break;
    case TAG_ENTITY_ANOMALY:
      textureName = "ano";
      scale = 3;
      break;
    case TAG_ENTITY_SPACE_BEAST:
      textureName = "bst";
      colour = 0xFFEE66EE;
      scale = 3;
      node_entity_yOffset[nodeId] = [0, 1];
      node_entity_offsetTimer[nodeId] = [0, 250];
      break;
    case TAG_ENTITY_PIRATE_SHIP:
      textureName = "prt";
      node_entity_yOffset[nodeId] = [0, 1];
      node_entity_offsetTimer[nodeId] = [0, 250];
      break;
    case TAG_ENTITY_ROCK_PLANET:
      textureName = "rock";
      break;
    case TAG_ENTITY_GAS_PLANET:
      textureName = "gas";
      break;
    case TAG_ENTITY_STAR:
      textureName = "star";
      break;
    case TAG_ENTITY_STATION:
      textureName = "stn";
      scale = 3;
      break;
  }

  setSpriteNode(sprite, textureName, { _scale: scale, _colour: colour });
  node_entity_tag[nodeId] = tag;
}

function renderShipNode(nodeId: number, now: number, delta: number): void
{
  const tag = node_entity_tag[nodeId];
  const offset = node_entity_yOffset[nodeId];
  const particleDirection = tag === TAG_ENTITY_PLAYER_SHIP ? 1 : -1;

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
    const particles = node_entity_particles[nodeId];
    let colour = 0;
    let size = 0;
    for (const particle of particles)
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
      const offsetX = particleDirection === -1 ? 32 : 0;
      pushQuad(offsetX + particleDirection * -particle[0], offset[0] + particle[1] - size / 2, size, size, colour);
    }
  }
}