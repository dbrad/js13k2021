import { CONTRACT_ANOMALY, CONTRACT_BOUNTIES, CONTRACT_DELIVERY, CONTRACT_MINING, CONTRACT_RESEARCH, CURRENCY_CREDITS, CURRENCY_CREDITS_INCOMING, CURRENCY_MATERIALS, CURRENCY_RESEARCH, CURRENCY_RESEARCH_INCOMING, Contract, gameState, saveGame, softReset } from "../game-state";
import { ENC_ANOMALY, ENC_ASTEROID, ENC_PIRATE, ENC_SPACE_BEAST, ENC_STAR, ENC_STATION, Encounter, Planet, STATUS_LAWLESS, Star } from "../gameplay/encounters";
import { GAS_PLANET_COLOURS, GREY_111, GREY_999, Q_DRIVE_PURPLE, ROCK_PLANET_COLOURS, SPACE_BEAST_PURPLE, STAR_COLOURS, WHITE } from "../colour";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { SPRITE_SHIELD, SPRITE_STAR } from "../texture";
import { buttonSound, qDriveSound, zzfxP } from "../zzfx";
import { createButtonNode, updateButtonNode } from "../nodes/button-node";
import { createNode, moveNode, nodeSize, node_interactive, node_position, node_render_function } from "../scene-node";
import { createSpriteNode, updateSpriteNode } from "../nodes/sprite-node";
import { createTextNode, updateTextNode } from "../nodes/text-node";
import { generateSRand, rand } from "../random";
import { txt_asteroid, txt_empty_string, txt_menu, txt_pirate_ship, txt_quantum_anomaly, txt_space_beast, txt_station } from "../text";

import { Adventure } from "./adventure";
import { GameMenu } from "./game-menu";
import { Station } from "./station";
import { assert } from "../debug";
import { createCurrencyGroupNode } from "../nodes/currency-group-node";
import { createWindowNode } from "../nodes/window-node";
import { inputContext } from "../input";
import { math } from "../math";
import { pushQuad } from "../draw";
import { pushScene } from "../scene";
import { setDialogText } from "./dialog";
import { v2 } from "../v2";

export namespace MissionSelect
{
  export const _sceneId = 1;

  let menuButton: number;

  let completeContractButton: number;
  let stationButton: number;
  let jumpButton: number;
  let departButton: number;

  let mapWindow: number;
  let starNodes: number[] = [];

  let background_stars: v2[] = [];
  let stars: Star[] = [];
  let contractIndicators: number[] = [];

  let selected_system_label: number;
  let current_system_label: number;

  let selectedStarIndicator: number;
  let playerLocationIndicator: number;

