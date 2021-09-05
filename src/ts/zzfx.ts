import { math } from "./math";
import { musicEnabled } from "./game-state";
import { rand } from "./random";

//@ts-ignore
let zzfxV = .5, zzfxR = 44100, zzfxX;
//@ts-ignore
export let zzfxP = (...m) => { let f = zzfxX.createBuffer(m.length, m[0].length, zzfxR), d = zzfxX.createBufferSource(); m.map((b, n) => f.getChannelData(n).set(b)); d.buffer = f; d.connect(zzfxX.destination); d.start(); return d; };
let zzfxG = (m = 1, f = .05, d = 220, b = 0, n = 0, t = .1, r = 0, D = 1, u = 0, z = 0, v = 0, A = 0, k = 0, E = 0, B = 0, F = 0, e = 0, w = 1, p = 0, C = 0) => { let c = 2 * math.PI, G = u *= 500 * c / zzfxR / zzfxR; f = d *= (1 + 2 * f * math.random() - f) * c / zzfxR; let x = [], h = 0, H = 0, a = 0, q = 1, I = 0, J = 0, g = 0, y, l; b = zzfxR * b + 9; p *= zzfxR; n *= zzfxR; t *= zzfxR; e *= zzfxR; z *= 500 * c / zzfxR ** 3; B *= c / zzfxR; v *= c / zzfxR; A *= zzfxR; k = zzfxR * k | 0; for (l = b + p + n + t + e | 0; a < l; x[a++] = g)++J % (100 * F | 0) || (g = r ? 1 < r ? 2 < r ? 3 < r ? math.sin((h % c) ** 3) : math.max(math.min(math.tan(h), 1), -1) : 1 - (2 * h / c % 2 + 2) % 2 : 1 - 4 * math.abs(math.round(h / c) - h / c) : math.sin(h), g = (k ? 1 - C + C * math.sin(c * a / k) : 1) * (0 < g ? 1 : -1) * math.abs(g) ** D * m * zzfxV * (a < b ? a / b : a < b + p ? 1 - (a - b) / p * (1 - w) : a < b + p + n ? w : a < l - e ? (l - a - e) / t * w : 0), g = e ? g / 2 + (e > a ? 0 : (a < l - e ? 1 : (l - a) / e) * x[a - e | 0] / 2) : g), y = (d += u += z) * math.cos(B * H++), h += y - y * E * (1 - 1E9 * (math.sin(a) + 1) % 2), q && ++q > A && (d += v, f += v, q = 0), !k || ++I % k || (d = f, u = G, q = q || 1); return x; };

// ZzFXM (v2.0.3) | (C) Keith Clark | MIT | https://github.com/keithclark/ZzFXM
//@ts-ignore
let zzfxM = (n, f, t, e = 125) => { let l, o, z, r, g, h, x, a, u, c, d, i, m, p, G, M = 0, R = [], b = [], j = [], k = 0, q = 0, s = 1, v = {}, w = zzfxR / e * 60 >> 2; for (; s; k++)R = [s = a = d = m = 0], t.map((e, d) => { for (x = f[e][k] || [0, 0, 0], s |= !!f[e][k], G = m + (f[e][0].length - 2 - !a) * w, p = d === t.length - 1, o = 2, r = m; o < x.length + p; a = ++o) { for (g = x[o], u = o === x.length + p - 1 && p || c != (x[0] || 0) | g | 0, z = 0; z < w && a; z++ > w - 99 && u ? i += (i < 1) / 99 : 0)h = (1 - i) * R[M++] / 2 || 0, b[r] = (b[r] || 0) - h * q + h, j[r] = (j[r++] || 0) + h * q + h; g && (i = g % 1, q = x[1] || 0, (g |= 0) && (R = v[[c = x[M = 0] || 0, g]] = v[[c, g]] || (l = [...n[c]], l[2] *= 2 ** ((g - 12) / 12), g > 0 ? zzfxG(...l) : []))); } m = G; }); return [b, j]; };

let song = [[[.1, 0, 330, , 1, 1.5, , , , , , , , , , , , , .2]], [[[, , 1, , , , , , , , , , , , , , , , 1, , , , , , , , , , , , , , , , 1, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , ,], [, , 8, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , , 15, , , , , , , , , , , , , , , ,], [, , 17, , , , , , , , , , , , , , , , 15, , , , , , , , , , , , , , , , 25, , , , , , , , , , , , , , , , 20, , , , , , , , , , , , , , , ,]], [[, , 1, , , , , , , , , , , , , , , , 1, , , , , , , , , , , , , , , , 1, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , ,], [, , 8, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , , 15, , , , , , , , , , , , , , , ,], [, , 17, , , , , , , , , , , , , , , , 15, , , , , , , , , , , , , , , , 25, , , , , , , , , , , , , , , , 20, , , , , , , , , , , , , , , ,], [, , , , , , 1, , 32, , , , , , , , , , , , , , 1, , 27, , , , , , , , , , , , , , 1, , 20, , , , , , , , , , , , , , 1, , 17, , , , , , , , , ,]]], [0, 1, 1, 0], 80];

export let musicData: any[][];
export let music: AudioBufferSourceNode;
export let startMusic = (): void =>
{
  music = zzfxP(...musicData);
  music.onended = repeat;
};

let repeat = (): void =>
{
  if (musicEnabled)
  {
    setTimeout(() =>
    {
      startMusic();
      music.playbackRate.value = rand(3, 5) / 4;
    }, 250);
  }
};

export let buttonSound: number[];
export let shootSound: number[];
export let scanSound: number[];
export let hullHitSound: number[];
export let shipDieSound: number[];
export let beastDieSound: number[];
export let qDriveSound: number[];
export let setupAudio = (): void =>
{
  zzfxX = new AudioContext();
  //@ts-ignore
  musicData = zzfxM(...song);
  buttonSound = zzfxG(...[, .01, 261, .02, .03, .01, , .94, , , , , , , , , , .75, .04]);
  shootSound = zzfxG(...[1.68, .1, 500, , .1, , 1, 1.7, -6, .7, , , , , , , .1, .8, , .1]);
  scanSound = zzfxG(...[1.22, , 42, .05, .08, .48, , .57, , -4, -65, .06, .13, , , , , .8, .01, .49]);
  shipDieSound = zzfxG(...[1.2, , 129, .03, .13, .8, 4, 1.51, .1, .8, , , , .1, , .7, , .67, .02, .48]);
  beastDieSound = zzfxG(...[1.2, .1, 500, , .29, .34, 3, 2.43, .8, .4, , , .14, .3, , .3, .29, .79, .08, .25]);
  qDriveSound = zzfxG(...[1.08, 0, 27, .1, 1, .5, 4, 0, -0.5, , -62, .05, .12, , 46, , , .53, .1, .07]);
  hullHitSound = zzfxG(...[1.69, .1, 400, , .05, .35, 4, 1.8, -7, -1, , , , , , .2, , .4]);
};
