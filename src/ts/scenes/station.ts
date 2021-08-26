import { Align, createTextNode, updateTextNode } from "../nodes/text-node";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_enabled, node_size } from "../scene-node";
import { powerSound, zzfxP } from "../zzfx";
import { systemNames, systemUpgradeCosts } from "../gameplay/systems";

import { GREY_999 } from "../colour";
import { createButtonNode } from "../nodes/button-node";
import { createCurrencyGroupNode } from "../nodes/currency-group-node";
import { createWindowNode } from "../nodes/window-node";
import { gameState } from "../game-state";
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

  let shipUpgradesDiv = createWindowNode(divWidth, divHeight, divWidth + 8, 4);
  addChildNode(stationWindow, shipUpgradesDiv);

  let shipHeader = createTextNode("ship", 128, { _textAlign: Align.C, _scale: 2 });
  moveNode(shipHeader, divWidth / 2, 0);
  addChildNode(shipUpgradesDiv, shipHeader);

  leaveStationButton = createButtonNode('leave', [divWidth, 50]);
  addChildNode(shipUpgradesDiv, leaveStationButton);

  let upgradeHeight = 40;
  for (let i = 0; i < 5; i++)
  {
    systems[i] = [];
    let h = i * upgradeHeight;
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

    let button = createButtonNode("upgrade", [148, 30]);
    moveNode(button, divWidth - 150, 30 + h);
    addChildNode(systemUpdatesDiv, button);
    systems[i][PURCHASE_BUTTON] = button;
  }
  // repair button
  // hull upgrade button

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
    updateTextNode(systems[i][LEVEL_LABEL], `lvl${ level }`);
    if (level < 4)
    {
      updateTextNode(systems[i][COST_1_LABEL], `${ systemUpgradeCosts[level][0] }cr`);
      updateTextNode(systems[i][COST_2_LABEL], `${ systemUpgradeCosts[level][1] }kg`);
    }
    else
    {
      node_enabled[systems[i][COST_1_LABEL]] = false;
      node_enabled[systems[i][COST_2_LABEL]] = false;
      node_enabled[systems[i][PURCHASE_BUTTON]] = false;
    }
    if (inputContext._fire === systems[i][PURCHASE_BUTTON])
    {
      gameState._systemLevels[i][1] = math.min(4, gameState._systemLevels[i][1] + 1);
    }
  }
};