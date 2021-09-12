import { ENC_ANOMALY, ENC_STATION, Encounter } from "../gameplay/encounters";
import { GREY_6333, HULL_RED } from "../colour";
import { TAG_ENTITY_NONE, createEntityNode, updateEntityNode } from "./entity-node";
import { createNode, moveNode, node_enabled, node_render_function } from "../scene-node";
import { createSegmentedBarNode, updateSegmentedBarNode } from "./segmented-bar-node";
import { createTextNode, updateTextNode } from "./text-node";
import { txt_cr, txt_empty_string } from "../text";

import { CURRENCY_CREDITS_INCOMING } from "../game-state";
import { assert } from "../debug";
import { pushQuad } from "../draw";

let node_hud_title: number[] = [];
let node_hud_description: number[] = [];
let node_hud_entity: number[] = [];
let node_hud_hp_bar: number[] = [];

export let createHUDNode = (parentId: number, x: number, y: number): number =>
{
  let nodeId = createNode(parentId);
  node_render_function[nodeId] = renderHUD;

  moveNode(nodeId, x, y);

  let title = createTextNode(nodeId, txt_empty_string, 2, 2, { _scale: 2 });
  node_hud_title[nodeId] = title;

  let description = createTextNode(nodeId, txt_empty_string, 2, 22);
  node_hud_description[nodeId] = description;

  node_hud_hp_bar[nodeId] = createSegmentedBarNode(nodeId, 198, 24, HULL_RED, 8, 5, 5);

  node_hud_entity[nodeId] = createEntityNode(nodeId, 238, 2, TAG_ENTITY_NONE, false);

  return nodeId;
};

export let updateHUDNode = (nodeId: number, encounter: Encounter): void =>
{
  let hpBar = node_hud_hp_bar[nodeId];
  let title = node_hud_title[nodeId];
  let description = node_hud_description[nodeId];

  node_enabled[nodeId] = true;
  updateEntityNode(node_hud_entity[nodeId], encounter.b, encounter.a, { _scale: 1, _colour: encounter.g });

  node_enabled[hpBar] = false;
  if (encounter.k)
  {
    node_enabled[hpBar] = true;
    assert(encounter.j !== undefined, `Entity has max hp, but no set hp.`);
    updateSegmentedBarNode(hpBar, encounter.k, encounter.j);
    let x = 256 - 2 - 6 - (encounter.k * 10);
    moveNode(hpBar, x, 24);
  }

  let descriptionText: string[] = [];
  if (encounter.l)
  {
    descriptionText.push("hazard");
    if (encounter.n)
    {
      let currency = encounter.n[1] === CURRENCY_CREDITS_INCOMING ? txt_cr : "kb";
      descriptionText.push(` - bounty ${ encounter.n[0] }${ currency }\n`);
    }
    else
    {
      descriptionText.push("\n");
    }
  }
  if (encounter.i)
  {
    descriptionText.push(`minable - ${ encounter.i }kg\n`);
  }
  if (encounter.h)
  {
    descriptionText.push(`researchable - ${ encounter.h }kb`);
  }
  if (encounter.b === ENC_STATION)
  {
    if (encounter.o)
    {
      descriptionText.push("destination");
    }
    else
    {
      descriptionText.push("ship upgrades");
    }
  }
  if (encounter.b === ENC_ANOMALY)
  {
    descriptionText.push("the unknown");
  }
  updateTextNode(description, descriptionText.join(txt_empty_string));
  updateTextNode(title, encounter.c);
};

let renderHUD = (nodeId: number, now: number, delta: number) =>
{
  pushQuad(0, 0, 256, 42, GREY_6333);
};