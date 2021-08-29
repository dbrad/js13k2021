import { Align, createTextNode, updateTextNode } from "../nodes/text-node";
import { CURRENCY_CREDITS, CURRENCY_CREDITS_INCOMING, CURRENCY_MATERIALS, CURRENCY_MATERIALS_INCOMING, CURRENCY_RESEARCH, HULL, currentHull, gameState, maxHull } from "../game-state";
import { GREY_999, HULL_RED, WHITE } from "../colour";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_enabled, node_interactive, node_size } from "../scene-node";
import { createButtonNode, node_button_text_id } from "../nodes/button-node";
import { createSegmentedBarNode, updateSegmentedBarNode } from "../nodes/segmented-bar-node";
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

let buyMaterialsButton: number;
let sellMaterialsButton: number;
let sellResearchButton: number;

let repairHullButton: number;
let repairHullCost: number;

let hullBar: number;

let leaveStationButton: number;

export let setupStation = (): number =>
{
  let rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  let currency = createCurrencyGroupNode();
  moveNode(currency, 289, 0);
  addChildNode(rootId, currency);

  let alignR = { _textAlign: Align.R };

  let shopWidth = 600;
  let shopHeight = 300;

  let divWidth = (shopWidth - 12) / 2;
  let divHeight = shopHeight - 8;

  let stationWindow = createWindowNode(shopWidth, shopHeight, 20, 40);
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

  let upgradeHeight = 52;
  for (let i = 0; i < 5; i++)
  {
    systems[i] = [];
    let h = 2 + i * upgradeHeight;

    let label = createTextNode(systemNames[i], 64, alignR);
    moveNode(label, 69, 37 + h);
    addChildNode(systemUpdatesDiv, label);

    let levelLabel = createTextNode("", 64, { ...alignR, _colour: GREY_999 });
    moveNode(levelLabel, 69, 47 + h);
    addChildNode(systemUpdatesDiv, levelLabel);
    systems[i][LEVEL_LABEL] = levelLabel;

    let cost1Label = createTextNode("", 64, alignR);
    moveNode(cost1Label, 136, 37 + h);
    addChildNode(systemUpdatesDiv, cost1Label);
    systems[i][COST_1_LABEL] = cost1Label;

    let cost2Label = createTextNode("", 64, alignR);
    moveNode(cost2Label, 136, 47 + h);
    addChildNode(systemUpdatesDiv, cost2Label);
    systems[i][COST_2_LABEL] = cost2Label;

    let soldOutLabel = createTextNode("fully upgraded", 64, { _textAlign: Align.C, _colour: GREY_999 });
    moveNode(soldOutLabel, divWidth - 76, 37 + h);
    addChildNode(systemUpdatesDiv, soldOutLabel);

    let button = createButtonNode("upgrade", [142, 32]);
    moveNode(button, divWidth - 150, 30 + h);
    addChildNode(systemUpdatesDiv, button);
    systems[i][PURCHASE_BUTTON] = button;
  }

  ////////////////////////////////////////

  let buyMaterialsLabel = createTextNode("buy raw materials 100cr = 25kg", 136);
  moveNode(buyMaterialsLabel, 6, 8);
  addChildNode(otherShopDiv, buyMaterialsLabel);

  buyMaterialsButton = createButtonNode("buy", [76, 32]);
  moveNode(buyMaterialsButton, divWidth - 80, 0);
  addChildNode(otherShopDiv, buyMaterialsButton);

  let sellMaterialsLabel = createTextNode("sell raw materials 25kg = 75cr", 144);
  moveNode(sellMaterialsLabel, 6, 48);
  addChildNode(otherShopDiv, sellMaterialsLabel);

  sellMaterialsButton = createButtonNode("sell", [76, 32]);
  moveNode(sellMaterialsButton, divWidth - 80, 40);
  addChildNode(otherShopDiv, sellMaterialsButton);

  let sellResearchLabel = createTextNode("sell research 32kb = 100cr", 104);
  moveNode(sellResearchLabel, 6, 88);
  addChildNode(otherShopDiv, sellResearchLabel);

  sellResearchButton = createButtonNode("sell", [76, 32]);
  moveNode(sellResearchButton, divWidth - 80, 80);
  addChildNode(otherShopDiv, sellResearchButton);

  ////////////////////////////////////////

  let hullContainer = createWindowNode(divWidth, 118, 0, 118);
  addChildNode(otherShopDiv, hullContainer);

  let hullText = createTextNode("hull", 32);
  moveNode(hullText, 6, 6);
  addChildNode(hullContainer, hullText);

  hullBar = createSegmentedBarNode(HULL_RED, 16, 4, 4);
  moveNode(hullBar, 6, 16);
  addChildNode(hullContainer, hullBar);

  ////////////////////////////////////////

  let repairHullLabel = createTextNode("repair hull", 88, alignR);
  moveNode(repairHullLabel, 102, 52);
  addChildNode(hullContainer, repairHullLabel);

  repairHullCost = createTextNode("50cr", 32, alignR);
  moveNode(repairHullCost, divWidth - 136, 52);
  addChildNode(hullContainer, repairHullCost);

  repairHullButton = createButtonNode("repair", [124, 32]);
  moveNode(repairHullButton, divWidth - 128, 40);
  addChildNode(hullContainer, repairHullButton);

  ////////////////////////////////////////

  systems[5] = [];

  let upgradeHullLabel = createTextNode("upgrade hull", 96, alignR);
  moveNode(upgradeHullLabel, 102, 87);
  addChildNode(hullContainer, upgradeHullLabel);

  let upgradeHullLevelLabel = createTextNode("", 96, { ...alignR, _colour: GREY_999 });
  moveNode(upgradeHullLevelLabel, 102, 97);
  addChildNode(hullContainer, upgradeHullLevelLabel);
  systems[5][LEVEL_LABEL] = upgradeHullLevelLabel;

  let upgradeHullCost1 = createTextNode("", 96, alignR);
  moveNode(upgradeHullCost1, divWidth - 136, 87);
  addChildNode(hullContainer, upgradeHullCost1);
  systems[5][COST_1_LABEL] = upgradeHullCost1;

  let upgradeHullCost2 = createTextNode("", 96, alignR);
  moveNode(upgradeHullCost2, divWidth - 136, 97);
  addChildNode(hullContainer, upgradeHullCost2);
  systems[5][COST_2_LABEL] = upgradeHullCost2;

  let hullMaxedOut = createTextNode("fully upgraded", 64, { _textAlign: Align.C, _colour: GREY_999 });
  moveNode(hullMaxedOut, divWidth - 62, 87);
  addChildNode(hullContainer, hullMaxedOut);

  let upgradeHullButton = createButtonNode("upgrade", [124, 32]);
  moveNode(upgradeHullButton, divWidth - 128, 80);
  addChildNode(hullContainer, upgradeHullButton);
  systems[5][PURCHASE_BUTTON] = upgradeHullButton;

  return rootId;
};

