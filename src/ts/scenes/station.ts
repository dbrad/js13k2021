import { Align_Center, Align_Right, createTextNode, updateTextNode } from "../nodes/text-node";
import { CURRENCY_CREDITS, CURRENCY_CREDITS_INCOMING, CURRENCY_MATERIALS, CURRENCY_MATERIALS_INCOMING, CURRENCY_RESEARCH, HULL, currentHull, gameState, maxAvailablePower, maxHull, saveGame } from "../game-state";
import { GREY_999, HULL_RED, POWER_GREEN, WHITE } from "../colour";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { buttonSound, zzfxP } from "../zzfx";
import { createButtonNode, updateButtonNode } from "../nodes/button-node";
import { createNode, moveNode, nodeSize, node_enabled, node_interactive } from "../scene-node";
import { createSegmentedBarNode, updateSegmentedBarNode } from "../nodes/segmented-bar-node";
import { systemNames, systemUpgradeCosts } from "../gameplay/systems";
import { txt_available_power, txt_buy, txt_buy_raw_materials, txt_cr, txt_empty_string, txt_hull, txt_hull_repair_cost, txt_install, txt_kg, txt_leave, txt_repair, txt_repair_hull, txt_sell, txt_sell_raw_materials, txt_sell_research, txt_systems, txt_upgrade, txt_upgrade_hull, txt_upgraded_fully } from "../text";

import { createCurrencyGroupNode } from "../nodes/currency-group-node";
import { createWindowNode } from "../nodes/window-node";
import { inputContext } from "../input";
import { math } from "../math";
import { popScene } from "../scene";

export namespace Station
{
  export const _sceneId = 3;

  let SYSTEM_LABEL = 0;
  let COST_LABEL = 1;
  let PURCHASE_BUTTON = 3;

  let systems: number[][] = [];

  let buyMaterialsButton: number;
  let sellMaterialsButton: number;
  let sellResearchButton: number;

  let repairHullButton: number;
  let repairHullCost: number;

  let hullBar: number;

  let leaveStationButton: number;
  let maxPowerBar: number;

  export let _setup = (): number =>
  {
    let rootId = createNode();
    nodeSize(rootId, SCREEN_WIDTH, SCREEN_HEIGHT);

    createCurrencyGroupNode(rootId, 289, 0);

    let alignR = { _textAlign: Align_Right };

    let shopWidth = 600;
    let shopHeight = 300;

    let divWidth = (shopWidth - 12) / 2;
    let divHeight = shopHeight - 8;

    let stationWindow = createWindowNode(rootId, shopWidth, shopHeight, 20, 40);

    let systemUpdatesDiv = createNode(stationWindow);
    nodeSize(systemUpdatesDiv, divWidth, divHeight);
    moveNode(systemUpdatesDiv, 4, 4);

    createTextNode(systemUpdatesDiv, txt_systems, divWidth / 2, 0, { _textAlign: Align_Center, _scale: 2 });

    let upgradeHeight = 55;
    for (let i = 0; i < 5; i++)
    {
      systems[i] = [];
      let h = 2 + i * upgradeHeight;

      systems[i][SYSTEM_LABEL] = createTextNode(systemUpdatesDiv, systemNames[i], 69, 33 + h, alignR);
      systems[i][COST_LABEL] = createTextNode(systemUpdatesDiv, txt_empty_string, 136, 33 + h, alignR);
      createTextNode(systemUpdatesDiv, txt_upgraded_fully, divWidth - 76, 33 + h, { _textAlign: Align_Center, _colour: GREY_999 });
      systems[i][PURCHASE_BUTTON] = createButtonNode(systemUpdatesDiv, txt_upgrade, 142, 32, divWidth - 150, 21 + h);
    }

    ////////////////////////////////////////

    let otherShopDiv = createNode(stationWindow);
    nodeSize(otherShopDiv, divWidth, divHeight);
    moveNode(otherShopDiv, divWidth + 8, 4);

    ////////////////////////////////////////

    let hullContainer = createNode(otherShopDiv);
    nodeSize(hullContainer, divWidth, 93);
    moveNode(hullContainer, 0, 0);

    createTextNode(hullContainer, txt_hull, divWidth / 2, 0, { _scale: 2, _textAlign: Align_Center });

    ////////////////////////////////////////

    createTextNode(hullContainer, txt_repair_hull, 102, 33, alignR);
    repairHullCost = createTextNode(hullContainer, txt_hull_repair_cost, divWidth - 136, 33, alignR);
    repairHullButton = createButtonNode(hullContainer, txt_repair, 124, 32, divWidth - 128, 21);

    ////////////////////////////////////////

    systems[5] = [];

    systems[5][SYSTEM_LABEL] = createTextNode(hullContainer, txt_upgrade_hull, 102, 68, alignR);
    systems[5][COST_LABEL] = createTextNode(hullContainer, txt_empty_string, divWidth - 136, 68, alignR);
    createTextNode(hullContainer, txt_upgraded_fully, divWidth - 62, 68, { _textAlign: Align_Center, _colour: GREY_999 });
    systems[5][PURCHASE_BUTTON] = createButtonNode(hullContainer, txt_upgrade, 124, 32, divWidth - 128, 61);

    ////////////////////////////////////////

    createTextNode(otherShopDiv, "trade", divWidth / 2, 98, { _textAlign: Align_Center, _scale: 2 });

    createTextNode(otherShopDiv, txt_buy_raw_materials, 6, 127);
    buyMaterialsButton = createButtonNode(otherShopDiv, txt_buy, 76, 32, divWidth - 80, 119);

    createTextNode(otherShopDiv, txt_sell_raw_materials, 6, 167);
    sellMaterialsButton = createButtonNode(otherShopDiv, txt_sell, 76, 32, divWidth - 80, 159);

    createTextNode(otherShopDiv, txt_sell_research, 6, 207);
    sellResearchButton = createButtonNode(otherShopDiv, txt_sell, 76, 32, divWidth - 80, 199);

    ////////////////////////////////////////

    createTextNode(rootId, txt_hull, 2, 2);
    hullBar = createSegmentedBarNode(rootId, 2, 12, HULL_RED, 16, 4, 4);

    createTextNode(rootId, txt_available_power, 155, 2);
    maxPowerBar = createSegmentedBarNode(rootId, 155, 12, POWER_GREEN, 8, 3, 3);

    ////////////////////////////////////////

    leaveStationButton = createButtonNode(otherShopDiv, txt_leave, divWidth, 50, 0, divHeight - 50);


    return rootId;
  };

