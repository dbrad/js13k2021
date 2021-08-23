import { Align, createTextNode } from "../nodes/text-node";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { TAG_ENTITY_PLAYER_SHIP, createEntityNode } from "../nodes/entity-node";
import { addChildNode, createNode, moveNode, node_enabled, node_size } from "../scene-node";
import { hasSaveFile, initGameState, loadGame } from "../game-state";

import { MissionSelectScene } from "./mission-select";
import { createButtonNode } from "../nodes/button-node";
import { inputContext } from "../input";
import { pushScene } from "../scene";

export let MainMenuScene = 0;

let startButtonId: number;
let loadButtonId: number;

export let setupMainMenu = (): number =>
{
  let rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  let textNodeId = createTextNode("1d 4x13k", SCREEN_WIDTH, { _scale: 4, _textAlign: Align.C });
  moveNode(textNodeId, [SCREEN_CENTER_X, 20]);
  addChildNode(rootId, textNodeId);

  let textNodeId02 = createTextNode("the one dimensional 4x game", SCREEN_WIDTH, { _textAlign: Align.C });
  moveNode(textNodeId02, [SCREEN_CENTER_X, 54]);
  addChildNode(rootId, textNodeId02);

  startButtonId = createButtonNode("new game", [180, 40]);
  moveNode(startButtonId, [SCREEN_CENTER_X - 90, SCREEN_CENTER_Y + 90]);
  addChildNode(rootId, startButtonId);

  loadButtonId = createButtonNode("load game", [180, 40]);
  moveNode(loadButtonId, [SCREEN_CENTER_X - 90, SCREEN_CENTER_Y + 30]);
  addChildNode(rootId, loadButtonId);
  node_enabled[loadButtonId] = hasSaveFile();

  return rootId;
};

export let updateMainMenu = (now: number, delta: number): void =>
{
  if (inputContext._fire === startButtonId)
  {
    if (hasSaveFile())
    {
      if (confirm("?"))
      {
        initGameState();
        pushScene(MissionSelectScene);
      }
    }
    else
    {
      initGameState();
      pushScene(MissionSelectScene);
    }
  }
  else if (inputContext._fire === loadButtonId)
  {
    loadGame();
    pushScene(MissionSelectScene);
  }
};