export let updateStation = (now: number, delta: number) =>
{
  let credits = gameState._currency[CURRENCY_CREDITS];
  let materials = gameState._currency[CURRENCY_MATERIALS];
  let research = gameState._currency[CURRENCY_RESEARCH];

  node_interactive[buyMaterialsButton] = credits >= 100;
  node_interactive[sellMaterialsButton] = materials >= 25;
  node_interactive[sellResearchButton] = research >= 32;

  node_interactive[repairHullButton] = credits >= 50 && gameState._systemLevels[HULL][0] < maxHull();

  if (inputContext._fire === leaveStationButton)
  {
    popScene();
    return;
  }
  else if (inputContext._fire === buyMaterialsButton)
  {
    if (credits >= 100)
    {
      gameState._currency[CURRENCY_CREDITS] -= 100;
      gameState._currency[CURRENCY_MATERIALS_INCOMING] += 25;
    }
  }
  else if (inputContext._fire === sellMaterialsButton)
  {
    if (materials >= 25)
    {
      gameState._currency[CURRENCY_MATERIALS] -= 25;
      gameState._currency[CURRENCY_CREDITS_INCOMING] += 75;
    }
  }
  else if (inputContext._fire === sellResearchButton)
  {
    if (research >= 32)
    {
      gameState._currency[CURRENCY_RESEARCH] -= 32;
      gameState._currency[CURRENCY_CREDITS_INCOMING] += 100;
    }
  }
  else if (inputContext._fire === repairHullButton)
  {
    if (credits >= 50 && gameState._systemLevels[HULL][0] < maxHull())
    {
      gameState._currency[CURRENCY_CREDITS] -= 50;
      gameState._systemLevels[HULL][0] = math.min(gameState._systemLevels[HULL][0] + 1, maxHull());
    }
  }

  updateSegmentedBarNode(hullBar, maxHull(), currentHull());
  updateTextNode(repairHullCost, null, { _colour: credits >= 50 ? WHITE : HULL_RED });

  for (let i = 0; i < 6; i++)
  {
    let level = gameState._systemLevels[i][1];
    let canUpgrade = level < 4;
    updateTextNode(systems[i][LEVEL_LABEL], `lvl${ level }`);

    node_enabled[systems[i][COST_1_LABEL]] = canUpgrade;
    node_enabled[systems[i][COST_2_LABEL]] = canUpgrade;
    node_enabled[systems[i][PURCHASE_BUTTON]] = canUpgrade;

    if (canUpgrade)
    {
      let creditCost = systemUpgradeCosts[level][0];
      let materialCost = systemUpgradeCosts[level][1];
      let hasEnoughCredits = credits >= creditCost;
      let hasEnoughMaterials = materials >= materialCost;

      updateTextNode(systems[i][COST_1_LABEL], `${ creditCost }cr`, { _colour: hasEnoughCredits ? WHITE : HULL_RED });
      updateTextNode(systems[i][COST_2_LABEL], `${ materialCost }kg`, { _colour: hasEnoughMaterials ? WHITE : HULL_RED });

      node_interactive[systems[i][PURCHASE_BUTTON]] = hasEnoughCredits && hasEnoughMaterials;

      if (level === 0 && i < 5)
      {
        updateTextNode(node_button_text_id[systems[i][PURCHASE_BUTTON]], "install");
      }

      if (inputContext._fire === systems[i][PURCHASE_BUTTON])
      {
        if (hasEnoughCredits && hasEnoughMaterials)
        {
          if (i == 5)
          {
            gameState._systemLevels[i][0] += 1;
          }
          gameState._currency[CURRENCY_CREDITS] -= creditCost;
          gameState._currency[CURRENCY_MATERIALS] -= materialCost;
          gameState._systemLevels[i][1] = math.min(4, gameState._systemLevels[i][1] + 1);
          updateTextNode(node_button_text_id[systems[i][PURCHASE_BUTTON]], "upgrade");
        }
      }
    }
  }
};