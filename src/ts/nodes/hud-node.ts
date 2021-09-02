import { ENC_STATION, Encounter } from "../gameplay/encounters";
import { GREY_6333, HULL_RED } from "../colour";
import { TAG_ENTITY_NONE, createEntityNode, updateEntityNode } from "./entity-node";
import { addChildNode, createNode, moveNode, node_enabled, node_render_function } from "../scene-node";
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

export let createHUDNode = (): number =>
{
  let nodeId = createNode();
  node_render_function[nodeId] = renderHUD;

  let title = createTextNode(txt_empty_string, { _scale: 2 });
  moveNode(title, 2, 2);
  addChildNode(nodeId, title);
  node_hud_title[nodeId] = title;

  let description = createTextNode(txt_empty_string);
  moveNode(description, 2, 22);
  addChildNode(nodeId, description);
  node_hud_description[nodeId] = description;

  let hpBar = createSegmentedBarNode(HULL_RED, 8, 5, 5);
  moveNode(hpBar, 198, 24);
  addChildNode(nodeId, hpBar);
  node_hud_hp_bar[nodeId] = hpBar;

  let entity = createEntityNode(TAG_ENTITY_NONE, false);
  moveNode(entity, 238, 2);
  addChildNode(nodeId, entity);
  node_hud_entity[nodeId] = entity;

  return nodeId;
};

export let updateHUDNode = (nodeId: number, encounter: Encounter): void =>
{
  let hpBar = node_hud_hp_bar[nodeId];
  let title = node_hud_title[nodeId];
  let description = node_hud_description[nodeId];

  node_enabled[nodeId] = true;
  updateEntityNode(node_hud_entity[nodeId], encounter._type, encounter._id, { _scale: 1, _colour: encounter._colour });

  node_enabled[hpBar] = false;
  if (encounter._maxHp)
  {
    node_enabled[hpBar] = true;
    assert(encounter._hp !== undefined, `Entity has max hp, but no set hp.`);
    updateSegmentedBarNode(hpBar, encounter._maxHp, encounter._hp);
    let x = 256 - 2 - 6 - (encounter._maxHp * 10);
    moveNode(hpBar, x, 24);
  }

  let descriptionText: string[] = [];
  if (encounter._hazardRange)
  {
    descriptionText.push("hazard");
    if (encounter._bounty)
    {
      let currency = encounter._bounty[1] === CURRENCY_CREDITS_INCOMING ? txt_cr : "kb";
      descriptionText.push(` (bounty: ${ encounter._bounty[0] }${ currency })\n`);
    }
    else
    {
      descriptionText.push("\n");
    }
  }
  if (encounter._minable)
  {
    descriptionText.push("minable\n");
  }
  if (encounter._researchable)
  {
    descriptionText.push("researchable");
  }
  if (encounter._type === ENC_STATION)
  {
    if (encounter._exit)
    {
      descriptionText.push("system exit");
    }
    else
    {
      descriptionText.push("ship upgrades");
    }
  }

  updateTextNode(description, descriptionText.join(txt_empty_string));

  updateTextNode(title, encounter._title);
};

let renderHUD = (nodeId: number, now: number, delta: number) =>
{
  pushQuad(0, 0, 256, 42, GREY_6333);
};