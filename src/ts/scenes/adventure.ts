import { CONTRACT_BOUNTIES, CURRENCY_MATERIALS_INCOMING, CURRENCY_RESEARCH_INCOMING, ENGINES, HULL, MINING_LASERS, SCANNERS, SHIELDS, WEAPONS, currentHull, deathReset, gameState, hurtPlayer, maxAvailablePower, maxHull, quamtumLeap, saveGame, softReset } from "../game-state";
import { ENC_ANOMALY, ENC_ASTEROID, ENC_PIRATE, ENC_SPACE_BEAST, ENC_STATION } from "../gameplay/encounters";
import { GREY_111, GREY_666, HULL_RED, POWER_GREEN, SHIELD_BLUE, WHITE } from "../colour";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "../screen";
import { TAG_ENTITY_NONE, TAG_ENTITY_PLAYER_SHIP, createEntityNode, updateEntityNode } from "../nodes/entity-node";
import { TAG_LOWER_POWER, TAG_RAISE_POWER, createNode, moveNode, nodeSize, node_enabled, node_interactive, node_tag } from "../scene-node";
import { beastDieSound, hullHitSound, qDriveSound, scanSound, shipDieSound, shootSound, zzfxP } from "../zzfx";
import { createHUDNode, updateHUDNode } from "../nodes/hud-node";
import { createProgressBarNode, updateProgressBarNode } from "../nodes/progress-bar-node";
import { createRangeIndicator, updateRangeIndicator } from "../nodes/range-indicator";
import { createSegmentedBarNode, updateSegmentedBarNode } from "../nodes/segmented-bar-node";
import { txt_available_power, txt_exit_system, txt_hull, txt_menu, txt_not_installed, txt_shields, txt_visit_station } from "../text";

import { GameMenu } from "./game-menu";
import { MissionSelect } from "./mission-select";
import { Station } from "./station";
import { assert } from "../debug";
import { createButtonNode } from "../nodes/button-node";
import { createCurrencyGroupNode } from "../nodes/currency-group-node";
import { createTextNode } from "../nodes/text-node";
import { inputContext } from "../input";
import { math } from "../math";
import { pushScene } from "../scene";
import { systemNames } from "../gameplay/systems";

export namespace Adventure
{
  export const _sceneId = 2;

  const MINUS_BUTTON = 0;
  const PLUS_BUTTON = 1;
  const POWER_BAR = 2;
  const PROGRESS_BAR = 3;
  const DISABLED_TEXT = 4;

  let hullBar: number;

  let shieldContainer: number;
  let shieldBar: number;
  let shieldTimer: number = 0;
  let SHIELD_COOLDOWN = 2500;

  let systems: number[][] = [];
  let systemCoooldowns = [-1, 1500, 1250, 1000, 750];
  let systemProgress = [0, 0, 0, 0, 0];

  let maxPowerBar: number;

  let playerRange: number;
  let RANGE_BASE_WIDTH = 128;
  let RANGE_INCREMENT = 8;
  let rangeWidth = RANGE_BASE_WIDTH;

  let entityPool: number[] = [];
  let hudWindows: number[] = [];

  let menuButton: number;

  let stationButton: number;
  let leaveButton: number;

