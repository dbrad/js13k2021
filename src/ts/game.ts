import { Align, createTextNode } from "./nodes/text-node";
import { Interpolators, interpolate } from "./interpolate";
import { MainMenuScene, setupMainMenu, updateMainMenu } from "./scenes/main-menu";
import { SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "./screen";
import { gl_clear, gl_flush, gl_getContext, gl_init, gl_setClear } from "./gl";
import { initStats, tickStats } from "./stats";
import { moveNode, renderNode } from "./scene-node";
import { pushScene, registerScene, renderScene, updateScene } from "./scene";

import { assert } from "./debug";
import { initializeInput } from "./input";
import { loadSpriteSheet } from "./texture";
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

    pushScene(MainMenuScene);
  };

  canvas.addEventListener("pointerdown", loadGame);
  canvas.addEventListener("touchstart", loadGame);
  const touchToPlayId = createTextNode("TOUCH TO START", SCREEN_WIDTH, { scale: 1, textAlign: Align.C });
  moveNode(touchToPlayId, [SCREEN_CENTER_X, SCREEN_CENTER_Y - 10]);

  function loop(now: number): void
  {
    delta = now - then;
    then = now;
    gl_clear();

    if (playing)
    {
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

    requestAnimationFrame(loop);
  }
  gl_setClear(29, 28, 31);
  then = performance.now();
  requestAnimationFrame(loop);
});