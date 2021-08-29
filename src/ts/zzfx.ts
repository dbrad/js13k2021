'use strict';

import { math } from "./math";
import { musicEnabled } from "./game-state";
import { rand } from "./random";

// zzfx() - the universal entry point -- returns a AudioBufferSourceNode
//@ts-ignore
let zzfx = (...t) => zzfxP(zzfxG(...t));

// zzfxP() - the sound player -- returns a AudioBufferSourceNode
//@ts-ignore
export let zzfxP = (...t) => { let e = zzfxX.createBufferSource(), f = zzfxX.createBuffer(t.length, t[0].length, zzfxR); t.map((d, i) => f.getChannelData(i).set(d)), e.buffer = f, e.connect(zzfxX.destination), e.start(); return e; };

// zzfxG() - the sound generator -- returns an array of sample data
let zzfxG = (q = 1, k = .05, c = 220, e = 0, t = 0, u = .1, r = 0, F = 1, v = 0, z = 0, w = 0, A = 0, l = 0, B = 0, x = 0, G = 0, d = 0, y = 1, m = 0, C = 0) => { let b = 2 * math.PI, H = v *= 500 * b / zzfxR ** 2, I = (0 < x ? 1 : -1) * b / 4, D = c *= (1 + 2 * k * math.random() - k) * b / zzfxR, Z = [], g = 0, E = 0, a = 0, n = 1, J = 0, K = 0, f = 0, p, h; e = 99 + zzfxR * e; m *= zzfxR; t *= zzfxR; u *= zzfxR; d *= zzfxR; z *= 500 * b / zzfxR ** 3; x *= b / zzfxR; w *= b / zzfxR; A *= zzfxR; l = zzfxR * l | 0; for (h = e + m + t + u + d | 0; a < h; Z[a++] = f)++K % (100 * G | 0) || (f = r ? 1 < r ? 2 < r ? 3 < r ? math.sin((g % b) ** 3) : math.max(math.min(math.tan(g), 1), -1) : 1 - (2 * g / b % 2 + 2) % 2 : 1 - 4 * math.abs(math.round(g / b) - g / b) : math.sin(g), f = (l ? 1 - C + C * math.sin(2 * math.PI * a / l) : 1) * (0 < f ? 1 : -1) * math.abs(f) ** F * q * zzfxV * (a < e ? a / e : a < e + m ? 1 - (a - e) / m * (1 - y) : a < e + m + t ? y : a < h - d ? (h - a - d) / u * y : 0), f = d ? f / 2 + (d > a ? 0 : (a < h - d ? 1 : (h - a) / d) * Z[a - d | 0] / 2) : f), p = (c += v += z) * math.sin(E * x - I), g += p - p * B * (1 - 1E9 * (math.sin(a) + 1) % 2), E += p - p * B * (1 - 1E9 * (math.sin(a) ** 2 + 1) % 2), n && ++n > A && (c += w, D += w, n = 0), !l || ++J % l || (c = D, v = H, n = n || 1); return Z; };

// zzfxV - global volume
let zzfxV: number = .1;

// zzfxR - global sample rate
//@ts-ignore
let zzfxR: number = 44100;

// zzfxX - the common audio context
//@ts-ignore
let zzfxX: AudioContext;