  export let _setup = (): number =>
  {
    let rootId = createNode();
    nodeSize(rootId, SCREEN_WIDTH, SCREEN_HEIGHT);

    ////////////////////////////////////////

    // Populate an entity pool, I think at most 3 are on screen, maybee a max of 5 active when you add in the gutters.
    // 10 used to make sure the stars don't align and cause us to have none available.
    for (let i = 0; i < 10; i++)
    {
      entityPool[i] = createEntityNode(rootId, 480, SCREEN_CENTER_Y - 40);
    }

    ////////////////////////////////////////

    createTextNode(rootId, txt_hull, 2, 2);
    hullBar = createSegmentedBarNode(rootId, 2, 12, HULL_RED, 16, 4, 4);

    ////////////////////////////////////////

    shieldContainer = createNode(rootId);
    moveNode(shieldContainer, 2, 30);

    createTextNode(shieldContainer, txt_shields);
    shieldBar = createSegmentedBarNode(shieldContainer, 0, 10, SHIELD_BLUE, 34, 1, 0);

    ////////////////////////////////////////
    // NOTE(dbrad): This is where I set up the system power allocation per system
    for (let i = 0; i < 5; i++)
    {
      systems[i] = [];
      let systemContainer = createNode(rootId);
      moveNode(systemContainer, 0, 75 + (52 * i));
      nodeSize(systemContainer, 100, 30);

      let minusButton = createButtonNode(systemContainer, "-", 26, 26, 2);
      node_tag[minusButton] = TAG_LOWER_POWER;
      systems[i][MINUS_BUTTON] = minusButton;

      let plusButton = createButtonNode(systemContainer, "+", 26, 26, 30);
      node_tag[plusButton] = TAG_RAISE_POWER;
      systems[i][PLUS_BUTTON] = plusButton;

      createTextNode(systemContainer, systemNames[i], 58, 1, { _colour: GREY_111 });

      createTextNode(systemContainer, systemNames[i], 58, 0);

      let notInstalledText = createTextNode(systemContainer, txt_not_installed, 58, 14, { _colour: GREY_666 });
      systems[i][DISABLED_TEXT] = notInstalledText;

      systems[i][POWER_BAR] = createSegmentedBarNode(systemContainer, 58, 10, POWER_GREEN, 8, 1, 0);

      if (i !== ENGINES)
      {
        systems[i][PROGRESS_BAR] = createProgressBarNode(systemContainer, 2, 28, POWER_GREEN, 100);
      }
    }

    ////////////////////////////////////////

    createTextNode(rootId, txt_available_power, 2, 332);
    maxPowerBar = createSegmentedBarNode(rootId, 2, 342, POWER_GREEN, 8, 3, 3);

    ////////////////////////////////////////

    playerRange = createRangeIndicator(rootId, SCREEN_CENTER_X, SCREEN_CENTER_Y - 84, 0x99FFFFFF, rangeWidth);

    ////////////////////////////////////////

    createCurrencyGroupNode(rootId, 217, 0);

    menuButton = createButtonNode(rootId, txt_menu, 70, 28, SCREEN_WIDTH - 72);

    ////////////////////////////////////////

    for (let h = 0; h < 3; h++)
    {
      hudWindows[h] = (createHUDNode(rootId, 192, SCREEN_CENTER_Y + 44 * (h + 1)));
    }

    ////////////////////////////////////////

    stationButton = createButtonNode(rootId, txt_visit_station, 160, 80, SCREEN_WIDTH - 162, SCREEN_HEIGHT - 82);

    ////////////////////////////////////////

    leaveButton = createButtonNode(rootId, txt_exit_system, 160, 80, SCREEN_WIDTH - 162, SCREEN_HEIGHT - 82);

    ////////////////////////////////////////

    createEntityNode(rootId, SCREEN_CENTER_X - 16, SCREEN_CENTER_Y - 40, TAG_ENTITY_PLAYER_SHIP);

    return rootId;
  };

  let systemAffected = -1;
  let shipMovementTimer = 0;
  let shipDistance = [0, 1, 2, 3, 4];
  let stopped = false;
  let entityTimer = 0;
  let saveTimer = 0;

