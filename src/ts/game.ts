import { Align, createTextNode } from "./nodes/text-node";
import { Interpolators, interpolate } from "./interpolate";
import { MainMenuScene, setupMainMenu, updateMainMenu } from "./scenes/main-menu";
import { MissionSelectScene, setupMissionSelect, updateMissionSelect } from "./scenes/mission-select";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "./screen";
import { gl_clear, gl_flush, gl_getContext, gl_init, gl_setClear } from "./gl";
import { initStats, tickStats } from "./stats";
import { initializeInput, inputContext } from "./input";
import { moveNode, renderNode } from "./scene-node";
import { registerScene, renderScene, updateScene } from "./scene";

import { assert } from "./debug";
import { colourToHex } from "./colour";
import { loadSpriteSheet } from "./texture";
import { pushQuad } from "./draw";
import { setupAudio } from "./zzfx";

window.addEventListener("load", async () =>
{
  const canvas = document.querySelector(`canvas`);
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
  const loadGame = () =>
  {
    playing = true;
    canvas.removeEventListener("pointerdown", loadGame);
    canvas.removeEventListener("touchstart", loadGame);

    initializeInput(canvas);

    setupAudio();
    registerScene(MainMenuScene, setupMainMenu, updateMainMenu);
    registerScene(MissionSelectScene, setupMissionSelect, updateMissionSelect);

    makeStars();
  };

  canvas.addEventListener("pointerdown", loadGame);
  canvas.addEventListener("touchstart", loadGame);
  const touchToPlayId = createTextNode("TOUCH TO START", SCREEN_WIDTH, { scale: 1, textAlign: Align.C });
  moveNode(touchToPlayId, [SCREEN_CENTER_X, SCREEN_CENTER_Y - 10]);

  const stars: [number, number, number][] = [];
  const makeStars = () =>
  {
    let totalStars = (Math.floor(SCREEN_WIDTH / 72)) * (Math.floor(SCREEN_HEIGHT / 72)) * 1;

    let randomX, randomY, randomZ;
    let sortable = [];
    for (let i = 0; i < totalStars; i++)
    {
      randomX = Math.floor(Math.random() * (SCREEN_WIDTH - 1) + 1);
      randomY = Math.floor(Math.random() * (SCREEN_HEIGHT - 1) + 1);
      randomZ = Math.ceil(Math.random() * 4);
      stars[i] = [randomX, randomY, randomZ];
      sortable.push(randomZ);
    }
    sortable.sort();


    for (const i in stars)
    {
      stars[i][2] = sortable[i];
    }
  };

  function loop(now: number): void
  {
    delta = now - then;
    then = now;
    gl_clear();

    if (playing)
    {
      for (const i in stars)
      {
        stars[i][0] += -4 * (stars[i][2] / 8);
        if (stars[i][0] >= SCREEN_WIDTH)
        {
          stars[i][0] = -5;
        }
        if (stars[i][1] >= SCREEN_HEIGHT)
        {
          stars[i][1] = -5;
        }
        if (stars[i][0] < -6)
        {
          stars[i][0] = SCREEN_WIDTH;
        }
        if (stars[i][1] < -6)
        {
          stars[i][1] = SCREEN_HEIGHT;
        }
      }

      for (const i in stars)
      {
        const value = Math.ceil(255 - 185 * (1 - stars[i][2] / 4));
        const colour = colourToHex(value, value, value, value);
        const size = Math.ceil(stars[i][2] / 2);
        pushQuad(stars[i][0], stars[i][1], size, size, colour);
      }

      // Step all active interpolators forwards
      for (const [_, interpolator] of Interpolators)
      {
        interpolate(now, interpolator);
      }

      updateScene(now, delta);
      renderScene(now, delta);

      // Clean up any completed interpolators
      for (const [id, interpolator] of Interpolators)
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

    inputContext._fire = -1;

    requestAnimationFrame(loop);
  }
  gl_setClear(6, 6, 6);
  then = performance.now();
  requestAnimationFrame(loop);
});