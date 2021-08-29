import { addChildNode, createNode, moveNode, node_render_function } from "../scene-node";
import { createProgressBarNode, updateProgressBarNode } from "./progress-bar-node";
import { createTextNode, updateTextNode } from "./text-node";
import { gameState, qDriveCosts } from "../game-state";

import { Q_DRIVE_PURPLE } from "../colour";
import { math } from "../math";
import { txt_empty_string } from "../text";

let node_q_drive_label: number[] = [];
let node_q_drive_bar: number[] = [];
export let createQDriveNode = (): number =>
{
  let nodeId = createNode();
  node_render_function[nodeId] = renderQDrive;

  let label = createTextNode(txt_empty_string, 640);
  addChildNode(nodeId, label);
  node_q_drive_label[nodeId] = label;

  let progressBar = createProgressBarNode(Q_DRIVE_PURPLE, 200);
  moveNode(progressBar, 0, 10);
  addChildNode(nodeId, progressBar);
  node_q_drive_bar[nodeId] = progressBar;

  return nodeId;
};

let renderQDrive = (nodeId: number, now: number, delta: number): void =>
{
  let progress = math.min(100, math.floor((gameState._qLevel / qDriveCosts[gameState._generatorLevel]) * 100));
  if (progress === 100)
  {
    updateTextNode(node_q_drive_label[nodeId], `quantum drive (charged)`);
  }
  else
  {
    updateTextNode(node_q_drive_label[nodeId], `quantum drive`);
  }
  updateProgressBarNode(node_q_drive_bar[nodeId], progress);
};