  export let _update = (now: number, delta: number): void =>
  {
    saveTimer += delta;
    if (saveTimer > 5000) { saveTimer = 0; saveGame(); }

    node_enabled[stationButton] = false;
    node_enabled[leaveButton] = false;

    let buttonFired = inputContext._fire;
    let systemLevels = gameState.d;

    if (systemLevels[HULL][0] === 0)
    {
      zzfxP(qDriveSound);
      deathReset();
      saveGame();
      pushScene(MissionSelect._sceneId, 1000, WHITE);
    }
    else if (buttonFired === stationButton)
    {
      pushScene(Station._sceneId);
    }
    else if (buttonFired === leaveButton)
    {
      softReset();
      gameState.i = gameState.j;
      gameState.j = -1;
      systemLevels[ENGINES][0] = 1;
      saveGame();
      pushScene(MissionSelect._sceneId);
    }
    else if (buttonFired === menuButton)
    {
      pushScene(GameMenu._sceneId);
    }
    else
    {
      //#region SHIP MOVEMENET
      shipMovementTimer += delta;
      entityTimer += delta;
      if (shipMovementTimer >= 16 && !stopped)
      {
        shipMovementTimer -= 16;
        gameState.k += shipDistance[systemLevels[ENGINES][0]];
      }
      stopped = false;
      //#endregion SHIP MOVEMENET

      //#region Systems
      if (buttonFired === systems[ENGINES][PLUS_BUTTON] || buttonFired === systems[ENGINES][MINUS_BUTTON])
      {
        systemAffected = ENGINES;
      }
      else if (buttonFired === systems[SHIELDS][PLUS_BUTTON] || buttonFired === systems[SHIELDS][MINUS_BUTTON])
      {
        systemAffected = SHIELDS;
      }
      else if (buttonFired === systems[SCANNERS][PLUS_BUTTON] || buttonFired === systems[SCANNERS][MINUS_BUTTON])
      {
        systemAffected = SCANNERS;
      }
      else if (buttonFired === systems[MINING_LASERS][PLUS_BUTTON] || buttonFired === systems[MINING_LASERS][MINUS_BUTTON])
      {
        systemAffected = MINING_LASERS;
      }
      else if (buttonFired === systems[WEAPONS][PLUS_BUTTON] || buttonFired === systems[WEAPONS][MINUS_BUTTON])
      {
        systemAffected = WEAPONS;
      }

      if (systemAffected !== -1)
      {
        if ((node_tag[buttonFired] === TAG_LOWER_POWER) && systemLevels[systemAffected][0] > 0)
        {
          systemLevels[systemAffected][0] -= 1;
          gameState.c += 1;
          if (systemAffected === SHIELDS)
          {
            gameState.b = math.min(gameState.b, systemLevels[SHIELDS][0]);
          }
        }

        if ((node_tag[buttonFired] === TAG_RAISE_POWER) && systemLevels[systemAffected][0] < systemLevels[systemAffected][1] && gameState.c > 0)
        {
          systemLevels[systemAffected][0] += 1;
          gameState.c -= 1;
        }
      }
      systemAffected = -1;

      updateSegmentedBarNode(hullBar, maxHull(), currentHull());
      updateSegmentedBarNode(shieldBar, systemLevels[SHIELDS][0], gameState.b);
      node_enabled[shieldContainer] = systemLevels[SHIELDS][0] > 0;

      updateSegmentedBarNode(maxPowerBar, maxAvailablePower(), gameState.c);

      for (let i = 0; i < 5; i++)
      {
        let systemEnabled = systemLevels[i][1] > 0;
        node_enabled[systems[i][POWER_BAR]] = systemEnabled;
        node_enabled[systems[i][PROGRESS_BAR]] = systemEnabled;
        node_enabled[systems[i][DISABLED_TEXT]] = !systemEnabled;
        node_interactive[systems[i][PLUS_BUTTON]] = systemEnabled;
        node_interactive[systems[i][MINUS_BUTTON]] = systemEnabled;

        updateSegmentedBarNode(systems[i][POWER_BAR], systemLevels[i][1], systemLevels[i][0]);
        if ((i === WEAPONS || i === SCANNERS || i === MINING_LASERS))
        {
          if (systemProgress[i] > 100)
          {
            systemProgress[i] = 0;
          }
          else if (systemLevels[i][0] > 0)
          {
            systemProgress[i] = math.min(100, systemProgress[i] + (delta / systemCoooldowns[systemLevels[i][0]]) * 100);
          }
          else
          {
            systemProgress[i] = 0;
          }
          updateProgressBarNode(systems[i][PROGRESS_BAR], systemProgress[i]);
        }
      }
      //#endregion Systems

      //#region Window of Oppertunity
      rangeWidth = RANGE_BASE_WIDTH + (RANGE_INCREMENT * systemLevels[SCANNERS][0]);
      updateRangeIndicator(playerRange, rangeWidth);
      //#endregion Window of Oppertunity

      //#region Entities / Encounters
      let entityIndex = 0;
      let hudIndex = 0;
      node_enabled[hudWindows[0]] = false;
      node_enabled[hudWindows[1]] = false;
      node_enabled[hudWindows[2]] = false;

      for (let encounter of gameState.l)
      {
        // Check if an encounter in onscreenish
        assert(encounter.e !== undefined, `No position for encounter`);
        if (
          (
            (encounter.b === ENC_ASTEROID && encounter.d < 3)
            || encounter.b === ENC_PIRATE
            || encounter.b === ENC_SPACE_BEAST
          )
          && entityTimer >= 16)
        {
          encounter.e--;
        }

        if (encounter.e > gameState.k - 520 && encounter.e < gameState.k + 520)
        {
          if (encounter.k && !encounter.j)
          {
            updateEntityNode(entityPool[entityIndex], TAG_ENTITY_NONE);
          }
          else
          {
            updateEntityNode(entityPool[entityIndex], encounter.b, encounter.a, { _scale: encounter.d, _colour: encounter.g, _range: encounter.l });
            let position = (SCREEN_CENTER_X - 16) + (encounter.e - gameState.k);
            moveNode(entityPool[entityIndex], position, SCREEN_CENTER_Y - 40 + encounter.f);
          }
          entityIndex++;
        }

        if (encounter.b === ENC_ANOMALY && encounter.e - gameState.k <= 0)
        {
          stopped = true;
          gameState.i = gameState.j;
          gameState.j = -1;
          quamtumLeap();
          systemLevels[ENGINES][0] = 1;
          return;
        }

        // Check if in range and alive if it has HP
        if (encounter.e + 16 * (encounter.d || 1) > gameState.k - rangeWidth + 16
          && encounter.e < gameState.k + rangeWidth + 16
          && (!encounter.k || (encounter.k && encounter.j)))
        {
          if (hudIndex < hudWindows.length)
          {
            updateHUDNode(hudWindows[hudIndex], encounter);
            hudIndex++;
          }

          // NOTE(dbrad): STATION
          if (encounter.b === ENC_STATION)
          {
            if (encounter.o)
            {
              node_enabled[leaveButton] = true;

              if (encounter.e - gameState.k <= 16)
              {
                stopped = true;
              }
            }
            else 
            {
              node_enabled[stationButton] = true;
            }
          }

          let currency = gameState.e;
          // NOTE(dbrad): MINABLE
          if (encounter.i && systemProgress[MINING_LASERS] === 100)
          {
            systemProgress[MINING_LASERS]++;
            let minerals = math.min(encounter.i, 13);
            encounter.i -= minerals;
            currency[CURRENCY_MATERIALS_INCOMING] += minerals;
            zzfxP(shootSound);
          }

          // NOTE(dbrad): RESARCHABLE
          if (encounter.h && systemProgress[SCANNERS] === 100 && (!encounter.k || (encounter.k && encounter.j)))
          {
            systemProgress[SCANNERS]++;
            let data = math.min(encounter.h, 8);
            encounter.h -= data;
            currency[CURRENCY_RESEARCH_INCOMING] += data;
            zzfxP(scanSound);
          }

          // NOTE(dbrad): COMBAT
          if (encounter.j && encounter.j > 0 && systemProgress[WEAPONS] === 100)
          {
            systemProgress[WEAPONS]++;
            encounter.j = math.max(0, encounter.j - 1);
            if (encounter.j === 0)
            {
              if (encounter.b === ENC_SPACE_BEAST)
              {
                zzfxP(beastDieSound);
              }
              else
              {
                zzfxP(shipDieSound);
              }

              for (let contract of gameState.h)
              {
                if (contract.c === CONTRACT_BOUNTIES)
                {
                  assert(contract.g !== undefined, "Bounty contract with no _bountiesCollected");
                  assert(contract.f !== undefined, "Bounty contract with no _bountiesRequired");
                  contract.g = math.min(contract.f, contract.g + 1);
                }
              }

              if (encounter.n)
              {
                currency[encounter.n[1]] += encounter.n[0];
              }
            }
            zzfxP(shootSound);
          }

          if (encounter.l)
          {
            let encounterMiddle = encounter.e + encounter.d * 8;
            if (gameState.k + 32 > encounterMiddle - encounter.l
              && gameState.k < encounterMiddle + encounter.l)
            {
              assert(encounter.m !== undefined, `hazard range with no attack setup`);
              encounter.m[0] += delta;
              if (encounter.m[0] >= encounter.m[1])
              {
                encounter.m[0] = 0;
                hurtPlayer();
                zzfxP(hullHitSound);
              }
            }
          }
        }
      }

      for (let e = entityIndex; e < 10; e++)
      {
        updateEntityNode(entityPool[entityIndex], TAG_ENTITY_NONE);
      }

      if (entityTimer >= 16)
      {
        entityTimer -= 16;
      }
      //#endregion Entities / Encounters

      //#region SHIELDS
      // NOTE(david): We only increment the sheild cooldown is the current shield value is lower than the max.
      if (gameState.b < systemLevels[SHIELDS][0])
      {
        shieldTimer += delta;
      }
      else
      {
        shieldTimer = 0;
      }

      if (shieldTimer > SHIELD_COOLDOWN)
      {
        shieldTimer -= SHIELD_COOLDOWN;
        if (gameState.b < systemLevels[SHIELDS][0])
        {
          gameState.b += 1;
        }
      }
      updateProgressBarNode(systems[SHIELDS][PROGRESS_BAR], shieldTimer / SHIELD_COOLDOWN * 100);
      //#endregion SHIELDS
    };
  };
}