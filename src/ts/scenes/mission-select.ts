import { RUN_SHORT, THREAT_LOW, generateEncounterDeck } from "../gameplay/encounters";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_enabled, node_size } from "../scene-node";
import { gameState, qDriveCosts, qReset, softReset } from "../game-state";

import { Adventure } from "./adventure";
import { GameMenu } from "./game-menu";
import { Station } from "./station";
import { createButtonNode } from "../nodes/button-node";
import { createCurrencyGroupNode } from "../nodes/currency-group-node";
import { createQDriveNode } from "../nodes/quantum-drive-node";
import { inputContext } from "../input";
import { pushScene } from "../scene";
import { txt_menu } from "../text";

export namespace MissionSelect
{
  export const _sceneId = 1;

  let smallSystemId: number;
  let mediumSystemId: number;
  let largeSystemId: number;
  let unchartedSystemId: number;

  let menuButton: number;
  let stationButton: number;
  let qDrive: number;
  let activateQDriveButton: number;

  export let _setup = (): number =>
  {
    let rootId = createNode();
    node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

    let currency = createCurrencyGroupNode();
    moveNode(currency, 219, 0);
    addChildNode(rootId, currency);

    menuButton = createButtonNode(txt_menu, [70, 28]);
    moveNode(menuButton, SCREEN_WIDTH - 70, 0);
    addChildNode(rootId, menuButton);

    smallSystemId = createButtonNode("small", [180, 40]);
    moveNode(smallSystemId, SCREEN_CENTER_X - 90, SCREEN_CENTER_Y - 100);
    addChildNode(rootId, smallSystemId);

    mediumSystemId = createButtonNode("medium", [180, 40]);
    moveNode(mediumSystemId, SCREEN_CENTER_X - 90, SCREEN_CENTER_Y - 50);
    addChildNode(rootId, mediumSystemId);

    largeSystemId = createButtonNode("large", [180, 40]);
    moveNode(largeSystemId, SCREEN_CENTER_X - 90, SCREEN_CENTER_Y);
    addChildNode(rootId, largeSystemId);

    unchartedSystemId = createButtonNode("uncharted", [180, 40]);
    moveNode(unchartedSystemId, SCREEN_CENTER_X - 90, SCREEN_CENTER_Y + 50);
    addChildNode(rootId, unchartedSystemId);

    qDrive = createQDriveNode();
    moveNode(qDrive, SCREEN_CENTER_X - 102, SCREEN_HEIGHT - 20);
    addChildNode(rootId, qDrive);

    activateQDriveButton = createButtonNode(`activate\nq.drive`, [204, 40]);
    moveNode(activateQDriveButton, SCREEN_CENTER_X - 102, SCREEN_HEIGHT - 40);
    addChildNode(rootId, activateQDriveButton);

    stationButton = createButtonNode("upgrade ship", [160, 80]);
    moveNode(stationButton, SCREEN_WIDTH - 162, SCREEN_HEIGHT - 82);
    addChildNode(rootId, stationButton);

    return rootId;
  };

  export let _update = (now: number, delta: number): void =>
  {
    node_enabled[activateQDriveButton] = gameState._generatorLevel < 5 && gameState._qLevel >= qDriveCosts[gameState._generatorLevel];
    node_enabled[qDrive] = gameState._generatorLevel < 5;
    if (inputContext._fire === menuButton)
    {
      pushScene(GameMenu._sceneId);
    }
    else if (inputContext._fire === stationButton)
    {
      pushScene(Station._sceneId);
    }
    else if (inputContext._fire === smallSystemId)
    {
      softReset();
      gameState._adventureEncounters = generateEncounterDeck(RUN_SHORT, THREAT_LOW);
      gameState._adventureReward = 1000;
      gameState._threatLevel = THREAT_LOW;
      pushScene(Adventure._sceneId);
    }
    else if (inputContext._fire === activateQDriveButton)
    {
      qReset();
    }
  };
}