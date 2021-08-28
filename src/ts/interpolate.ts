import { math } from "./math";

export type InterpolationData =
  {
    _startTime: number,
    _duration: number,
    _origin: number[],
    _target: number[],
    _lastResult?: InterpolationResult,
    _callback: ((...args: any[]) => void) | null;
  };

type InterpolationResult =
  {
    _values: number[],
    _done: boolean;
  };

export let Interpolators: Map<string, InterpolationData> = new Map();

export let createInterpolationData = (duration: number, origin: number[], destination: number[], callback: ((...args: any[]) => void) | null = null): InterpolationData =>
{
  return {
    _startTime: -1,
    _duration: duration,
    _origin: [...origin],
    _target: [...destination],
    _callback: callback
  };
};

export let interpolate = (now: number, interpolationData: InterpolationData): void =>
{
  if (interpolationData._startTime === -1)
  {
    interpolationData._startTime = now;
  }
  let elapsed = now - interpolationData._startTime;
  if (elapsed >= interpolationData._duration)
  {
    if (interpolationData._callback)
    {
      interpolationData._callback();
    }
    interpolationData._lastResult = { _values: interpolationData._target, _done: true };
    return;
  }

  let values: number[] = [];
  for (let i = 0, len = interpolationData._origin.length; i < len; i++)
  {
    values[i] = interpolationData._origin[i] + math.round(interpolationData._target[i] - interpolationData._origin[i]) * (elapsed / interpolationData._duration);
  }
  interpolationData._lastResult = { _values: values, _done: false };
};