// ZzFXM (v2.0.3) | (C) Keith Clark | MIT | https://github.com/keithclark/ZzFXM
//@ts-ignore
let zzfxM = (n, f, t, e = 125) => { let l, o, z, r, g, h, x, a, u, c, d, i, m, p, G, M = 0, R = [], b = [], j = [], k = 0, q = 0, s = 1, v = {}, w = zzfxR / e * 60 >> 2; for (; s; k++)R = [s = a = d = m = 0], t.map((e, d) => { for (x = f[e][k] || [0, 0, 0], s |= !!f[e][k], G = m + (f[e][0].length - 2 - !a) * w, p = d === t.length - 1, o = 2, r = m; o < x.length + p; a = ++o) { for (g = x[o], u = o === x.length + p - 1 && p || c != (x[0] || 0) | g | 0, z = 0; z < w && a; z++ > w - 99 && u ? i += (i < 1) / 99 : 0)h = (1 - i) * R[M++] / 2 || 0, b[r] = (b[r] || 0) - h * q + h, j[r] = (j[r++] || 0) + h * q + h; g && (i = g % 1, q = x[1] || 0, (g |= 0) && (R = v[[c = x[M = 0] || 0, g]] = v[[c, g]] || (l = [...n[c]], l[2] *= 2 ** ((g - 12) / 12), g > 0 ? zzfxG(...l) : []))); } m = G; }); return [b, j]; };

let song = [[[.3, 0, 260, , 1, 1.5, , , , , , , , , , , , , .2], [.4, 0, 4e3, , , .03, 2, 1.25, , , , , .02, 6.8, -.3, , .5]], [[[, , 1, , , , , , , , , , , , , , , , 1, , , , , , , , , , , , , , , , 1, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , ,], [, , 8, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , , 15, , , , , , , , , , , , , , , ,], [, , 17, , , , , , , , , , , , , , , , 15, , , , , , , , , , , , , , , , 25, , , , , , , , , , , , , , , , 20, , , , , , , , , , , , , , , ,], [1, 1, .25, , , , 13, , , , 13, , , , , , , , , , , , 1, , , , 1, , , , , , , , , , , , 1, , , , 1, , , , , , , , , , , , 1, , , , 1, , , , , , , ,]], [[, , 1, , , , , , , , , , , , , , , , 1, , , , , , , , , , , , , , , , 1, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , ,], [, , 8, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , , 15, , , , , , , , , , , , , , , ,], [, , 17, , , , , , , , , , , , , , , , 15, , , , , , , , , , , , , , , , 25, , , , , , , , , , , , , , , , 20, , , , , , , , , , , , , , , ,]], [[, , 1, , , , , , , , , , , , , , , , 1, , , , , , , , , , , , , , , , 1, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , ,], [, , 8, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , , 8, , , , , , , , , , , , , , , , 15, , , , , , , , , , , , , , , ,], [, , 17, , , , , , , , , , , , , , , , 15, , , , , , , , , , , , , , , , 25, , , , , , , , , , , , , , , , 20, , , , , , , , , , , , , , , ,], [, , , , , , 1, , 32, , , , , , , , , , , , , , 1, , 27, , , , , , , , , , , , , , 1, , 20, , , , , , , , , , , , , , 1, , 17, , , , , , , , , ,]]], [1, 2, 2, 0], 80, { "title": "", "instruments": ["P", "H"], "patterns": ["0", "1", "3"] }];

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

export let powerSound: number[];
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
  powerSound = zzfxG(...[, .01, 261.6256, .02, .03, .01, , .94, , , , , , , , , , .75, .04]);
  shootSound = zzfxG(...[1.68, .1, 500, , .1, , 1, 1.7, -6, .7, , , , , , , .1, .8, , .1]);
  scanSound = zzfxG(...[1.22, , 42, .05, .08, .48, , .57, , -4, -65, .06, .13, , , , , .8, .01, .49]);
  shipDieSound = zzfxG(...[1.2, , 129, .03, .13, .8, 4, 1.51, .1, .8, , , , .1, , .7, , .67, .02, .48]);
  beastDieSound = zzfxG(...[1.2, .1, 500, , .29, .34, 3, 2.43, .8, .4, , , .14, .3, , .3, .29, .79, .08, .25]);
  qDriveSound = zzfxG(...[1.08, , 27, .1, 2, .95, 4, , -0.5, , -62, .05, .12, , 46, , , .53, .1, .07]);
  hullHitSound = zzfxG(...[1.69, .1, 400, , .05, .35, 4, 1.8, -7, -1, , , , , , .2, , .4]);
};
