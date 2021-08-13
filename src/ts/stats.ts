// @ifdef DEBUG
let fpsTextNode: Text;
let msTextNode: Text;
let ftTextNode: Text;

let frameCount: number = 0;
let fps: number = 60;
let lastFps: number = 0;
let ms: number = 1000 / fps;
let averageFrameTime = 0;
// @endif

export function initStats(): void
{
  // @ifdef DEBUG
  const container: HTMLDivElement = document.createElement("div");
  container.style.position = "absolute";
  container.style.right = "0px";
  container.style.top = "0px";
  container.style.zIndex = "1000";

  document.body.prepend(container);

  const overlay: HTMLDivElement = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.right = "0px";
  overlay.style.top = "0px";
  overlay.style.fontFamily = "Courier";
  overlay.style.fontSize = "12px";
  overlay.style.fontWeight = "bold";
  overlay.style.padding = "0.5em 1em";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
  overlay.style.color = "white";
  overlay.style.textAlign = "right";
  overlay.style.borderLeft = "1px solid #FFFFFF";
  overlay.style.borderBottom = "1px solid #FFFFFF";
  overlay.style.width = "6em";
  container.appendChild(overlay);

  const fpsDOM: HTMLDivElement = document.createElement("div");
  overlay.appendChild(fpsDOM);
  const msDOM: HTMLDivElement = document.createElement("div");
  overlay.appendChild(msDOM);
  const frameTimeDOM: HTMLDivElement = document.createElement("div");
  overlay.appendChild(frameTimeDOM);

  fpsTextNode = window.document.createTextNode("");
  fpsDOM.appendChild(fpsTextNode);
  msTextNode = window.document.createTextNode("");
  msDOM.appendChild(msTextNode);
  ftTextNode = window.document.createTextNode("");
  frameTimeDOM.appendChild(ftTextNode);
  // @endif
}

export function tickStats(frameStart: number, delta: number): void
{
  // @ifdef DEBUG
  const now = performance.now();

  ms = (0.9 * delta) + (0.1 * ms);
  averageFrameTime = (0.9 * (now - frameStart)) + (0.1 * averageFrameTime);
  if (averageFrameTime < 0) averageFrameTime = 0;

  if (ms > 250)
  {
    fps = 0;
    ms = 0;
    averageFrameTime = 0;
  }

  if (frameStart >= lastFps + 1000)
  {
    fps = 0.9 * frameCount * 1000 / (frameStart - lastFps) + 0.1 * fps;
    fpsTextNode.nodeValue = `${ fps.toFixed((2)) } hz`;
    msTextNode.nodeValue = `${ ms.toFixed(2) } ms`;
    ftTextNode.nodeValue = `${ averageFrameTime.toFixed(2) } ms`;

    lastFps = frameStart;
    frameCount = 0;
  }
  frameCount++;
  // @endif
}
