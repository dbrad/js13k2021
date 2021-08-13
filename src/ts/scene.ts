import { iterateNodeMovement, nodeInput, renderNode } from "./scene-node";

import { assert } from "./debug";

type Scene =
  {
    _rootId: number,
    _updateFn: (now: number, delta: number) => void;
  };
const Scenes: Map<number, Scene> = new Map();
const SceneStack: Scene[] = [];
let CurrentScene: Scene;
export function registerScene(sceneId: number, setupFn: () => number, updateFn: (now: number, delta: number) => void): void
{
  const rootId = setupFn();
  Scenes.set(sceneId, { _rootId: rootId, _updateFn: updateFn });
}

export function pushScene(sceneId: number): void
{
  const scene = Scenes.get(sceneId);
  assert(scene !== undefined, `Unable to find scene #"${ sceneId }"`);
  SceneStack.push(scene);
  CurrentScene = scene;
}

export function popScene(): void
{
  SceneStack.pop();
  CurrentScene = SceneStack[SceneStack.length - 1];
}

export function updateScene(now: number, delta: number): void
{
  const rootId = CurrentScene._rootId;
  nodeInput(rootId);
  iterateNodeMovement(rootId);
  CurrentScene._updateFn(now, delta);
}

export function renderScene(now: number, delta: number): void
{
  const rootId = CurrentScene._rootId;
  renderNode(rootId, now, delta);
}