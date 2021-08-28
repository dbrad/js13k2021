import { Align, createTextNode, updateTextNode } from "../nodes/text-node";
import { CURRENCY_CREDITS, CURRENCY_MATERIALS, gameState } from "../game-state";
import { GREY_999, HULL_RED, WHITE } from "../colour";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_enabled, node_size } from "../scene-node";
import { createButtonNode, node_button_text_id } from "../nodes/button-node";
import { powerSound, zzfxP } from "../zzfx";
import { systemNames, systemUpgradeCosts } from "../gameplay/systems";

import { createCurrencyGroupNode } from "../nodes/currency-group-node";
import { createWindowNode } from "../nodes/window-node";
import { inputContext } from "../input";
import { math } from "../math";
import { popScene } from "../scene";

export let StationScene = 3;

let LEVEL_LABEL = 0;
let COST_1_LABEL = 1;
let COST_2_LABEL = 2;
let PURCHASE_BUTTON = 3;

let systems: number[][] = [];
let leaveStationButton: number;

export let setupStation = (): number =>
{
  let rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  let currency = createCurrencyGroupNode();
  moveNode(currency, 289, 0);
  addChildNode(rootId, currency);

  let shopWidth = 600;
  let shopHeight = 250;

  let divWidth = (shopWidth - 12) / 2;
  let divHeight = shopHeight - 8;

  let stationWindow = createWindowNode(shopWidth, shopHeight, 20, 50);
  addChildNode(rootId, stationWindow, 2);

  let systemUpdatesDiv = createWindowNode(divWidth, divHeight, 4, 4);
  addChildNode(stationWindow, systemUpdatesDiv);

  let upgradeHeader = createTextNode("systems", 128, { _textAlign: Align.C, _scale: 2 });
  moveNode(upgradeHeader, divWidth / 2, 0);
  addChildNode(systemUpdatesDiv, upgradeHeader);

  let otherShopDiv = createWindowNode(divWidth, divHeight, divWidth + 8, 4);
  addChildNode(stationWindow, otherShopDiv);

  leaveStationButton = createButtonNode('leave', [divWidth, 50]);
  moveNode(leaveStationButton, 0, divHeight - 50);
  addChildNode(otherShopDiv, leaveStationButton);

  let upgradeHeight = 40;
  for (let i = 0; i < 5; i++)
  {
    systems[i] = [];
    let h = 2 + i * upgradeHeight;
    let opt = { _textAlign: Align.R };

    let label = createTextNode(systemNames[i], 64, opt);
    moveNode(label, 69, 35 + h);
    addChildNode(systemUpdatesDiv, label);

    let levelLabel = createTextNode("", 64, { ...opt, _colour: GREY_999 });
    moveNode(levelLabel, 69, 45 + h);
    addChildNode(systemUpdatesDiv, levelLabel);
    systems[i][LEVEL_LABEL] = levelLabel;

    let cost1Label = createTextNode("", 64, opt);
    moveNode(cost1Label, 136, 35 + h);
    addChildNode(systemUpdatesDiv, cost1Label);
    systems[i][COST_1_LABEL] = cost1Label;

    let cost2Label = createTextNode("", 64, opt);
    moveNode(cost2Label, 136, 45 + h);
    addChildNode(systemUpdatesDiv, cost2Label);
    systems[i][COST_2_LABEL] = cost2Label;

    let soldOutLabel = createTextNode("fully upgraded", 64, { _textAlign: Align.C, _colour: GREY_999 });
    moveNode(soldOutLabel, divWidth - 76, 35 + h);
    addChildNode(systemUpdatesDiv, soldOutLabel);

    let button = createButtonNode("upgrade", [142, 30]);
    moveNode(button, divWidth - 150, 30 + h);
    addChildNode(systemUpdatesDiv, button);
    systems[i][PURCHASE_BUTTON] = button;
  }

  let buyMaterialsLabel = createTextNode("buy raw materials 100cr = 25kg", 136);
  moveNode(buyMaterialsLabel, 0, 8);
  addChildNode(otherShopDiv, buyMaterialsLabel);

  let buyMaterialsButton = createButtonNode("buy", [100, 32]);
  moveNode(buyMaterialsButton, divWidth - 100, 0);
  addChildNode(otherShopDiv, buyMaterialsButton);

  let sellMaterialsLabel = createTextNode("sell raw materials 25kg = 75cr", 144);
  moveNode(sellMaterialsLabel, 0, 48);
  addChildNode(otherShopDiv, sellMaterialsLabel);

  let sellMaterialsButton = createButtonNode("sell", [100, 32]);
  moveNode(sellMaterialsButton, divWidth - 100, 40);
  addChildNode(otherShopDiv, sellMaterialsButton);

  let sellResearchLabel = createTextNode("sell research 64kb = 100cr", 104);
  moveNode(sellResearchLabel, 0, 88);
  addChildNode(otherShopDiv, sellResearchLabel);

  let sellResearchButton = createButtonNode("sell", [100, 32]);
  moveNode(sellResearchButton, divWidth - 100, 80);
  addChildNode(otherShopDiv, sellResearchButton);

  return rootId;
};

export let updateStation = (now: number, delta: number) =>
{
  if (inputContext._fire === leaveStationButton)
  {
    popScene();
    return;
  }
  for (let i = 0; i < 5; i++)
  {
    let level = gameState._systemLevels[i][1];
    let creditCost = systemUpgradeCosts[level][0];
    let materialCost = systemUpgradeCosts[level][1];
    let hasEnoughCredits = gameState._currency[CURRENCY_CREDITS] >= creditCost;
    let hasEnoughMaterials = gameState._currency[CURRENCY_MATERIALS] >= materialCost;
    updateTextNode(systems[i][LEVEL_LABEL], `lvl${ level }`);
    if (level < 4)
    {
      updateTextNode(systems[i][COST_1_LABEL], `${ creditCost }cr`, { _colour: hasEnoughCredits ? WHITE : HULL_RED });
      updateTextNode(systems[i][COST_2_LABEL], `${ materialCost }kg`, { _colour: hasEnoughCredits ? WHITE : HULL_RED });
      if (level === 0)
      {
        updateTextNode(node_button_text_id[systems[i][PURCHASE_BUTTON]], "install");
      }
    }
    else
    {
      node_enabled[systems[i][COST_1_LABEL]] = false;
      node_enabled[systems[i][COST_2_LABEL]] = false;
      node_enabled[systems[i][PURCHASE_BUTTON]] = false;
    }
    if (inputContext._fire === systems[i][PURCHASE_BUTTON])
    {
      if (hasEnoughCredits && hasEnoughMaterials)
      {
        gameState._currency[CURRENCY_CREDITS] -= creditCost;
        gameState._currency[CURRENCY_MATERIALS] -= materialCost;
        gameState._systemLevels[i][1] = math.min(4, gameState._systemLevels[i][1] + 1);
        updateTextNode(node_button_text_id[systems[i][PURCHASE_BUTTON]], "install");
      }
    }
  }
};