import { CURRENCY_CREDITS_INCOMING, CURRENCY_RESEARCH_INCOMING, gameState, qDriveCosts, qReset, softReset } from "../game-state";
import { ENC_ANOMALY, ENC_ASTEROID, ENC_PIRATE, ENC_SPACE_BEAST, ENC_STAR, ENC_STATION, Encounter, Planet, STATUS_CIVILIZED, STATUS_LAWLESS, STATUS_NEUTRAL, Star } from "../gameplay/encounters";
import { GAS_PLANET_COLOURS, ROCK_PLANET_COLOURS, SPACE_BEAST_PURPLE, STAR_COLOURS, WHITE } from "../colour";
import { SCREEN_CENTER_X, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { SPRITE_SHIELD, SPRITE_STAR } from "../texture";
import { addChildNode, createNode, moveNode, node_enabled, node_interactive, node_position, node_render_function, node_size } from "../scene-node";
import { buttonSound, qDriveSound, zzfxP } from "../zzfx";
import { createTextNode, updateTextNode } from "../nodes/text-node";
import { generateSRand, rand } from "../random";
import { txt_asteroid, txt_empty_string, txt_menu, txt_pirate_ship, txt_quantum_anomaly, txt_space_beast, txt_station } from "../text";

import { Adventure } from "./adventure";
import { GameMenu } from "./game-menu";
import { Station } from "./station";
import { createButtonNode } from "../nodes/button-node";
import { createCurrencyGroupNode } from "../nodes/currency-group-node";
import { createSpriteNode } from "../nodes/sprite-node";
import { createWindowNode } from "../nodes/window-node";
import { inputContext } from "../input";
import { math } from "../math";
import { pushQuad } from "../draw";
import { pushScene } from "../scene";
import { v2 } from "../v2";

export namespace MissionSelect
{
  export const _sceneId = 1;

  let menuButton: number;

  let completeContractButton: number;
  let departButton: number;
  let stationButton: number;

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


    mapWindow = createWindowNode(300, 300, 170, 44);
    addChildNode(rootId, mapWindow);

    let galaxyArt = createNode();
    node_render_function[galaxyArt] = renderGalaxyMapArt;
    addChildNode(mapWindow, galaxyArt);

    playerLocationIndicator = createSpriteNode(SPRITE_SHIELD, { _scale: 2 });
    addChildNode(mapWindow, playerLocationIndicator);
    node_interactive[playerLocationIndicator] = false;

    selectedStarIndicator = createSpriteNode(SPRITE_SHIELD, { _scale: 2 });
    moveNode(selectedStarIndicator, 999, 999);
    addChildNode(mapWindow, selectedStarIndicator);
    node_interactive[selectedStarIndicator] = false;


    let leftPanel = createWindowNode(154, 300, 6, 44);
    addChildNode(rootId, leftPanel);

    selected_system_label = createTextNode(txt_empty_string);
    addChildNode(leftPanel, selected_system_label);


    let rightPanel = createWindowNode(154, 60, 480, 44);
    addChildNode(rootId, rightPanel);

    current_system_label = createTextNode(txt_empty_string);
    addChildNode(rightPanel, current_system_label);

    completeContractButton = createButtonNode("complete contract", [162, 78]);
    moveNode(completeContractButton, 476, 110);
    addChildNode(rootId, completeContractButton);

    stationButton = createButtonNode("upgrade ship", [162, 78]);
    moveNode(stationButton, 476, 190);
    addChildNode(rootId, stationButton);

    departButton = createButtonNode("depart", [162, 78]);
    moveNode(departButton, 476, 270);
    addChildNode(rootId, departButton);

    return rootId;
  };

  let starsToGenerate: [Star, number][] = [];

  export let _update = (now: number, delta: number): void =>
  {
    if (stars.length === 0) generateGalaxy();
    let ps = stars[gameState._currentPlayerSystem];
    moveNode(playerLocationIndicator, ps._x - 8, ps._y - 8);
    node_interactive[completeContractButton] = false;
    node_interactive[departButton] = selectedStarIndex > -1;

    if (inputContext._fire === menuButton)
    {
      pushScene(GameMenu._sceneId);
    }
    else if (inputContext._fire === stationButton)
    {
      pushScene(Station._sceneId);
    }
    else if (inputContext._fire === departButton && selectedStarIndex !== -1)
    {
      softReset();
      generateAdventure();
      pushScene(Adventure._sceneId);
    }
    else
    {
      let currentSystemDescription = `current system\n\nFname ${ ps._name }\nFlaw ${ lawDescription(ps._civStatus) }\nFcontract none`;
      updateTextNode(current_system_label, currentSystemDescription);
      let distance = (x: number, y: number) => math.floor(math.hypot(x - ps._x, y - ps._y) * 250);
      let destinationDescription = "";
      for (let star of stars)
      {
        if (inputContext._fire === star._nodeId)
        {
          if (star._nodeId === ps._nodeId) break;
          zzfxP(buttonSound);
          selectedStarIndex = star._index;
          starsToGenerate = [];

          starsToGenerate.push([ps, distance(ps._x, ps._y)]);

          let validator = getValidatorForPoints(ps._x, ps._y, star._x, star._y);

          // look for stars between the origin and destination
          for (let searchStar of stars)
          {
            if (searchStar._nodeId === ps._nodeId || star._nodeId === searchStar._nodeId) continue;
            if (validator(searchStar._x, searchStar._y))
            {
              starsToGenerate.push([searchStar, distance(searchStar._x, searchStar._y)]);
            }
          }
          starsToGenerate.push([star, distance(star._x, star._y)]);
          moveNode(selectedStarIndicator, star._x - 8, star._y - 8);
        }
      }
      if (selectedStarIndex > -1)
      {
        let star = stars[selectedStarIndex];
        destinationDescription += `target system\n\nFname ${ star._name }\nFdistance ${ distance(star._x, star._y) }\nFlaw ${ lawDescription(star._civStatus) }\n\n---\n\n`;
      }
      destinationDescription += `contracts\n\n`;
      destinationDescription += `Fsystem aa 12345\nFtype   mining\nFstatus 0 of 50\nFreward 200\n\n`;
      destinationDescription += `Fsystem aa 12345\nFtype   delivery\nFstatus 0 of \nFreward 200\n\n`;
      destinationDescription += `Fsystem aa 12345\nFtype   research\nFstatus 0 of 64\nFreward 200\n\n`;
      destinationDescription += `Fsystem aa 12345\nFtype   bounty\nFstatus 0 of 3\nFreward 200\n\n`;
      updateTextNode(selected_system_label, destinationDescription);
    }
  };

  let lawDescription = (law: number): string => law === STATUS_CIVILIZED ? "Gcivilized" : law === STATUS_NEUTRAL ? "neutral" : "Rlawless";

  ////////////////////////

  let renderGalaxyMapArt = (nodeId: number, now: number, delta: number) =>
  {
    let [rx, ry] = node_position[nodeId];
    for (let [x, y] of background_stars)
    {
      pushQuad(rx + x, ry + y, 1, 1);
    }
  };

  ////////////////////////

  let getValidatorForPoints = (x1: number, y1: number, x2: number, y2: number): (x: number, y: number) => boolean =>
  {
    let b = -(((x1 * y2) - (x2 * y1)) / (x2 - x1));
    let m = (y2 - y1) / (x2 - x1);
    let [lx, hx] = (x1 < x2 ? [x1, x2] : [x2, x1]);
    let [ly, hy] = (y1 < y2 ? [y1, y2] : [y2, y1]);
    return (x, y): boolean => (math.abs(y - ((m * x) + b)) <= 16 && x >= lx && x <= hx) || (math.abs(x - ((b - y) / (-m))) <= 16 && y >= ly && y <= hy);
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
          let planetLetter = `a`;
          let generatePlanets = (numberOfPlanets: number): Planet[] =>
          {
            let result: Planet[] = [];
            for (let p = 0; p < numberOfPlanets; p++)
            {
              let type = srand(2, 3);
              result.push({
                _type: type,
                _name: `${ letters } ${ number }${ planetLetter }`,
                _colour: type === 2 ? GAS_PLANET_COLOURS[srand(0, 2)] : ROCK_PLANET_COLOURS[srand(0, 2)],
                _scale: type === 2 ? srand(5, 7) : srand(3, 5)
              });
              planetLetter = scc(planetLetter.charCodeAt(0) + 1);
            }
            return result;
          };
          let beforePlanets: Planet[] = generatePlanets(srand(1, 2));
          let afterPlanets: Planet[] = generatePlanets(srand(1, 2));
          let colour = STAR_COLOURS[srand(0, 2)];

          let star = createSpriteNode(SPRITE_STAR, { _colour: colour });
          moveNode(star, pX, pY);
          addChildNode(mapWindow, star);

          stars.push({
            _index: stars.length,
            _nodeId: star,
            _name: `${ letters } ${ number++ }`,
            _colour: colour,
            _scale: srand(9, 12),
            _x: pX,
            _y: pY,
            _beforePlanets: beforePlanets,
            _afterPlanets: afterPlanets,
            _civStatus: STATUS_LAWLESS
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

  ////////////////////////


  let entityId: number;

  //#region Encounter Factories
  let createStation = (distance: number, exit: boolean = false): Encounter =>
  {
    return {
      _id: entityId++,
      _type: ENC_STATION,
      _position: distance,
      _title: txt_station,
      _yOffset: rand(-30, 30),
      _scale: 3,
      _exit: exit
    };
  };

  let createStar = (star: Star, distance: number): Encounter =>
  {
    let cd = 1500;
    return {
      _id: entityId++,
      _type: ENC_STAR,
      _position: distance,
      _title: star._name,
      _yOffset: rand(-60, 10),
      _researchable: true,
      _colour: star._colour,
      _scale: star._scale,
      _hazardRange: star._scale * 8 + 16,
      _attack: [0, cd],
    };
  };

  let createPlanet = (planet: Planet, distance: number): Encounter =>
  {
    return {
      _id: entityId++,
      _type: planet._type,
      _position: distance,
      _title: planet._name,
      _colour: planet._colour,
      _scale: planet._scale,
      _yOffset: rand(-40, 30),
      _researchable: true,
      _minable: true
    };
  };

  let createRoguePlanet = (distance: number): Encounter =>
  {
    let type = rand(2, 3);
    return {
      _id: entityId++,
      _type: type,
      _position: distance,
      _title: `rogue planet`,
      _colour: type === 2 ? GAS_PLANET_COLOURS[rand(0, 2)] : ROCK_PLANET_COLOURS[rand(0, 2)],
      _scale: type === 2 ? rand(5, 7) : rand(3, 5),
      _yOffset: rand(-40, 30),
      _researchable: true,
      _minable: true
    };
  };

  let createAsteroid = (distance: number): Encounter =>
  {
    return {
      _id: entityId++,
      _type: ENC_ASTEROID,
      _position: distance,
      _title: txt_asteroid,
      _yOffset: rand(-50, 50),
      _minable: true,
      _scale: rand(1, 2)
    };
  };

  let hpLevel = [3, 4, 5];
  let createPirate = (distance: number, threatLevel: number = 0): Encounter =>
  {
    let cd = 1500 - (250 * threatLevel);
    return {
      _id: entityId++,
      _type: ENC_PIRATE,
      _position: distance,
      _title: txt_pirate_ship,
      _yOffset: rand(-30, 30),
      _maxHp: hpLevel[threatLevel],
      _hp: hpLevel[threatLevel],
      _bounty: [rand(100, 200) * (threatLevel + 1), CURRENCY_CREDITS_INCOMING],
      _hazardRange: 96,
      _attack: [0, cd]
    };
  };

  let createSpaceBeast = (distance: number, threatLevel: number = 0): Encounter =>
  {
    let cd = 1250 - (250 * threatLevel);
    return {
      _id: entityId++,
      _type: ENC_SPACE_BEAST,
      _position: distance,
      _title: txt_space_beast,
      _yOffset: rand(-30, 30),
      _colour: SPACE_BEAST_PURPLE,
      _researchable: true,
      _maxHp: hpLevel[threatLevel],
      _hp: hpLevel[threatLevel],
      _hazardRange: 48,
      _attack: [0, cd],
      _bounty: [rand(100, 200) * (threatLevel + 1), CURRENCY_RESEARCH_INCOMING],
      _scale: 3
    };
  };

  let createAnomaly = (distance: number): Encounter =>
  {
    return {
      _id: entityId++,
      _type: ENC_ANOMALY,
      _position: distance,
      _title: txt_quantum_anomaly,
      _yOffset: rand(-30, 30),
      _scale: 3,
      _exit: true
    };
  };
  //#endregion Encounter Factories

  let encounterInterval = 750;

  let generateAdventure = () =>
  {
    entityId = 0;
    let encounterDeck: Encounter[] = [];
    let currentDistance = 0;
    let i = 1;

    for (let [index, [star, distance]] of starsToGenerate.entries())
    {
      if (currentDistance > 0)
      {
        let nextDistance = currentDistance + encounterInterval * i + rand(200, 550);
        while (nextDistance + 160 <= distance - (encounterInterval + star._beforePlanets.length * encounterInterval))
        {
          if (rand(0, 1) === 0)
          {
            encounterDeck.push(createAsteroid(nextDistance));
          }
          else
          {
            encounterDeck.push(createRoguePlanet(nextDistance));
          }
          i++;
          nextDistance = currentDistance + encounterInterval * i + rand(200, 550);
        }
      }
      i = 2;
      for (let planet of star._beforePlanets)
      {
        encounterDeck.push(createPlanet(planet, distance - (encounterInterval * i) - rand(200, 550)));
        i++;
      }

      encounterDeck.push(createStar(star, distance));
      if (gameState._shipPosition === 0) gameState._shipPosition = distance + star._scale * 16 + 240;
      encounterDeck.push(createStation(distance + star._scale * 16 + 160, index === starsToGenerate.length - 1));

      i = 2;
      for (let planet of star._afterPlanets)
      {
        let planetDistance = distance + (encounterInterval * i) + rand(130, 370);
        encounterDeck.push(createPlanet(planet, planetDistance));
        i++;
        currentDistance = distance + encounterInterval * i;
      }
    }

    for (let d = 2000; d < currentDistance; d += 1000)
    {
      let postion = d + rand(-250, 250);
      if (d % 2000 === 0)
      {
        encounterDeck.push(createAsteroid(postion));
      }
      else if (d % 7000 === 0)
      {
        encounterDeck.push(createSpaceBeast(postion));
      }
      else
      {
        encounterDeck.push(createPirate(postion));
      }
    }

    gameState._adventureEncounters = encounterDeck;
  };
};