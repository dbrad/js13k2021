import { EaseOutQuad, Interpolators, createInterpolationData } from "./interpolate";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./screen";
import { iterateNodeMovement, nodeInput, renderNode } from "./scene-node";

import { assert } from "./debug";
import { clearInput } from "./input";
import { colourToHex } from "./colour";
import { pushQuad } from "./draw";

type Scene =
  {
    _rootId: number,
    _updateFn: (now: number, delta: number) => void;
  };
let TRANSITION_KEY = 'xsit';
let transitionColour = 0;

let Scenes: Map<number, Scene> = new Map();
//let SceneStack: Scene[] = [];
let CurrentScene: Scene;
export let registerScene = (sceneId: number, setupFn: () => number, updateFn: (now: number, delta: number) => void): void =>
{
  let rootId = setupFn();
  let scene: Scene = { _rootId: rootId, _updateFn: updateFn };
  Scenes.set(sceneId, scene);

  if (!CurrentScene)
  {
    CurrentScene = scene;
    // SceneStack.push(scene);
  }
};

export let pushScene = (sceneId: number): void =>
{
  let scene = Scenes.get(sceneId);

  let transition = createInterpolationData(250, [0], [255], EaseOutQuad, () =>
  {
    assert(scene !== undefined, `Unable to find scene #"${ sceneId }"`);
    CurrentScene = scene;
    // SceneStack.push(scene);
    clearInput();

    let transition = createInterpolationData(250, [255], [0], EaseOutQuad);
    Interpolators.set(TRANSITION_KEY, transition);
  });
  Interpolators.set(TRANSITION_KEY, transition);
  clearInput();
};

export let popScene = (): void =>
{
  let transition = createInterpolationData(250, [0], [255], EaseOutQuad, () =>
  {
    // SceneStack.pop();
    // CurrentScene = SceneStack[SceneStack.length - 1];

    let transition = createInterpolationData(250, [255], [0], EaseOutQuad);
    Interpolators.set(TRANSITION_KEY, transition);
  });
  Interpolators.set(TRANSITION_KEY, transition);
};

export let updateScene = (now: number, delta: number): void =>
{
  let rootId = CurrentScene._rootId;
  if (!Interpolators.has(TRANSITION_KEY))
  {
    nodeInput(rootId);
  }
  iterateNodeMovement(rootId);
  CurrentScene._updateFn(now, delta);
};

export let renderScene = (now: number, delta: number): void =>
{
  let rootId = CurrentScene._rootId;
  renderNode(rootId, now, delta);

  if (Interpolators.has(TRANSITION_KEY))
  {
    let transition = Interpolators.get(TRANSITION_KEY);
    if (transition?._lastResult)
    {
      let i = transition._lastResult;
      let colour = colourToHex(i._values[0], 0, 0, 0);
      transitionColour = colour;
    }
    pushQuad(0, 0, SCREEN_WIDTH + 2, SCREEN_HEIGHT + 2, transitionColour);
  }
};