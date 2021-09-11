import { Align_Center, createTextNode } from "../nodes/text-node";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH, requestFullscreen } from "../screen";
import { addChildNode, createNode, nodeSize, node_enabled } from "../scene-node";
import { gameState, hasSaveFile, initGameState, loadGame } from "../game-state";

import { Adventure } from "./adventure";
import { MissionSelect } from "./mission-select";
import { ShipSelect } from "./ship-select";
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

    let textNodeId = createTextNode("2d4x13k", SCREEN_CENTER_X, 40, { _scale: 5, _textAlign: Align_Center });
    addChildNode(rootId, textNodeId);

    newGameButton = createButtonNode("new game", 288, 40, SCREEN_CENTER_X - 144, SCREEN_CENTER_Y - 12);
    addChildNode(rootId, newGameButton);

    loadGameButton = createButtonNode("load game", 288, 40, SCREEN_CENTER_X - 144, SCREEN_CENTER_Y + 44);
    addChildNode(rootId, loadGameButton);
    node_enabled[loadGameButton] = hasSaveFile();

    fullscreenButton = createButtonNode(txt_toggle_fullscreen, 288, 40, SCREEN_CENTER_X - 144, SCREEN_CENTER_Y + 100);
    addChildNode(rootId, fullscreenButton);

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