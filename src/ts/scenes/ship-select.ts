import { Align_Center, createTextNode } from "../nodes/text-node";
import { SCREEN_CENTER_X, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_size } from "../scene-node";

import { createButtonNode } from "../nodes/button-node";

export namespace ShipSelect
{
  export const _sceneId = 5;

  let pickScienceVessel: number;
  let pickMiningVessel: number;
  let pickCombatVessel: number;
  let pickCoilVessel: number;

  export let _setup = (): number =>
  {
    let rootId = createNode();
    node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

    let textNodeId = createTextNode("choose a starting vessel", { _scale: 2, _textAlign: Align_Center });
    moveNode(textNodeId, SCREEN_CENTER_X, 20);
    addChildNode(rootId, textNodeId);

    pickScienceVessel = createButtonNode("old resarch vessel", [430, 40]);
    moveNode(pickScienceVessel, SCREEN_CENTER_X - 215, 70);
    addChildNode(rootId, pickScienceVessel);

    pickMiningVessel = createButtonNode("rusted mining vessel", [430, 40]);
    moveNode(pickMiningVessel, SCREEN_CENTER_X - 215, 130);
    addChildNode(rootId, pickMiningVessel);

    pickCombatVessel = createButtonNode("retired combat vessel", [430, 40]);
    moveNode(pickCombatVessel, SCREEN_CENTER_X - 215, 190);
    addChildNode(rootId, pickCombatVessel);


    let coilBonusText = createTextNode("Fcoil Fsupporter Fbonus", { _textAlign: Align_Center });
    moveNode(coilBonusText, SCREEN_CENTER_X, 250);
    addChildNode(rootId, coilBonusText);

    pickCoilVessel = createButtonNode("abandoned imperial cruiser", [430, 40]);
    moveNode(pickCoilVessel, SCREEN_CENTER_X - 215, 265);
    addChildNode(rootId, pickCoilVessel);

    return rootId;
  };

  export let _update = (now: number, delta: number): void =>
  {
  };
}