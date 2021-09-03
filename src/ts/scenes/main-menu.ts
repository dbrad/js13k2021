import { Align_Center, createTextNode } from "../nodes/text-node";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH, requestFullscreen } from "../screen";
import { addChildNode, createNode, moveNode, node_enabled, node_size } from "../scene-node";
import { gameState, hasSaveFile, initGameState, loadGame, saveGame } from "../game-state";

import { Adventure } from "./adventure";
import { MissionSelect } from "./mission-select";
import { createButtonNode } from "../nodes/button-node";
import { inputContext } from "../input";
import { pushScene } from "../scene";
import { txt_toggle_fullscreen } from "../text";

export namespace MainMenu
{
  export const _sceneId = 0;

  let startButton: number;
  let loadButton: number;
  let fullscreenButton: number;

  export let _setup = (): number =>
  {
    let rootId = createNode();
    node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

    let textNodeId = createTextNode("2dq4x13k", { _scale: 4, _textAlign: Align_Center });
    moveNode(textNodeId, SCREEN_CENTER_X, 20);
    addChildNode(rootId, textNodeId);;

    startButton = createButtonNode("new game", [288, 40]);
    moveNode(startButton, SCREEN_CENTER_X - 144, SCREEN_CENTER_Y - 12);
    addChildNode(rootId, startButton);

    loadButton = createButtonNode("load game", [288, 40]);
    moveNode(loadButton, SCREEN_CENTER_X - 144, SCREEN_CENTER_Y + 44);
    addChildNode(rootId, loadButton);
    node_enabled[loadButton] = hasSaveFile();

    fullscreenButton = createButtonNode(txt_toggle_fullscreen, [288, 40]);
    moveNode(fullscreenButton, SCREEN_CENTER_X - 144, SCREEN_CENTER_Y + 100);
    addChildNode(rootId, fullscreenButton);

    return rootId;
  };

  export let _update = (now: number, delta: number): void =>
  {
    node_enabled[loadButton] = hasSaveFile();

    if (inputContext._fire === startButton)
    {
      if (hasSaveFile())
      {
        // TODO(dbrad): Need an in engine confirm here
        if (confirm("?"))
        {
          initGameState();
          saveGame();
          pushScene(MissionSelect._sceneId);
        }
      }
      else
      {
        initGameState();
        saveGame();
        pushScene(MissionSelect._sceneId);
      }
    }
    else if (inputContext._fire === loadButton)
    {
      loadGame();
      if (0 > 0)// TODO(dbrad): need new flag to check for mid-transit
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