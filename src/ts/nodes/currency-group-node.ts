import { CURRENCY_CREDITS, CURRENCY_MATERIALS, CURRENCY_RESEARCH, gameState } from "../game-state";
import { createCurrencyNode, updateCurrencyNode } from "./currency-node";
import { createNode, moveNode, node_render_function } from "../scene-node";
import { txt_cr, txt_credits, txt_kb, txt_kg, txt_raw_materials, txt_research_data } from "../text";

import { math } from "../math";

let node_currency_nodes: number[][] = [];
export let createCurrencyGroupNode = (parentId: number, x: number, y: number) =>
{
  let nodeId = createNode(parentId);
  node_render_function[nodeId] = updateAndRenderCurrencyGroup;

  moveNode(nodeId, x, y);
  node_currency_nodes[nodeId] = [];

  node_currency_nodes[nodeId][CURRENCY_CREDITS] = createCurrencyNode(nodeId, 0, 0, txt_credits, txt_cr);

  node_currency_nodes[nodeId][CURRENCY_MATERIALS] = createCurrencyNode(nodeId, 117, 0, txt_raw_materials, txt_kg);

  node_currency_nodes[nodeId][CURRENCY_RESEARCH] = createCurrencyNode(nodeId, 234, 0, txt_research_data, txt_kb);

  return nodeId;
};

let updateAndRenderCurrencyGroup = (nodeId: number, now: number, delta: number) =>
{
  for (let c = 0; c < 6; c += 2)
  {
    let incoming = gameState.e[c];
    if (incoming > 0)
    {
      let amount = 1;
      if (incoming > 10)
      {
        amount = math.floor(incoming * 0.25);
      }
      gameState.e[c] -= amount;
      gameState.e[c + 1] += amount;
    }
    updateCurrencyNode(node_currency_nodes[nodeId][c + 1], gameState.e[c + 1]);
  }
};