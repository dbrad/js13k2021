import { SCREEN_HEIGHT, SCREEN_WIDTH, requestFullscreen } from "../screen";
import { addChildNode, createNode, moveNode, nodeSize } from "../scene-node";
import { popScene, pushScene } from "../scene";
import { saveGame, toggleMusic } from "../game-state";
import { txt_back, txt_save_and_quit, txt_toggle_fullscreen, txt_toggle_music } from "../text";

import { MainMenu } from "./main-menu";
import { createButtonNode } from "../nodes/button-node";
import { createWindowNode } from "../nodes/window-node";
import { inputContext } from "../input";

export namespace GameMenu
{
  export const _sceneId = 4;

  let musicButton: number;
  let fullscreenButton: number;
  let saveButton: number;
  let backButton: number;

  export let _setup = (): number =>
  {
    let rootId = createNode();
    nodeSize(rootId, SCREEN_WIDTH, SCREEN_HEIGHT);

    let menuWindow = createWindowNode(300, 220, 170, 80);
    addChildNode(rootId, menuWindow);

    musicButton = createButtonNode(txt_toggle_music, 300, 50);
    addChildNode(menuWindow, musicButton);

    fullscreenButton = createButtonNode(txt_toggle_fullscreen, 300, 50);
    moveNode(fullscreenButton, 0, 55);
    addChildNode(menuWindow, fullscreenButton);

    saveButton = createButtonNode(txt_save_and_quit, 300, 50);
    moveNode(saveButton, 0, 110);
    addChildNode(menuWindow, saveButton);

    backButton = createButtonNode(txt_back, 300, 50);
    moveNode(backButton, 0, 170);
    addChildNode(menuWindow, backButton);

    return rootId;
  };

  export let _update = (now: number, delta: number): void =>
  {
    if (inputContext._fire === musicButton)
    {
      toggleMusic();
    }
    else if (inputContext._fire === fullscreenButton)
    {
      requestFullscreen();
    }
    else if (inputContext._fire === saveButton)
    {
      saveGame();
      pushScene(MainMenu._sceneId);
    }
    else if (inputContext._fire === backButton)
    {
      popScene();
    }
  };
}