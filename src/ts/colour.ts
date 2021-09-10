export let hexToColour = (abgr: number): [number, number, number, number] =>
{
  abgr >>>= 0;
  let r: number = abgr & 0xFF;
  let g: number = (abgr & 0xFF00) >>> 8;
  let b: number = (abgr & 0xFF0000) >>> 16;
  let a: number = ((abgr & 0xFF000000) >>> 24);
  return [a, b, g, r];
};

export let colourToHex = (a: number, b: number, g: number, r: number): number =>
{
  let out: number = 0x0;
  out = ((out | (a & 0xff)) << 8) >>> 0;
  out = ((out | (b & 0xff)) << 8) >>> 0;
  out = ((out | (g & 0xff)) << 8) >>> 0;
  out = ((out | (r & 0xff))) >>> 0;
  return out;
};

export let WHITE = 0xFFFFFFFF;
export let GREY_111 = 0xFF111111;
export let GREY_222 = 0xFF222222;
export let GREY_333 = 0xFF333333;
export let GREY_666 = 0xFF555555;
export let GREY_999 = 0xFF999999;
export let GREY_6333 = 0x33333333;
export let SHIELD_BLUE = 0xBBFFAAAA;
export let HULL_RED = 0xFF0F0FE6;
export let POWER_GREEN = 0xFF50FF5A; // 5aff50
export let Q_DRIVE_PURPLE = 0xFFCC3399;
export let SPACE_BEAST_PURPLE = 0xFFAA77AA;
export let STAR_COLOURS: number[] = [0xFFFFE1BB, 0xFF152fff, 0xFF87f2ff];
export let GAS_PLANET_COLOURS: number[] = [0xFFe1903f, 0xFF61c7ee, 0xFFa9e1f6];
export let ROCK_PLANET_COLOURS: number[] = [0xFF3d5b66, 0xFF2644d9, 0xFF8db4c8]; // c8b48d