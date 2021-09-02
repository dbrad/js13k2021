import { assert } from "./debug";
import { doc } from "./screen";
import { gl_createTexture } from "./gl";

export type Texture = {
  _atlas: WebGLTexture;
  _w: number;
  _h: number;
  _u0: number;
  _v0: number;
  _u1: number;
  _v1: number;
};

type TextureJson = {
  _type: "s" | "r";
  _name: string | string[];
  _x: number;
  _y: number;
  _w: number;
  _h: number;
};

type TextureAssetJson = {
  _textures: TextureJson[];
};

let sheet: TextureAssetJson = {
  _textures: [
    {
      _type: "s",
      _name: "#",
      _x: 0,
      _y: 0,
      _w: 1,
      _h: 1
    },
    {
      _type: "r",
      _name: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
      _x: 0,
      _y: 0,
      _w: 8,
      _h: 8
    },
    {
      _type: "r",
      _name: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "(", ")", "!", "?", ".", ",", "="],
      _x: 0,
      _y: 8,
      _w: 8,
      _h: 8
    },
    {
      _type: "r",
      _name: ["ps", "star", "gas", "rock", "shld", "brk", "ast", "stn", "prt", "bst", "ano"],
      _x: 0,
      _y: 16,
      _w: 16,
      _h: 16
    }
  ]
};

let TEXTURE_CACHE: Map<string, Texture> = new Map();
export let getTexture = (textureName: string): Texture =>
{
  let texture = TEXTURE_CACHE.get(textureName);
  assert(texture !== undefined, `Unable to load texture "${ textureName }"`);
  return texture;
};

export let loadSpriteSheet = (): Promise<void> =>
{
  let image: HTMLImageElement = new Image();

  return new Promise((resolve, reject) =>
  {
    try
    {
      image.addEventListener("load", () =>
      {
        let canvas = doc.createElement("canvas");
        let width = canvas.width = image.width;
        let height = canvas.height = image.height;
        canvas.getContext("2d")?.drawImage(image, 0, 0);

        let glTexture: WebGLTexture = gl_createTexture(canvas);

        for (let texture of sheet._textures)
        {
          if (texture._type === "s")
          {
            TEXTURE_CACHE.set(texture._name as string, {
              _atlas: glTexture,
              _w: texture._w,
              _h: texture._h,
              _u0: texture._x / width,
              _v0: texture._y / height,
              _u1: (texture._x + texture._w) / width,
              _v1: (texture._y + texture._h) / height
            });
          }
          else
          {
            for (let ox: number = texture._x, i: number = 0; ox < width; ox += texture._w)
            {
              TEXTURE_CACHE.set(texture._name[i], {
                _atlas: glTexture,
                _w: texture._w,
                _h: texture._h,
                _u0: ox / width,
                _v0: texture._y / height,
                _u1: (ox + texture._w) / width,
                _v1: (texture._y + texture._h) / height
              });
              i++;
            }
          }
        }
        resolve();
      });
      image.src = "data:image/webp;base64,UklGRsYDAABXRUJQVlA4TLoDAAAvz8AHEO+gKJLkJApYQir+TeXPzCSCbSRbbfCmCFJyGqJcWnAFeKSXKpOaSLaaq+miBvCGZyz81BLIpG1ivNeELwHB+v8BIQXZGNnICGFTEL4fzQYFkQayEQpiXFguFMQnYgddQmyA/mDfxN2A0yLbYZBl23bbNnATTSZ0UXH3/OcJPLz3CNH/50b0H4LbNpIk2dlJV1+pqr72CzdWpTsS6TpSJyiwsZ7SFNVxQ74fW/uXOcH1+nMlbgLo23cHXv+21wlxHakTONtlSqX0BONShs2zNwNsGDe869bpeeq6jkicqau1ryeFrSbLpnmM69uGUyy2Y15k+nlFbkhi+72VG4aA338fghi8kKgzSSskWWdIgaBOvL024hfg4u867nkA265Pr8vp58LmfqTmPVmH056qL76eQ8qVIA1p3HHeTtSPXH3RZROOX2ZccO6vXMEluoMCmbr2r35eQ8jO//YTRMcLh7Wwd6ffX34FHvHgJOvytgtq9PuTn8hdE1wg6fvYLdqvJ48Xf40+/P5tuJ7D+3kMcZf3vuDvvuHj6oZNdSRId7Vnj3/GPFcgX8/ATbKn8dmbS5oSUmBTczzh23tc/pDuJOHqIAlXk6Srv9O+CbVq2XF2A0hedie5yaRDRfKyW0lO7irPT2GKszTnQFcMkwRR2/uYD82HbihqVoCaDAvTojBzPUlIktQ4uioj+Pn9AL6CzW58H6QuZDxVjGu7jdLJOBPLbBTeJpKb+Uy9FkmNF0dlEG/GQTh2QzZtx5UM1TZ8J4670BkssyPLPz2q8+9PmRaEhDAFNNZOo+JT0vejpAfuSdKFS7eQIxWwyhu4+QFnyUb1i9Gqn2mJVKh0JYzi3bhF810AOkhyQmb85r6xuUXgVN4QYJI5kA3pCDT/Luem5RmW9pcCFfMcH8Qv783/ZE2KqV80RWgezjpXO7sXoln/dtS8lufz8eZ4fu60PBegcsP8v4zSE5ipMU2loYCp0md3BgwgjeD/sqoHiVaKI+CdwA0MqyQwYHkeh5eUDJNa2oUOLTAxjGrA2cAU42SY5LPTEcozZ3hdpVdJq+Q8uiqvw+wlpbO/iYlgk+53w24l+gGzk4sQCJwE6wKvobxxr5zGmhoGJ5E6ugMe1CO130ljUEvW4Nkofixeg1Gx5hjxbFW5XOeb0RWACdlHD/ReQMq+xwuxtUSP+m9oZHU0S42jDfVqXNneR/BkgGaH7HdWAVINmQ/hPN2qiomTp2tBFBAFmMh9B+9FR/ewcAn0Z/9P2dGIjhc=";
    }
    catch (err)
    {
      reject(err);
    }
  });
};