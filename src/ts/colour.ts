export function hexToColour(abgr: number): [number, number, number, number] {
  abgr >>>= 0;
  const r: number = abgr & 0xFF;
  const g: number = (abgr & 0xFF00) >>> 8;
  const b: number = (abgr & 0xFF0000) >>> 16;
  const a: number = ((abgr & 0xFF000000) >>> 24);
  return [a, b, g, r];
}

export function colourToHex(a: number, b: number, g: number, r: number): number {
  let out: number = 0x0;
  out = ((out | (a & 0xff)) << 8) >>> 0;
  out = ((out | (b & 0xff)) << 8) >>> 0;
  out = ((out | (g & 0xff)) << 8) >>> 0;
  out = ((out | (r & 0xff))) >>> 0;
  return out;
}
