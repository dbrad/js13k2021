import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./screen";

export const inputContext = {
  _cursor: [0, 0],
  _mouseDown: false,
  _hot: -1,
  _active: -1,
  _fire: -1
};

export function clearInput(): void
{
  inputContext._hot = -1;
  inputContext._active = -1;
  inputContext._mouseDown = false;
}

let canvasRef: HTMLCanvasElement;

const isTouch = (e: Event | PointerEvent | TouchEvent): e is TouchEvent =>
{
  return (e.type[0] === "t");
};

const pointerMove = (e: PointerEvent | TouchEvent) =>
{
  const canvasBounds = canvasRef.getBoundingClientRect();
  if (isTouch(e))
  {
    e.preventDefault();
    const touch: Touch = e.touches[0];
    inputContext._cursor[0] = Math.floor((touch.clientX - canvasBounds.left) / (canvasBounds.width / SCREEN_WIDTH));
    inputContext._cursor[1] = Math.floor((touch.clientY - canvasBounds.top) / (canvasBounds.height / SCREEN_HEIGHT));
    return;
  }
  e = e as PointerEvent;
  inputContext._cursor[0] = Math.floor((e.clientX - canvasBounds.left) / (canvasBounds.width / SCREEN_WIDTH));
  inputContext._cursor[1] = Math.floor((e.clientY - canvasBounds.top) / (canvasBounds.height / SCREEN_HEIGHT));
};

const pointerDown = (e: PointerEvent | TouchEvent) =>
{
  if (isTouch(e))
  {
    const canvasBounds = canvasRef.getBoundingClientRect();
    const touchEvent = e as TouchEvent;
    touchEvent.preventDefault();
    const touch: Touch = touchEvent.touches[0];
    inputContext._cursor[0] = Math.floor((touch.clientX - canvasBounds.left) / (canvasBounds.width / SCREEN_WIDTH));
    inputContext._cursor[1] = Math.floor((touch.clientY - canvasBounds.top) / (canvasBounds.height / SCREEN_HEIGHT));
  }

  inputContext._mouseDown = true;
};

const pointerUp = (_: PointerEvent | TouchEvent) =>
{
  inputContext._mouseDown = false;
};

export function initializeInput(canvas: HTMLCanvasElement)
{
  canvasRef = canvas;

  document.addEventListener("pointermove", pointerMove);
  document.addEventListener("touchmove", pointerMove);

  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("touchstart", pointerDown);

  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("touchend", pointerUp);
}