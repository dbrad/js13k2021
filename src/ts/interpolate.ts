export const None = 0;
export const Linear = 1;
export const EaseOutQuad = 4;
/*
export const EaseInBack = 2;
export const EaseInOutBack = 3;
export const Bounce = 5;
*/

function linear(t: number): number
{
  return t;
};

function easeOutQuad(t: number)
{
  return t * (2 - t);
};

/*
function easeInBack(t: number): number
{
  const s: number = 1.70158;
  return (t) * t * ((s + 1) * t - s);
};

function bounce(t: number): number
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

function easeInOutBack(t: number)
{
  let s: number = 1.70158;
  t /= 0.5;
  if (t < 1) { return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s)); }
  return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
};
*/

function ease(t: number, fn: number = Linear): number
{
  switch (fn)
  {
    /*
    case EaseInBack:
      return easeInBack(t);
    case EaseInOutBack:
      return easeInOutBack(t);
    case Bounce:
      return bounce(t);
    */
    case EaseOutQuad:
      return easeOutQuad(t);
    case Linear:
      return linear(t);
    case None:
    default:
      return 1;
  }
}

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

export const Interpolators: Map<string, InterpolationData> = new Map();

export function createInterpolationData(
  duration: number,
  origin: number[],
  destination: number[],
  easing: number = Linear,
  callback: ((...args: any[]) => void) | null = null): InterpolationData
{
  return {
    _startTime: -1,
    _duration: duration,
    _origin: [...origin],
    _target: [...destination],
    _easing: easing,
    _callback: callback
  };
}

export function interpolate(now: number, interpolationData: InterpolationData): void
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
}