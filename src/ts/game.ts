import { Align_Center, createTextNode, updateTextNode } from "./nodes/text-node";
import { ENGINES, gameState, initGameState } from "./game-state";
import { Interpolators, interpolate } from "./interpolate";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH, setupScreen } from "./screen";
import { gl_clear, gl_flush, gl_getContext, gl_init, gl_setClear } from "./gl";
import { initStats, tickStats } from "./stats";
import { initializeInput, inputContext } from "./input";
import { moveNode, renderNode } from "./scene-node";
import { registerScene, renderScene, updateScene } from "./scene";
import { setupAudio, startMusic } from "./zzfx";

import { Adventure } from "./scenes/adventure";
import { GameMenu } from "./scenes/game-menu";
import { MainMenu } from "./scenes/main-menu";
import { MissionSelect } from "./scenes/mission-select";
import { ShipSelect } from "./scenes/ship-select";
import { Station } from "./scenes/station";
import { assert } from "./debug";
import { colourToHex } from "./colour";
import { loadSpriteSheet } from "./texture";
import { math } from "./math";
import { pushQuad } from "./draw";
import { rand } from "./random";

window.addEventListener("load", async () =>
{
  let canvas = setupScreen();
  let context = gl_getContext(canvas);
  gl_init(context);
  await loadSpriteSheet();
  initStats();

  let delta: number;
  let then: number;

  let playing: boolean = false;
  let loadGame = () =>
  {
    assert(canvas !== null, "Unable to find canvas element on index.html");
    canvas.removeEventListener("pointerdown", loadGame);
    canvas.removeEventListener("touchstart", loadGame);
    updateTextNode(preGameMessage, "loading...");

    setTimeout(() =>
    {
      playing = true;
      initializeInput(canvas);
      initGameState();

      setupAudio();
      registerScene(MainMenu._sceneId, MainMenu._setup, MainMenu._update);
      registerScene(ShipSelect._sceneId, ShipSelect._setup, ShipSelect._update);
      registerScene(MissionSelect._sceneId, MissionSelect._setup, MissionSelect._update);
      registerScene(Adventure._sceneId, Adventure._setup, Adventure._update);
      registerScene(Station._sceneId, Station._setup, Station._update);
      registerScene(GameMenu._sceneId, GameMenu._setup, GameMenu._update);

      makeStars();
      startMusic();
    }, 16);
  };

  canvas.addEventListener("pointerdown", loadGame);
  canvas.addEventListener("touchstart", loadGame);
  let preGameMessage = createTextNode("touch to start", { _scale: 2, _textAlign: Align_Center });
  moveNode(preGameMessage, SCREEN_CENTER_X, SCREEN_CENTER_Y - 10);

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

  let starSpeedTable = [0, 128, 96, 64, 32];

  let loop = (now: number): void =>
  {
    delta = now - then;
    then = now;
    gl_clear();

    if (playing)
    {
      for (let i in stars)
      {
        let star = stars[i];
        star[3] += delta;
        if (star[3] > starSpeedTable[star[2]] * (5 - (gameState._systemLevels[ENGINES][0])))
        {
          star[3] = 0;
          star[0] -= 1;
        }

        if (star[0] < -2)
        {
          star[0] = SCREEN_WIDTH + 2;
          star[1] = rand(1, SCREEN_HEIGHT - 1);
        }

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
      renderNode(preGameMessage, now, delta);
    }
    gl_flush();
    tickStats(now, delta);

    // Prevent the 'cursor' from hovering an element after touching it
    if (inputContext._fire >= -1 && inputContext._isTouch)
    {
      inputContext._cursor[0] = 0;
      inputContext._cursor[1] = 0;
    }
    inputContext._fire = -1;

    requestAnimationFrame(loop);
  };
  gl_setClear(0, 0, 0);
  then = performance.now();
  requestAnimationFrame(loop);
});