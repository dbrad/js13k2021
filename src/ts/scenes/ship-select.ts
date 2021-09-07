import { Align_Center, createTextNode, updateTextNode } from "../nodes/text-node";
import { MINING_LASERS, SCANNERS, WEAPONS, gameState, saveGame } from "../game-state";
import { SCREEN_CENTER_X, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_interactive, node_size } from "../scene-node";
import { popScene, pushScene } from "../scene";

import { MissionSelect } from "./mission-select";
import { createButtonNode } from "../nodes/button-node";
import { inputContext } from "../input";
import { txt_empty_string } from "../text";

export namespace ShipSelect
{
  export const _sceneId = 5;

  let pickScienceVessel: number;
  let pickMiningVessel: number;
  let pickCombatVessel: number;
  let pickCoilVessel: number;
  let coilStatusText: number;
  let backButton: number;

  export let _setup = (): number =>
  {
    let rootId = createNode();
    node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

    let textNodeId = createTextNode("choose a starting vessel", { _scale: 2, _textAlign: Align_Center });
    moveNode(textNodeId, SCREEN_CENTER_X, 20);
    addChildNode(rootId, textNodeId);

    pickScienceVessel = createButtonNode("old research vessel", [430, 40]);
    moveNode(pickScienceVessel, SCREEN_CENTER_X - 215, 70);
    addChildNode(rootId, pickScienceVessel);

    pickMiningVessel = createButtonNode("rusted mining vessel", [430, 40]);
    moveNode(pickMiningVessel, SCREEN_CENTER_X - 215, 130);
    addChildNode(rootId, pickMiningVessel);

    pickCombatVessel = createButtonNode("retired combat vessel", [430, 40]);
    moveNode(pickCombatVessel, SCREEN_CENTER_X - 215, 190);
    addChildNode(rootId, pickCombatVessel);


    let coilBonusText = createTextNode("Fcoil Fsupporter Fbonus", { _textAlign: Align_Center });
    moveNode(coilBonusText, SCREEN_CENTER_X, 250);
    addChildNode(rootId, coilBonusText);


    coilStatusText = createTextNode(txt_empty_string, { _textAlign: Align_Center });
    moveNode(coilStatusText, SCREEN_CENTER_X, SCREEN_HEIGHT - 16);
    addChildNode(rootId, coilStatusText);

    pickCoilVessel = createButtonNode("abandoned imperial cruiser", [430, 40]);
    moveNode(pickCoilVessel, SCREEN_CENTER_X - 215, 265);
    addChildNode(rootId, pickCoilVessel);

    backButton = createButtonNode("back", [80, 40]);
    moveNode(backButton, 2, 2);
    addChildNode(rootId, backButton);

    return rootId;
  };

  export let _update = (now: number, delta: number): void =>
  {
    let fire = inputContext._fire;
    let startGame = false;
    node_interactive[pickCoilVessel] = false;

    if (document.monetization && document.monetization.state === "pending")
    {
      updateTextNode(coilStatusText, "Fchecking Fcoil Fsubscription...");
    }
    else if (document.monetization && document.monetization.state === "started")
    {
      updateTextNode(coilStatusText, "Gcoil Gsubscription Gfound!");
      node_interactive[pickCoilVessel] = true;
    }
    else
    {
      updateTextNode(coilStatusText, "Rno Rcoil Rsubscription Rfound");
    }

    if (fire === backButton)
    {
      popScene();
    }
    else if (fire === pickScienceVessel)
    {
      gameState._systemLevels[SCANNERS][1] = 1;
      startGame = true;
    }
    else if (fire === pickMiningVessel)
    {
      gameState._systemLevels[MINING_LASERS][1] = 1;
      startGame = true;
    }
    else if (fire === pickCombatVessel)
    {
      gameState._systemLevels[WEAPONS][1] = 1;
      startGame = true;
    }
    else if (fire === pickCoilVessel)
    {
      gameState._systemLevels[SCANNERS][1] = 1;
      gameState._systemLevels[MINING_LASERS][1] = 1;
      gameState._systemLevels[WEAPONS][1] = 1;
      startGame = true;
    }
    if (startGame)
    {
      saveGame();
      pushScene(MissionSelect._sceneId);
    }
  };
}