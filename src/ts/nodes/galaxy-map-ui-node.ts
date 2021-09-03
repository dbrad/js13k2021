import { addChildNode, createNode, moveNode, node_interactive, node_position, node_render_function, node_size } from "../scene-node";
import { createTextNode, updateTextNode } from "./text-node";

import { STAR_COLOURS } from "../colour";
import { createButtonNode } from "./button-node";
import { createSpriteNode } from "./sprite-node";
import { createWindowNode } from "./window-node";
import { gameState } from "../game-state";
import { generateSRand } from "../random";
import { inputContext } from "../input";
import { math } from "../math";
import { pushQuad } from "../draw";
import { txt_empty_string } from "../text";
import { v2 } from "../v2";

type Star = {
  _nodeId: number,
  _name: string,
  _colour: number,
  _x: number,
  _y: number,
};

let mapWindow: number;

let background_stars: v2[] = [];
let stars: Star[] = [];

let selected_system_label: number;
let current_system_label: number;

let selectedStarIndicator: number;
let playerLocationIndicator: number;

// Single Instance Node!!!!
export let createGalaxyMapNode = (): number =>
{
  let nodeId = createNode();
  node_size[nodeId] = [640, 300];
  node_render_function[nodeId] = updateAndRenderGalaxyMapUI;

  mapWindow = createWindowNode(300, 300, 170, 0);
  addChildNode(nodeId, mapWindow);

  let galaxyArt = createNode();
  node_render_function[galaxyArt] = renderGalaxyMap;
  addChildNode(mapWindow, galaxyArt);

  playerLocationIndicator = createSpriteNode("shld", { _scale: 2 });
  addChildNode(mapWindow, playerLocationIndicator);
  node_interactive[playerLocationIndicator] = false;

  selectedStarIndicator = createSpriteNode("shld", { _scale: 2 });
  moveNode(selectedStarIndicator, 999, 999);
  addChildNode(mapWindow, selectedStarIndicator);
  node_interactive[selectedStarIndicator] = false;

  let leftPanel = createWindowNode(154, 220, 6, 0);
  addChildNode(nodeId, leftPanel);

  selected_system_label = createTextNode(txt_empty_string);
  addChildNode(leftPanel, selected_system_label);

  let departButton = createButtonNode("depart", [162, 78]);
  moveNode(departButton, 2, 226);
  addChildNode(nodeId, departButton);

  let rightPanel = createWindowNode(154, 220, 6, 0);
  moveNode(rightPanel, 480, 0);
  addChildNode(nodeId, rightPanel);

  current_system_label = createTextNode(txt_empty_string);
  addChildNode(rightPanel, current_system_label);

  return nodeId;
};

let getValidatorForPoints = (x1: number, y1: number, x2: number, y2: number): (x: number, y: number) => boolean =>
{
  let b = -(((x1 * y2) - (x2 * y1)) / (x2 - x1));
  let m = (y2 - y1) / (x2 - x1);
  let [lx, hx] = (x1 < x2 ? [x1, x2] : [x2, x1]);
  let [ly, hy] = (y1 < y2 ? [y1, y2] : [y2, y1]);
  return (x, y): boolean => (math.abs(y - ((m * x) + b)) <= 16 && x >= lx && x <= hx) || (math.abs(x - ((b - y) / (-m))) <= 16 && y >= ly && y <= hy);
};

let updateAndRenderGalaxyMapUI = (nodeId: number, now: number, delta: number): void =>
{
  if (stars.length === 0) generateGalaxy();
  let ps = stars[gameState._currentPlayerSystem];
  moveNode(playerLocationIndicator, ps._x - 8, ps._y - 8);

  for (let star of stars)
  {
    if (inputContext._fire === star._nodeId)
    {
      let validator = getValidatorForPoints(ps._x, ps._y, star._x, star._y);

      let results: string[] = [];
      for (let searchStar of stars)
      {
        if (searchStar._nodeId === ps._nodeId || star._nodeId === searchStar._nodeId) continue;
        if (validator(searchStar._x, searchStar._y))
        {
          results.push(searchStar._name);
        }
      }
      let description = `${ star._name }\ndistance R${ math.floor(math.hypot(star._x - ps._x, star._y - ps._y) * 150) }\n\non the way\n`;
      description += results.join("\n");
      updateTextNode(selected_system_label, description);
      moveNode(selectedStarIndicator, star._x - 8, star._y - 8);
    }
  }
};

let renderGalaxyMap = (nodeId: number, now: number, delta: number) =>
{
  let [rx, ry] = node_position[nodeId];
  for (let [x, y] of background_stars)
  {
    pushQuad(rx + x, ry + y, 1, 1);
  }
};

let scc = String.fromCharCode;
let generateGalaxy = (): void =>
{
  let [srandom, srand] = generateSRand(gameState._galaxySeed);

  let letters = `${ scc(srand(97, 122)) + scc(srand(97, 122)) }`;
  let number = srand(10000, 99900);
  let rot = math.PI * srandom();
  let counter = 0;

  for (var arm = 0; arm < 10; arm++)
  {
    for (var p = 0; p < 49; p++)
    {
      let vary = math.ceil(p / 49 * 7);
      let min = -10 + vary;
      let max = 10 - vary;
      var pX = math.floor(3 * p * math.cos(p + (math.PI * arm + rot)) + (srand(min, max))) + 150;
      var pY = math.floor(3 * p * math.sin(p + (math.PI * arm + rot)) + (srand(min, max))) + 150;

      if (arm === 0 && p >= 10)
      {
        let colour = STAR_COLOURS[srand(0, 2)];

        let star = createSpriteNode("star", { _colour: colour });
        moveNode(star, pX, pY);
        addChildNode(mapWindow, star);

        stars.push({
          _nodeId: star,
          _name: `${ letters } ${ number++ }`,
          _colour: colour,
          _x: pX,
          _y: pY
        });

        counter++;
        if (counter === 5)
        {
          p += 6; counter = 0;
        }
      }
      else
      {
        background_stars.push([pX, pY]);
      }
    }
  }
};