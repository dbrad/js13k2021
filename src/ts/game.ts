import { AdventureScene, setupAdventure, updateAdventure } from "./scenes/adventure";
import { Align, createTextNode } from "./nodes/text-node";
import { ENGINES, gameState, initGameState } from "./game-state";
import { Interpolators, interpolate } from "./interpolate";
import { MainMenuScene, setupMainMenu, updateMainMenu } from "./scenes/main-menu";
import { MissionSelectScene, setupMissionSelect, updateMissionSelect } from "./scenes/mission-select";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "./screen";
import { StationScene, setupStation, updateStation } from "./scenes/station";
import { gl_clear, gl_flush, gl_getContext, gl_init, gl_setClear } from "./gl";
import { initStats, tickStats } from "./stats";
import { initializeInput, inputContext } from "./input";
import { moveNode, renderNode } from "./scene-node";
import { registerScene, renderScene, updateScene } from "./scene";

import { assert } from "./debug";
import { colourToHex } from "./colour";
import { loadSpriteSheet } from "./texture";
import { math } from "./math";
import { pushQuad } from "./draw";
import { rand } from "./random";
import { setupAudio } from "./zzfx";

window.addEventListener("load", async () =>
{
  document.title = "2D1D4X13K";
  let css = "margin:0;padding:0;background-color:#060606;width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;";
  document.documentElement.style.cssText = css;
  document.body.style.cssText = css;

  let stage = document.createElement("div");
  stage.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100vw*(9/16));max-height:100vh;width:100vw;";
  document.body.appendChild(stage);

  let canvas = document.createElement("canvas");
  canvas.style.cssText = "height:100%;image-rendering:optimizeSpeed;image-rendering:pixelated;";
  stage.appendChild(canvas);

  assert(canvas !== null, `Unable to find canvas element on index.html`);
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
  let context = gl_getContext(canvas);
  gl_init(context);
  await loadSpriteSheet();
  initStats();

  let delta: number;
  let then: number;

  let playing: boolean = false;
  let loadGame = () =>
  {
    playing = true;
    assert(canvas !== null, `Unable to find canvas element on index.html`);
    canvas.removeEventListener("pointerdown", loadGame);
    canvas.removeEventListener("touchstart", loadGame);

    initializeInput(canvas);
    initGameState();

    setupAudio();
    registerScene(MainMenuScene, setupMainMenu, updateMainMenu);
    registerScene(MissionSelectScene, setupMissionSelect, updateMissionSelect);
    registerScene(AdventureScene, setupAdventure, updateAdventure);
    registerScene(StationScene, setupStation, updateStation);

    makeStars();
  };

  canvas.addEventListener("pointerdown", loadGame);
  canvas.addEventListener("touchstart", loadGame);
  let touchToPlayId = createTextNode("touch to start", SCREEN_WIDTH, { _scale: 1, _textAlign: Align.C });
  moveNode(touchToPlayId, SCREEN_CENTER_X, SCREEN_CENTER_Y - 10);

  // x,y,z,timer
  let stars: [number, number, number, number][] = [];
  let makeStars = () =>
  {
    let totalStars = (math.floor(SCREEN_WIDTH / 72)) * (math.floor(SCREEN_HEIGHT / 72)) * 1;

    let randomX, randomY, randomZ;
    let sortable = [];
    for (let i = 0; i < totalStars; i++)
    {
      randomX = rand(1, SCREEN_WIDTH - 1);
      randomY = rand(1, SCREEN_HEIGHT - 1);
      randomZ = math.ceil(rand(1, 4));
      stars[i] = [randomX, randomY, randomZ, 0];
      sortable.push(randomZ);
    }
    sortable.sort();


    for (let i in stars)
    {
      stars[i][2] = sortable[i];
    }
  };

  let starSpeedTable = [
    [],
    [640, 512, 384, 256, 128],
    [480, 384, 288, 192, 96],
    [320, 256, 192, 128, 64],
    [160, 128, 96, 64, 32],
  ];
  let loop = (now: number): void =>
  {
    delta = now - then;
    then = now;
    gl_clear();

    if (playing)
    {
      for (let i in stars)
      {
        stars[i][3] += delta;
        if (stars[i][3] > starSpeedTable[stars[i][2]][gameState._systemLevels[ENGINES][0]])
        {
          stars[i][3] = 0;
          stars[i][0] -= 1;
        }

        if (stars[i][0] < -2)
        {
          stars[i][0] = SCREEN_WIDTH + 2;
          stars[i][1] = rand(1, SCREEN_HEIGHT - 1);
        }
      }

      for (let i in stars)
      {
        let value = math.ceil(255 - 185 * (1 - stars[i][2] / 4));
        let colour = colourToHex(value, value, value, value);
        let size = math.ceil(stars[i][2] / 2);
        pushQuad(stars[i][0], stars[i][1], size, size, colour);
      }

      // Step all active interpolators forwards
      for (let [_, interpolator] of Interpolators)
      {
        interpolate(now, interpolator);
      }

      updateScene(now, delta);
      renderScene(now, delta);

      // Clean up any completed interpolators
      for (let [id, interpolator] of Interpolators)
      {
        if (interpolator._lastResult?._done)
        {
          Interpolators.delete(id);
        }
      }
    }
    else
    {
      renderNode(touchToPlayId, now, delta);
    }
    gl_flush();
    tickStats(now, delta);

    if (inputContext._fire >= -1 && inputContext._isTouch)
    {
      inputContext._cursor[0] = 0;
      inputContext._cursor[1] = 0;
    }
    inputContext._fire = -1;

    requestAnimationFrame(loop);
  };
  gl_setClear(6, 6, 6);
  then = performance.now();
  requestAnimationFrame(loop);
});