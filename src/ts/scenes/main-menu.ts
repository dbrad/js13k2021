import { Align, createTextNode } from "../nodes/text-node";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { TAG_ENTITY_PLAYER_SHIP, createEntityNode } from "../nodes/entity-node";
import { addChildNode, createNode, moveNode, node_size } from "../scene-node";

import { MissionSelectScene } from "./mission-select";
import { createButtonNode } from "../nodes/button-node";
import { initGameState } from "../game-state";
import { inputContext } from "../input";
import { pushScene } from "../scene";

export const MainMenuScene = 0;

let startButtonId: number;

export function setupMainMenu(): number
{
  const rootId = createNode();
  node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

  const textNodeId = createTextNode("Js13kGames Jam 2021", SCREEN_WIDTH, { _textAlign: Align.C });
  moveNode(textNodeId, [SCREEN_CENTER_X, 20]);
  addChildNode(rootId, textNodeId);

  const textNodeId02 = createTextNode("Entry by David Brad", SCREEN_WIDTH, { _textAlign: Align.C });
  moveNode(textNodeId02, [SCREEN_CENTER_X, 30]);
  addChildNode(rootId, textNodeId02);

  startButtonId = createButtonNode("New Game", [180, 40]);
  moveNode(startButtonId, [SCREEN_CENTER_X - 90, SCREEN_CENTER_Y + 90]);
  addChildNode(rootId, startButtonId);

  const loadButtonId = createButtonNode("Load Game", [180, 40]);
  moveNode(loadButtonId, [SCREEN_CENTER_X - 90, SCREEN_CENTER_Y + 30]);
  addChildNode(rootId, loadButtonId);

  const ship = createEntityNode(TAG_ENTITY_PLAYER_SHIP);
  moveNode(ship, [SCREEN_CENTER_X - 16, SCREEN_CENTER_Y - 40]);
  addChildNode(rootId, ship);

  return rootId;
}

export function updateMainMenu(now: number, delta: number): void
{
  if (inputContext._fire === startButtonId)
  {
    pushScene(MissionSelectScene);
    initGameState(0);
  }
}