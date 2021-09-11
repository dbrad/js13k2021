import { Align_Center, Align_Right, createTextNode } from "../nodes/text-node";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH, requestFullscreen } from "../screen";
import { createNode, nodeSize, node_enabled } from "../scene-node";
import { gameState, hasSaveFile, initGameState, loadGame } from "../game-state";

import { Adventure } from "./adventure";
import { MissionSelect } from "./mission-select";
import { ShipSelect } from "./ship-select";
import { VERSION } from "../version";
import { createButtonNode } from "../nodes/button-node";
import { inputContext } from "../input";
import { pushScene } from "../scene";
import { txt_toggle_fullscreen } from "../text";

export namespace MainMenu
{
  export const _sceneId = 0;

  let newGameButton: number;
  let loadGameButton: number;
  let fullscreenButton: number;

  export let _setup = (): number =>
  {
    let rootId = createNode();
    nodeSize(rootId, SCREEN_WIDTH, SCREEN_HEIGHT);

    createTextNode(rootId, "2d4x13k", SCREEN_CENTER_X, 40, { _scale: 5, _textAlign: Align_Center });
    createTextNode(rootId, "a 2d 4x inspired space game", SCREEN_CENTER_X, 82, { _textAlign: Align_Center });

    newGameButton = createButtonNode(rootId, "new game", 288, 40, SCREEN_CENTER_X - 144, SCREEN_CENTER_Y - 12);

    loadGameButton = createButtonNode(rootId, "load game", 288, 40, SCREEN_CENTER_X - 144, SCREEN_CENTER_Y + 44);
    node_enabled[loadGameButton] = hasSaveFile();

    fullscreenButton = createButtonNode(rootId, txt_toggle_fullscreen, 288, 40, SCREEN_CENTER_X - 144, SCREEN_CENTER_Y + 100);

    createTextNode(rootId, VERSION, SCREEN_WIDTH - 2, SCREEN_HEIGHT - 10, { _textAlign: Align_Right });

    return rootId;
  };

  export let _update = (now: number, delta: number): void =>
  {
    node_enabled[loadGameButton] = hasSaveFile();

    if (inputContext._fire === newGameButton)
    {
      initGameState();
      pushScene(ShipSelect._sceneId);
    }
    else if (inputContext._fire === loadGameButton)
    {
      loadGame();
      if (gameState._adventureEncounters.length > 0)
      {
        pushScene(Adventure._sceneId);
      }
      else
      {
        pushScene(MissionSelect._sceneId);
      }
    }
    else if (inputContext._fire === fullscreenButton)
    {
      requestFullscreen();
    }
  };
}