  let delays = [1000, 500, 250, 125];
  let delayIndex = 0;
  let delayTimer = 0;
  export let _update = (now: number, delta: number) =>
  {
    let currency = gameState._currency;
    let credits = currency[CURRENCY_CREDITS];
    let materials = currency[CURRENCY_MATERIALS];
    let research = currency[CURRENCY_RESEARCH];
    updateSegmentedBarNode(maxPowerBar, maxAvailablePower(), gameState._availablePower);

    let buyMaterials = () =>
    {
      if (credits >= 100)
      {
        currency[CURRENCY_CREDITS] -= 100;
        currency[CURRENCY_MATERIALS_INCOMING] += 25;
      }
    };

    let sellMaterials = () =>
    {
      if (materials >= 25)
      {
        currency[CURRENCY_MATERIALS] -= 25;
        currency[CURRENCY_CREDITS_INCOMING] += 75;
      }
    };

    let sellResearch = () =>
    {
      if (research >= 32)
      {
        currency[CURRENCY_RESEARCH] -= 32;
        currency[CURRENCY_CREDITS_INCOMING] += 100;
      }
    };

    node_interactive[buyMaterialsButton] = credits >= 100;
    node_interactive[sellMaterialsButton] = materials >= 25;
    node_interactive[sellResearchButton] = research >= 32;

    node_interactive[repairHullButton] = credits >= 50 && gameState._systemLevels[HULL][0] < maxHull();

    let fire = inputContext._fire;
    let active = inputContext._active;

    if (fire === leaveStationButton)
    {
      saveGame();
      popScene();
      return;
    }
    else if (fire === buyMaterialsButton)
    {
      buyMaterials();
    }
    else if (fire === sellMaterialsButton)
    {
      sellMaterials();
    }
    else if (fire === sellResearchButton)
    {
      sellResearch();
    }
    else if (fire === repairHullButton)
    {
      if (credits >= 50 && gameState._systemLevels[HULL][0] < maxHull())
      {
        currency[CURRENCY_CREDITS] -= 50;
        gameState._systemLevels[HULL][0] = math.min(gameState._systemLevels[HULL][0] + 1, maxHull());
      }
    }
    else if (active === buyMaterialsButton
      || active === sellMaterialsButton
      || active === sellResearchButton)
    {
      delayTimer += delta;
      if (delayTimer >= delays[delayIndex])
      {
        delayTimer = 0;
        delayIndex = math.min(3, delayIndex + 1);
        zzfxP(buttonSound);
        if (active === buyMaterialsButton) buyMaterials();
        else if (active === sellMaterialsButton) sellMaterials();
        else if (active === sellResearchButton) sellResearch();
      }
    }
    else
    {
      delayIndex = delayTimer = 0;
    }

    updateSegmentedBarNode(hullBar, maxHull(), currentHull());
    updateTextNode(repairHullCost, null, { _colour: credits >= 50 ? WHITE : HULL_RED });

    for (let i = 0; i < 6; i++)
    {
      let level = gameState._systemLevels[i][1];
      let canUpgrade = level < 4;
      updateTextNode(systems[i][SYSTEM_LABEL], `${ systemNames[i] }\nFlvl${ level }`);

      node_enabled[systems[i][COST_LABEL]] = canUpgrade;
      node_enabled[systems[i][PURCHASE_BUTTON]] = canUpgrade;

      if (canUpgrade)
      {
        let creditCost = systemUpgradeCosts[level][0];
        let materialCost = systemUpgradeCosts[level][1];
        let hasEnoughCredits = credits >= creditCost;
        let hasEnoughMaterials = materials >= materialCost;

        updateTextNode(systems[i][COST_LABEL], `${ hasEnoughCredits ? txt_empty_string : "R" }${ creditCost + txt_cr }\n${ hasEnoughMaterials ? txt_empty_string : "R" }${ materialCost + txt_kg }`);

        node_interactive[systems[i][PURCHASE_BUTTON]] = hasEnoughCredits && hasEnoughMaterials;

        if (level === 0 && i < 5)
        {
          updateButtonNode(systems[i][PURCHASE_BUTTON], txt_install);
        }

        if (fire === systems[i][PURCHASE_BUTTON])
        {
          if (hasEnoughCredits && hasEnoughMaterials)
          {
            if (i == 5)
            {
              gameState._systemLevels[i][0] += 1;
            }
            currency[CURRENCY_CREDITS] -= creditCost;
            currency[CURRENCY_MATERIALS] -= materialCost;
            gameState._systemLevels[i][1] = math.min(4, gameState._systemLevels[i][1] + 1);
            updateButtonNode(systems[i][PURCHASE_BUTTON], txt_upgrade);
          }
        }
      }
    }
  };
}