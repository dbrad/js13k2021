import { Align_Right, createTextNode, updateTextNode } from "../nodes/text-node";
import { SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { createNode, nodeSize, node_render_function } from "../scene-node";

import { createWindowNode } from "../nodes/window-node";
import { inputContext } from "../input";
import { pushQuad } from "../draw";
import { txt_empty_string } from "../text";

export let dialogRootId: number;
export let dialogActive: boolean = false;
let textNode: number;
let minimumTimer = 0;
export let setupDialogSystem = (): void =>
{
  dialogRootId = createNode();
  nodeSize(dialogRootId, SCREEN_WIDTH, SCREEN_HEIGHT);
  node_render_function[dialogRootId] = renderDialog;

  let window = createWindowNode(dialogRootId, 440, 85, 100, SCREEN_CENTER_Y / 2);

  textNode = createTextNode(window, txt_empty_string, 10, 10, { _width: 420 });

  createTextNode(window, "touch to close...", 430, 75, { _textAlign: Align_Right });
};
export let setDialogText = (text: string) =>
{
  updateTextNode(textNode, text);
  dialogActive = true;
  minimumTimer = 0;
};

let renderDialog = (nodeId: number, now: number, delta: number): void =>
{
  minimumTimer += delta;
  pushQuad(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 0xCC000000);
  if (inputContext._fire > -1 && minimumTimer > 500)
  {
    dialogActive = false;
  }
};