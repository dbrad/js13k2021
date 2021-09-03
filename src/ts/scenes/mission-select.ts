import { SCREEN_CENTER_X, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_enabled, node_size } from "../scene-node";
import { gameState, qDriveCosts, qReset, softReset } from "../game-state";
import { qDriveSound, zzfxP } from "../zzfx";

import { Adventure } from "./adventure";
import { GameMenu } from "./game-menu";
import { Station } from "./station";
import { WHITE } from "../colour";
import { createButtonNode } from "../nodes/button-node";
import { createCurrencyGroupNode } from "../nodes/currency-group-node";
import { createGalaxyMapNode } from "../nodes/galaxy-map-ui-node";
import { createQDriveNode } from "../nodes/quantum-drive-node";
import { inputContext } from "../input";
import { pushScene } from "../scene";
import { txt_menu } from "../text";

export namespace MissionSelect
{
  export const _sceneId = 1;

  let smallSystemId: number;

  let menuButton: number;
  let stationButton: number;
  let qDrive: number;
  let activateQDriveButton: number;

  export let _setup = (): number =>
  {
    let rootId = createNode();
    node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

    let currency = createCurrencyGroupNode();
    moveNode(currency, 217, 0);
    addChildNode(rootId, currency);

    menuButton = createButtonNode(txt_menu, [70, 28]);
    moveNode(menuButton, SCREEN_WIDTH - 72, 0);
    addChildNode(rootId, menuButton);

    let map = createGalaxyMapNode();
    moveNode(map, 0, 34);
    addChildNode(rootId, map);

    qDrive = createQDriveNode();
    moveNode(qDrive, SCREEN_CENTER_X - 102, SCREEN_HEIGHT - 20);
    addChildNode(rootId, qDrive);

    activateQDriveButton = createButtonNode(`activate\nq.drive`, [204, 40]);
    moveNode(activateQDriveButton, SCREEN_CENTER_X - 102, SCREEN_HEIGHT - 40);
    addChildNode(rootId, activateQDriveButton);

    stationButton = createButtonNode("upgrade ship", [162, 78]);
    moveNode(stationButton, 476, 260);
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
      pushScene(Adventure._sceneId);
    }
    else if (inputContext._fire === activateQDriveButton)
    {
      qReset();
      pushScene(MissionSelect._sceneId, 1000, WHITE);
      zzfxP(qDriveSound);
    }
  };
}