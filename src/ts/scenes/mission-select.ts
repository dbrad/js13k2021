import { SCREEN_CENTER_X, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { addChildNode, createNode, moveNode, node_enabled, node_interactive, node_position, node_render_function, node_size } from "../scene-node";
import { gameState, qDriveCosts, qReset, softReset } from "../game-state";
import { buttonSound, qDriveSound, zzfxP } from "../zzfx";

import { Adventure } from "./adventure";
import { GameMenu } from "./game-menu";
import { Station } from "./station";
import { STAR_COLOURS, WHITE } from "../colour";
import { createButtonNode } from "../nodes/button-node";
import { createCurrencyGroupNode } from "../nodes/currency-group-node";
import { createQDriveNode } from "../nodes/quantum-drive-node";
import { inputContext } from "../input";
import { pushScene } from "../scene";
import { txt_empty_string, txt_menu } from "../text";
import { pushQuad } from "../draw";
import { math } from "../math";
import { createSpriteNode } from "../nodes/sprite-node";
import { createTextNode, updateTextNode } from "../nodes/text-node";
import { createWindowNode } from "../nodes/window-node";
import { generateSRand } from "../random";
import { v2 } from "../v2";

export namespace MissionSelect
{
  type Star = {
    _index: number,
    _nodeId: number,
    _name: string,
    _colour: number,
    _x: number,
    _y: number,
  };

  export const _sceneId = 1;

  let menuButton: number;

  let departButton: number;
  let stationButton: number;

  let qDrive: number;
  let activateQDriveButton: number;

  let mapWindow: number;

  let background_stars: v2[] = [];
  let stars: Star[] = [];

  let selectedStarIndex: number = -1;
  let selected_system_label: number;
  let current_system_label: number;

  let selectedStarIndicator: number;
  let playerLocationIndicator: number;

  export let _setup = (): number =>
  {
    let rootId = createNode();
    node_size[rootId] = [SCREEN_WIDTH, SCREEN_HEIGHT];

    let currencyBar = createCurrencyGroupNode();
    moveNode(currencyBar, 217, 0);
    addChildNode(rootId, currencyBar);

    menuButton = createButtonNode(txt_menu, [70, 28]);
    moveNode(menuButton, SCREEN_WIDTH - 72, 0);
    addChildNode(rootId, menuButton);


    mapWindow = createWindowNode(300, 300, 170, 34);
    addChildNode(rootId, mapWindow);

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


    let leftPanel = createWindowNode(154, 220, 6, 34);
    addChildNode(rootId, leftPanel);

    selected_system_label = createTextNode(txt_empty_string);
    addChildNode(leftPanel, selected_system_label);

    departButton = createButtonNode("depart", [162, 78]);
    moveNode(departButton, 2, 260);
    addChildNode(rootId, departButton);


    let rightPanel = createWindowNode(154, 220, 480, 34);
    addChildNode(rootId, rightPanel);

    current_system_label = createTextNode(txt_empty_string);
    addChildNode(rightPanel, current_system_label);

    stationButton = createButtonNode("upgrade ship", [162, 78]);
    moveNode(stationButton, 476, 260);
    addChildNode(rootId, stationButton);


    qDrive = createQDriveNode();
    moveNode(qDrive, SCREEN_CENTER_X - 102, SCREEN_HEIGHT - 20);
    addChildNode(rootId, qDrive);

    activateQDriveButton = createButtonNode(`activate\nq.drive`, [204, 40]);
    moveNode(activateQDriveButton, SCREEN_CENTER_X - 102, SCREEN_HEIGHT - 40);
    addChildNode(rootId, activateQDriveButton);

    return rootId;
  };

  export let _update = (now: number, delta: number): void =>
  {
    node_enabled[activateQDriveButton] = gameState._generatorLevel < 5 && gameState._qLevel >= qDriveCosts[gameState._generatorLevel];
    node_enabled[qDrive] = gameState._generatorLevel < 5;

    if (stars.length === 0) generateGalaxy();
    let ps = stars[gameState._currentPlayerSystem];
    moveNode(playerLocationIndicator, ps._x - 8, ps._y - 8);

    if (inputContext._fire === menuButton)
    {
      pushScene(GameMenu._sceneId);
    }
    else if (inputContext._fire === stationButton)
    {
      pushScene(Station._sceneId);
    }
    else if (inputContext._fire === activateQDriveButton)
    {
      qReset();
      pushScene(MissionSelect._sceneId, 1000, WHITE);
      zzfxP(qDriveSound);
    }
    else if (inputContext._fire === departButton && selectedStarIndex !== -1)
    {
      softReset();
      //todo(dbrad): Generate deck call here
      pushScene(Adventure._sceneId);
    }
    else
    {
      for (let star of stars)
      {
        if (inputContext._fire === star._nodeId)
        {
          if (star._nodeId === ps._nodeId) break;
          selectedStarIndex = star._index;
          zzfxP(buttonSound);
          let validator = getValidatorForPoints(ps._x, ps._y, star._x, star._y);

          // look for stars between the origin and destination
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
    }
  };

  let getValidatorForPoints = (x1: number, y1: number, x2: number, y2: number): (x: number, y: number) => boolean =>
  {
    let b = -(((x1 * y2) - (x2 * y1)) / (x2 - x1));
    let m = (y2 - y1) / (x2 - x1);
    let [lx, hx] = (x1 < x2 ? [x1, x2] : [x2, x1]);
    let [ly, hy] = (y1 < y2 ? [y1, y2] : [y2, y1]);
    return (x, y): boolean => (math.abs(y - ((m * x) + b)) <= 16 && x >= lx && x <= hx) || (math.abs(x - ((b - y) / (-m))) <= 16 && y >= ly && y <= hy);
  };

  let renderGalaxyMap = (nodeId: number, now: number, delta: number) =>
  {
    let [rx, ry] = node_position[nodeId];
    for (let [x, y] of background_stars)
    {
      pushQuad(rx + x, ry + y, 1, 1);
    }
  };

  ////////////////////////

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
            _index: stars.length,
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
}