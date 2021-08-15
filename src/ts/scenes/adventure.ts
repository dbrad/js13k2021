import { Align, createTextNode } from "../nodes/text-node";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_size } from "../scene-node";

import { Linear } from "../interpolate";
import { createHPUINode } from "../nodes/hp-ui-node";
import { createShipNode } from "../nodes/ship-node";
import { createSpriteNode } from "../nodes/sprite-node";

export const AdventureScene = 2;
let gas: number;

export function setupAdventure(): number
{
  const rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  const shipId = createShipNode();
  moveNode(shipId, [SCREEN_CENTER_X - 16, SCREEN_CENTER_Y - 40]);
  addChildNode(rootId, shipId, 100);

  const hpId = createHPUINode();
  addChildNode(rootId, hpId, 101);

  // const sun = createSpriteNode("star", 10, false, 0xFFE0F1FF); // 8-10
  // moveNode(sun, [SCREEN_CENTER_X + 40, SCREEN_CENTER_Y - 40]);
  // addChildNode(rootId, sun);


  gas = createSpriteNode("gas", 4, false, 0xFFFF9999); // 3-6
  moveNode(gas, [SCREEN_WIDTH, SCREEN_CENTER_Y - 40]);
  addChildNode(rootId, gas);


  // const rock = createSpriteNode("rock", 2, false, 0xFF506075); // 1-3
  // moveNode(rock, [SCREEN_CENTER_X + 40, SCREEN_CENTER_Y - 40]);
  // addChildNode(rootId, rock);

  // const ast = createSpriteNode("ast", 1, false); // 1-3
  // moveNode(ast, [SCREEN_CENTER_X + 40, SCREEN_CENTER_Y - 40]);
  // addChildNode(rootId, ast);

  return rootId;
}

export function updateAdventure(now: number, delta: number): void
{
  moveNode(gas, [-100, SCREEN_CENTER_Y - 40], Linear, 10000);
}
