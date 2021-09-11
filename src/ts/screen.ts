import { assert } from "./debug";

export let SCREEN_WIDTH = 640;
export let SCREEN_HEIGHT = 360;

export let SCREEN_CENTER_X = 320;
export let SCREEN_CENTER_Y = 180;

export let canvas: HTMLCanvasElement;
export let doc: Document = document;

export let setupScreen = (): HTMLCanvasElement =>
{
  doc.title = `2D4X13K`;
  let css = `margin:0;padding:0;background-color:#000;width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;`;
  doc.documentElement.style.cssText = css;
  doc.body.style.cssText = css;

  let stage = doc.createElement(`div`);
  stage.style.cssText = `display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100vw*(9/16));max-height:100vh;width:100vw;`;
  doc.body.appendChild(stage);

  canvas = doc.createElement(`canvas`);
  canvas.style.cssText = `height:100%;image-rendering:optimizeSpeed;image-rendering:pixelated;`;
  stage.appendChild(canvas);

  assert(canvas !== null, `Unable to find canvas element on index.html`);
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;

  return canvas;
};

export let requestFullscreen = (): void =>
{
  if (doc.fullscreenEnabled)
  {
    if (!doc.fullscreenElement)
    {
      let body = doc.querySelector(`body`);
      let fullscreen = canvas.requestFullscreen || canvas.mozRequestFullScreen || canvas.webkitRequestFullscreen || canvas.msRequestFullscreen;
      //@ts-ignore
      fullscreen.call(body).then(() =>
      {
        window.screen.orientation.lock(`landscape-primary`).catch(_ => _);
      }).catch(_ => _);
    }
    else
    {
      doc.exitFullscreen();
    }
  }
};