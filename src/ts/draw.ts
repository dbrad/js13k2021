import { gl_pushTextureQuad, gl_restore, gl_save, gl_translate } from "./gl";

import { WHITE } from "./colour";
import { getTexture } from "./texture";

export let pushQuad = (x: number, y: number, w: number, h: number, colour: number = WHITE): void =>
{
  let t = getTexture(`#`);
  gl_save();
  gl_translate(x, y);
  gl_pushTextureQuad(t._atlas, 0, 0, w, h, t._u0, t._v0, t._u1, t._v1, colour);
  gl_restore();
};