  export let _setup = (): number =>
  {
    let rootId = createNode();
    nodeSize(rootId, SCREEN_WIDTH, SCREEN_HEIGHT);

    createCurrencyGroupNode(rootId, 217, 0);

    menuButton = createButtonNode(rootId, txt_menu, 70, 28, SCREEN_WIDTH - 72);

    mapWindow = createWindowNode(rootId, 300, 300, 170, 44);

    let galaxyArt = createNode(mapWindow);
    node_render_function[galaxyArt] = renderGalaxyMapArt;

    for (let s = 0; s < 20; s++)
    {
      starNodes[s] = createSpriteNode(mapWindow, SPRITE_STAR, SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    for (let i = 0; i < 4; i++)
    {
      contractIndicators[i] = createTextNode(mapWindow, "!", SCREEN_WIDTH, SCREEN_HEIGHT, { _colour: GREY_111, _scale: 2 });
    }

    playerLocationIndicator = createSpriteNode(mapWindow, SPRITE_SHIELD, SCREEN_WIDTH, SCREEN_HEIGHT, { _scale: 2, _colour: GREY_999 });
    node_interactive[playerLocationIndicator] = false;

    selectedStarIndicator = createSpriteNode(mapWindow, SPRITE_SHIELD, SCREEN_WIDTH, SCREEN_HEIGHT, { _scale: 2 });
    node_interactive[selectedStarIndicator] = false;


    let leftPanel = createWindowNode(rootId, 154, 300, 6, 44);

    selected_system_label = createTextNode(leftPanel, txt_empty_string);


    let rightPanel = createWindowNode(rootId, 154, 60, 480, 44);

    current_system_label = createTextNode(rightPanel, txt_empty_string);

    completeContractButton = createButtonNode(rootId, "complete contract", 162, 58, 476, 110);

    stationButton = createButtonNode(rootId, "upgrade ship", 162, 58, 476, 170);

    jumpButton = createButtonNode(rootId, txt_empty_string, 162, 58, 476, 230);

    departButton = createButtonNode(rootId, "depart", 162, 58, 476, 290);

    return rootId;
  };

  let starsToGenerate: [Star, number][] = [];
  let lastContractType = CONTRACT_BOUNTIES;
  export let _update = (now: number, delta: number): void =>
  {
    if (stars.length === 0) generateGalaxy();
    while (gameState.h.length < 4)
    {
      let starIndex: number;
      do
      {
        starIndex = rand(0, 19);
        // We don't want to add a contract onto a system that has one, or a system that will be a delivery destination or is where the player is already.
      } while (starIndex === gameState.i || gameState.h.some((contract) => contract.a === starIndex || (contract.i !== undefined && contract.i === starIndex)));

      let type: number;
      if (gameState.g >= (gameState.a + (2 ** gameState.a)))
      {
        type = CONTRACT_ANOMALY;
        setDialogText("special contract received!\nwe must uncover the secrets of these quantum anomalies!");
      }
      else
      {
        do { type = rand(0, 3); } while (type === lastContractType);
        lastContractType = type;
      }

      let generatorLevelAdjustment = gameState.a >= 2 ? gameState.a >= 4 ? 2 : 1 : 0;
      let contract: Contract;
      if (type === CONTRACT_MINING)
      {
        let amount = rand(25, 75) + generatorLevelAdjustment * 15;
        contract = {
          c: type,
          a: starIndex,
          b: amount * 4,
          d: amount,
        };
      }
      else if (type === CONTRACT_RESEARCH)
      {
        let amount = (rand(2, 6) + generatorLevelAdjustment) * 8;
        contract = {
          c: type,
          a: starIndex,
          b: amount * 5,
          e: amount,
        };
      }
      else if (type === CONTRACT_BOUNTIES)
      {
        let amount = rand(2, 4) + generatorLevelAdjustment;
        contract = {
          c: type,
          a: starIndex,
          b: amount * 200,
          f: amount,
          g: 0
        };
      }
      else if (type === CONTRACT_DELIVERY)
      {
        // Pick a destination that isn't the sender.
        let destinationId: number;
        do { destinationId = rand(0, stars.length - 1); } while (gameState.h.some((contract) => contract.a === starIndex) || starIndex == destinationId);
        let [x1, y1] = [stars[starIndex]._x, stars[starIndex]._y];
        let [x2, y2] = [stars[destinationId]._x, stars[destinationId]._y];
        let pay = math.floor((math.hypot(x2 - x1, y2 - y1) * 250) / 25);
        contract = {
          c: type,
          a: starIndex,
          b: pay,
          h: false,
          i: destinationId
        };
      }
      else
      {
        contract = {
          c: type,
          a: starIndex,
          b: 0
        };
      }
      gameState.h.push(contract);
      saveGame();
    }

    let ps = stars[gameState.i];
    let buttonFired = inputContext._fire;

    moveNode(playerLocationIndicator, ps._x - 8, ps._y - 8);
    node_interactive[completeContractButton] = false;
    node_interactive[departButton] = gameState.j > -1;
    node_interactive[jumpButton] = false;

    if (buttonFired === menuButton)
    {
      pushScene(GameMenu._sceneId);
    }
    else if (buttonFired === completeContractButton)
    {
      for (let [index, contract] of gameState.h.entries())
      {
        if (gameState.i === contract.a)
        {
          gameState.e[CURRENCY_CREDITS_INCOMING] += contract.b;
          gameState.g++;
          gameState.h.splice(index, 1);
          break;
        }
      }
      saveGame();
    }
    else if (buttonFired === stationButton)
    {
      pushScene(Station._sceneId);
    }
    else if (buttonFired === departButton && gameState.j !== -1)
    {
      softReset();
      generateAdventure();
      pushScene(Adventure._sceneId);
    }
    else
    {
      let distance = (x: number, y: number) => math.floor(math.hypot(x - ps._x, y - ps._y) * 250);
      let destinationDescription = txt_empty_string;
      for (let star of stars)
      {
        if (buttonFired === star._nodeId)
        {
          if (star._nodeId === ps._nodeId) break;
          zzfxP(buttonSound);
          gameState.j = star._index;
        }
      }

      if (gameState.j > -1)
      {
        let star = stars[gameState.j];
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

        let targetDistance = distance(star._x, star._y);
        let costToJump = math.floor(targetDistance / 100);
        destinationDescription += `target system\n\nFname ${ star._name }\nFdistance ${ targetDistance }\n\n---\n\n`;
        moveNode(selectedStarIndicator, star._x - 8, star._y - 8);

        let enoughCredits = gameState.e[CURRENCY_CREDITS] >= costToJump;
        let isAnomaly = isAnomalySystem(star);
        node_interactive[jumpButton] = enoughCredits && !isAnomaly;
        if (isAnomaly)
        {
          updateButtonNode(jumpButton, `jump gate\noffline`);
        }
        else if (enoughCredits)
        {
          updateButtonNode(jumpButton, `jump gate\n${ costToJump }cr`);
        }
        else
        {
          updateButtonNode(jumpButton, `jump gate\nR${ costToJump }cr`);
        }
        if (buttonFired === jumpButton)
        {
          gameState.e[CURRENCY_CREDITS] -= costToJump;
          gameState.i = gameState.j;
          gameState.j = -1;
          zzfxP(qDriveSound);
          pushScene(MissionSelect._sceneId, 750, WHITE);
        }
      }
      else
      {
        updateButtonNode(jumpButton, `jump gate`);
      }

      destinationDescription += `contracts\n\n`;
      let currentSystemContractText = "none";
      let i = 0;
      for (let contract of gameState.h)
      {
        let star = stars[contract.a];
        let [complete, text] = contractProgress(contract);
        let bump = contract.a === gameState.j ? " " : txt_empty_string;
        destinationDescription += `${ bump }Fsystem ${ star._name }\n${ bump }Ftype   ${ contractTypeName[contract.c] }\n${ bump }Fstatus ${ text }\n${ bump }Freward ${ contract.b === 0 ? "F-" : contract.b }\n\n`;
        if (contract.a === gameState.i)
        {
          if (contract.c === CONTRACT_DELIVERY && !contract.h)
          {
            contract.h = true;
            assert(contract.i !== undefined, "Delivery should have a destination");
            contract.a = contract.i;
          }
          node_interactive[completeContractButton] = complete;
          currentSystemContractText = complete ? "Gcomplete" : "Rincomplete";
        }
        moveNode(contractIndicators[i], star._x, star._y);
        i++;
      }
      updateTextNode(selected_system_label, destinationDescription);


      let currentSystemDescription = `current system\n\nFname ${ ps._name }\nFcontract ${ currentSystemContractText }`;
      updateTextNode(current_system_label, currentSystemDescription);
    };
    if (!gameState.m)
    {
      setDialogText("welcome newcomer!\n\ngather resources, complete contracts, upgrade your vessel, and help unravel the mysteries of our galaxy.");
      gameState.m = true;
    }
    else if (!gameState.n)
    {
      setDialogText("to get started select a nearby star from the star chart and depart on your first flight!");
      gameState.n = true;
    }
  };

  let contractTypeName = ["mining", "research", "bounties", "delivery", "anomaly"];

  let progressTextOf = (value01: number, value02: number, complete: boolean) =>
  {
    let colour: string = complete ? "G" : "R";
    return `${ colour }${ math.min(value01, value02) } ${ colour }of ${ colour }${ value02 } `;
  };
  let contractProgress = (contract: Contract): [boolean, string] =>
  {
    let result = txt_empty_string;
    let complete = false;
    if (contract.c === CONTRACT_MINING)
    {
      assert(contract.d !== undefined, "Mining contract with no _materialsRequired");
      complete = gameState.e[CURRENCY_MATERIALS] >= contract.d;
      result = progressTextOf(gameState.e[CURRENCY_MATERIALS], contract.d, complete);
    }
    else if (contract.c === CONTRACT_RESEARCH)
    {
      assert(contract.e !== undefined, "Data contract with no _dataRequired");
      complete = gameState.e[CURRENCY_RESEARCH] >= contract.e;
      result = progressTextOf(gameState.e[CURRENCY_RESEARCH], contract.e, complete);
    }
    else if (contract.c === CONTRACT_BOUNTIES)
    {
      assert(contract.g !== undefined, "Bounty contract with no _bountiesCollected");
      assert(contract.f !== undefined, "Bounty contract with no _bountiesRequired");
      complete = contract.g >= contract.f;
      result = progressTextOf(contract.g, contract.f, complete);
    }
    else if (contract.c === CONTRACT_DELIVERY)
    {
      if (!contract.h)
      {
        result = "Rpickup Rreq.";
      }
      else
      {
        result = "Genroute";
        complete = true;
      }
    }
    else
    {
      result = "investigate";
    }

    return [complete, result];
  };

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
    let [srandom, srand] = generateSRand(gameState.f);
    let letters = `${ scc(srand(97, 122)) + scc(srand(97, 122)) }`;
    let number = srand(10000, 99900);
    let rot = math.PI * srandom();
    let counter = 0;
    let i = 0;

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

          let star = starNodes[i];
          updateSpriteNode(star, SPRITE_STAR, { _colour: colour });
          moveNode(star, pX, pY);

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

          i++;
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
  let isAnomalySystem = (star: Star): boolean =>
  {
    for (let contract of gameState.h)
    {
      if (star._index === contract.a && contract.c === CONTRACT_ANOMALY)
      {
        return true;
      }
    }
    return false;
  };

  let entityId: number;

  //#region Encounter Factories
  let createStation = (distance: number, exit: boolean = false): Encounter =>
  {
    return {
      a: entityId++,
      b: ENC_STATION,
      e: distance,
      c: txt_station,
      f: rand(-30, 30),
      d: 3,
      o: exit
    };
  };

  let createStar = (star: Star, distance: number): Encounter =>
  {
    let cd = 1500;
    return {
      a: entityId++,
      b: ENC_STAR,
      e: distance,
      c: star._name,
      f: rand(-60, 10),
      h: 64,
      g: star._colour,
      d: star._scale,
      l: star._scale * 8 + 16,
      m: [0, cd],
    };
  };

  let createPlanet = (planet: Planet, distance: number): Encounter =>
  {
    return {
      a: entityId++,
      b: planet._type,
      e: distance,
      c: planet._name,
      g: planet._colour,
      d: planet._scale,
      f: rand(-40, 30),
      h: 32,
      i: rand(52, 65)
    };
  };

  let createRoguePlanet = (distance: number): Encounter =>
  {
    let type = rand(2, 3);
    return {
      a: entityId++,
      b: type,
      e: distance,
      c: `rogue planet`,
      g: type === 2 ? GAS_PLANET_COLOURS[rand(0, 2)] : ROCK_PLANET_COLOURS[rand(0, 2)],
      d: type === 2 ? rand(5, 7) : rand(3, 5),
      f: rand(-40, 30),
      h: 32,
      i: rand(52, 65)
    };
  };

  let createAsteroid = (distance: number, adjustment: number = 0): Encounter =>
  {
    return {
      a: entityId++,
      b: ENC_ASTEROID,
      e: distance,
      c: txt_asteroid,
      f: rand(-50, 50),
      i: rand(52, 65) + (adjustment * 13),
      d: rand(1, 2) + (adjustment * 2)
    };
  };

  let createPirate = (distance: number): Encounter =>
  {
    return {
      a: entityId++,
      b: ENC_PIRATE,
      e: distance,
      c: txt_pirate_ship,
      f: rand(-30, 30),
      k: 3 + powerBasedAdjustment,
      j: 3 + powerBasedAdjustment,
      n: [rand(100, 200), CURRENCY_CREDITS_INCOMING],
      l: 104,
      d: 2,
      m: [0, 1250 - (250 * powerBasedAdjustment)]
    };
  };

  let createSpaceBeast = (distance: number): Encounter =>
  {
    return {
      a: entityId++,
      b: ENC_SPACE_BEAST,
      e: distance,
      c: txt_space_beast,
      f: rand(-30, 30),
      g: SPACE_BEAST_PURPLE,
      h: 64,
      k: 3 + powerBasedAdjustment,
      j: 3 + powerBasedAdjustment,
      l: 64,
      m: [0, 750 - (125 * powerBasedAdjustment)],
      n: [rand(100, 200), CURRENCY_RESEARCH_INCOMING],
      d: 3
    };
  };

  let createAnomaly = (distance: number): Encounter =>
  {
    return {
      a: entityId++,
      b: ENC_ANOMALY,
      e: distance,
      c: txt_quantum_anomaly,
      f: rand(-30, 30),
      g: Q_DRIVE_PURPLE,
      d: 3,
      o: true
    };
  };
  //#endregion Encounter Factories

  let encounterInterval = 750;
  let powerBasedAdjustment = 0;

  let generateAdventure = () =>
  {
    entityId = 0;
    powerBasedAdjustment = gameState.a >= 4 ? 2 : gameState.a >= 2 ? 1 : 0;
    let encounterDeck: Encounter[] = [];
    let currentDistance = 0;
    let i = 1;

    for (let [index, [star, distance]] of starsToGenerate.entries())
    {
      if (currentDistance > 0)
      {
        let nextDistance = currentDistance + encounterInterval * i + rand(200, 550);
        while (nextDistance + 160 <= distance - (encounterInterval + (star._beforePlanets.length + 1) * encounterInterval))
        {
          if (rand(0, 1) === 0)
          {
            encounterDeck.push(createAsteroid(nextDistance, 1));
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
      if (gameState.k === 0) gameState.k = distance + star._scale * 16 + 240;

      let lastStar = index === starsToGenerate.length - 1;
      if (isAnomalySystem(star) && lastStar)
      {
        encounterDeck.push(createAnomaly(distance + star._scale * 16 + 160));
      }
      else
      {
        encounterDeck.push(createStation(distance + star._scale * 16 + 160, lastStar));
      }

      i = 2;
      for (let planet of star._afterPlanets)
      {
        let planetDistance = distance + (encounterInterval * i) + rand(130, 370);
        encounterDeck.push(createPlanet(planet, planetDistance));
        i++;
        currentDistance = distance + encounterInterval * i;
      }
    }

    for (let d = 2000; d < currentDistance + 10000; d += 1000)
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

    gameState.l = encounterDeck;
  };
};