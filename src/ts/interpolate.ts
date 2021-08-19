export let None = 0;
export let Linear = 1;
export let EaseOutQuad = 4;
/*
export let EaseInBack = 2;
export let EaseInOutBack = 3;
export let Bounce = 5;
*/

let linear = (t: number): number =>
{
  return t;
};

let easeOutQuad = (t: number) =>
{
  return t * (2 - t);
};

/*
let easeInBack = (t: number): number=>
{
  let s: number = 1.70158;
  return (t) * t * ((s + 1) * t - s);
};

let bounce = (t: number): number=>
{
  if (t < (1 / 2.75))
  {
    return (7.5625 * t * t);
  } else if (t < (2 / 2.75))
  {
    return (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
  } else if (t < (2.5 / 2.75))
  {
    return (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
  } else
  {
    return (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
  }
};

let easeInOutBack = (t: number)=>
{
  let s: number = 1.70158;
  t /= 0.5;
  if (t < 1) { return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s)); }
  return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
};
*/

let ease = (t: number, fn: number = Linear): number =>
{
  if (fn === Linear)
  {
    return linear(t);
  }
  else if (fn === EaseOutQuad)
  {
    return easeOutQuad(t);

  }
  else
  {
    return 1;
  }
};

export type InterpolationData =
  {
    _startTime: number,
    _duration: number,
    _origin: number[],
    _target: number[],
    _lastResult?: InterpolationResult,
    _easing: number,
    _callback: ((...args: any[]) => void) | null;
  };

type InterpolationResult =
  {
    _values: number[],
    _done: boolean;
  };

export let Interpolators: Map<string, InterpolationData> = new Map();

export let createInterpolationData = (duration: number, origin: number[], destination: number[], easing: number = Linear, callback: ((...args: any[]) => void) | null = null): InterpolationData =>
{
  return {
    _startTime: -1,
    _duration: duration,
    _origin: [...origin],
    _target: [...destination],
    _easing: easing,
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

  let p = ease(elapsed / interpolationData._duration, interpolationData._easing);

  let values: number[] = [];
  for (let i = 0, len = interpolationData._origin.length; i < len; i++)
  {
    values[i] = interpolationData._origin[i] + Math.round(interpolationData._target[i] - interpolationData._origin[i]) * p;
  }
  interpolationData._lastResult = { _values: values, _done: false };
};