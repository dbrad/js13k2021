import { CURRENCY_CREDITS, CURRENCY_MATERIALS, CURRENCY_RESEARCH, gameState } from "../game-state";
import { addChildNode, createNode, moveNode, node_render_function } from "../scene-node";
import { createCurrencyNode, updateCurrencyNode } from "./currency-node";

import { math } from "../math";

let node_currency_nodes: number[][] = [];
export let createCurrencyGroupNode = () =>
{
  let nodeId = createNode();
  node_render_function[nodeId] = updateAndRenderCurrencyGroup;
  node_currency_nodes[nodeId] = [];

  let credits = createCurrencyNode("credits", "cr");
  moveNode(credits, 0, 0);
  addChildNode(nodeId, credits);
  node_currency_nodes[nodeId][CURRENCY_CREDITS] = credits;

  let rawMaterials = createCurrencyNode("raw materials", "kg");
  moveNode(rawMaterials, 117, 0);
  addChildNode(nodeId, rawMaterials);
  node_currency_nodes[nodeId][CURRENCY_MATERIALS] = rawMaterials;

  let researchData = createCurrencyNode("research data", "kb");
  moveNode(researchData, 234, 0);
  addChildNode(nodeId, researchData);
  node_currency_nodes[nodeId][CURRENCY_RESEARCH] = researchData;

  return nodeId;
};

let updateAndRenderCurrencyGroup = (nodeId: number, now: number, delta: number) =>
{
  for (let c = 0; c < 6; c += 2)
  {
    let incoming = gameState._currency[c];
    if (incoming > 0)
    {
      let amount = 1;
      if (incoming > 10)
      {
        return math.floor(incoming * 0.25);
      }
      gameState._currency[c] -= amount;
      gameState._currency[c + 1] += amount;
    }
    updateCurrencyNode(node_currency_nodes[nodeId][c + 1], gameState._currency[c + 1]);
  }
};