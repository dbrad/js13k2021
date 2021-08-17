import { addChildNode, createNode, moveNode, node_position, node_render_function, node_visible } from "../scene-node";

import { colourToHex } from "../colour";
import { createSpriteNode } from "./sprite-node";
import { gameState } from "../game-state";
import { pushQuad } from "../draw";
import { rand } from "../random";

const node_ship_spriteId: number[] = [];
const node_ship_shield_sprite: number[] = [];
const node_ship_particles: [number, number, number][][] = [];
const node_ship_yOffset: [number, number][] = [];
const node_ship_offsetTimer: [number, number][] = [];

export function createShipNode()
{
  const nodeId = createNode();
  node_render_function[nodeId] = renderShipNode;

  const shipId = createSpriteNode(`p_ship`, { _scale: 2 });
  addChildNode(nodeId, shipId);
  node_ship_spriteId[nodeId] = shipId;

  const shieldSprite = createSpriteNode("shld", { _scale: 4, _colour: 0xBBFFAAAA });

  moveNode(shieldSprite, [-16, -16]);
  addChildNode(shipId, shieldSprite);
  node_ship_shield_sprite[nodeId] = shieldSprite;

  node_ship_yOffset[nodeId] = [0, 1];
  node_ship_offsetTimer[nodeId] = [0, 250];
  node_ship_particles[nodeId] = [];
  for (let i = 0; i < 50; i++)
  {
    node_ship_particles[nodeId].push([0, 10, Math.random() * 5]);
  }

  return nodeId;
}

function renderShipNode(nodeId: number, now: number, delta: number): void
{
  const offset = node_ship_yOffset[nodeId];
  node_ship_offsetTimer[nodeId][0] += delta;
  if (node_ship_offsetTimer[nodeId][0] > node_ship_offsetTimer[nodeId][1])
  {
    node_ship_offsetTimer[nodeId][0] = 0;
    node_ship_offsetTimer[nodeId][1] = rand(150, 500);
    if (offset[0] > 2 || offset[0] < -2)
      offset[1] *= -1;
    offset[0] += offset[1];
    node_position[node_ship_spriteId[nodeId]][1] = offset[0];
  }

  node_visible[node_ship_shield_sprite[nodeId]] = gameState._currentShield > 0;

  const particles = node_ship_particles[nodeId];
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
    pushQuad(-particle[0], offset[0] + particle[1] - size / 2, size, size, colour);
  }
}