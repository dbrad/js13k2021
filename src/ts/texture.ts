import { assert } from "./debug";
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
      _name: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "(", ")", "!", "?", ".", ",", ";", ":", "'", "\"", "_", "-", "+", "/", "\\"],
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
        let canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
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
              _u0: texture._x / canvas.width,
              _v0: texture._y / canvas.height,
              _u1: (texture._x + texture._w) / canvas.width,
              _v1: (texture._y + texture._h) / canvas.height
            });
          }
          else
          {
            for (let ox: number = texture._x, i: number = 0; ox < canvas.width; ox += texture._w)
            {
              TEXTURE_CACHE.set(texture._name[i], {
                _atlas: glTexture,
                _w: texture._w,
                _h: texture._h,
                _u0: ox / canvas.width,
                _v0: texture._y / canvas.height,
                _u1: (ox + texture._w) / canvas.width,
                _v1: (texture._y + texture._h) / canvas.height
              });
              i++;
            }
          }
        }
        resolve();
      });
      image.src = "data:image/webp;base64,UklGRvQDAABXRUJQVlA4TOcDAAAvz8AHEO+gKJLkJApYQir+TeXPzCSCbSRbbfCmCFJyGqJcWnAFeKSXKpOaSLaaq+miBvCGZyz81BLIpG1ivNeELwHB+v8BIQXZGNnICGFTEL4fzQYFkQayEQpiXFguFMQnYgddQmyA/mDfxN2A0yLbYZBl23bbNoCdiBETuqi4e/7zJB7ee4Cc/3Mj+g9BkiRHTfWMmHPQa0FfqFaleyfSPlIfUGDQT2mKfFTy7RhtX+YDbteeG1ED6M//OPDaN+4TYh+pD3Duy1il9AT9UqaNszcCDPQb3rx1Wp6a1xGJT3K8Wr8prJssQ+MY+xujBuNX8TLTzhtSSWLbPUplhHgepMYvyMkHCZ9JmpGkz/w+1feP99QgvgEX//Z5+wEMja/X7vw+MtyO1LgnfTjnU/4sI280n9F9Lo3bz+NE7cj5i6ZNvE4T7cdZXznDJVpBgcxEHlVk21ifrnhcp36/kd4/0l8ttZCOylwCN7XgmE5/f/kOgnmaanRmHgfOKr7VMUJ/znNDeH09TDDh0+vYbYfvZ5Txg0FbYcOD9TRIBXzfA/M5XM9zGJ4PzCTynSV6m/QKrAz5yDA6ryd8yoDvfPvm7CuQ9zPvlsH1CUOECyuc3gNR0pSQApEfz/foGwU9lE1giFvrXhKuDpJwtUhKfKfN1iehNq3lp+peFZC86l5yi0WHHcmr7iQ5tas8X4UlrtJcAt0wTRHkfr7P46HFoeuKvSqAVKelOaOwcmORkCSpcXJVZvD1/QZ8BLdVPw5SlzKx7JjYz9ssnUxkcj0ahctEciufpdcqqfHkqEzixUSQTrgpW7b3lQx72PQj8b4rXYDl6MjyV3/UxfdXWVaEhDAGGlunWfku6fOPpN/8IkmXLt1BjlTCJq/jjr9xjmzu8WS06WtZIxV2OguzeDXRssV9ADpIclKm/479yRYtg0jVDQGmOAayKZ2AFt/rpWl9hLX9pcCO2ccn8c1ri7+yQYqlPzQmdJzOdtzDebwQjfqnoxZbebyc6uny2Gl9LMBO5fivzNIDmKExp0pDActOX90bMIA0g3/rph4kmhVHwCtBNDBsksCA5XEeXlEyLGpllzq0xOQ0tNqnVnfxORWmeO90gvLIBZ436VnSJjlb187ztPCK0oV/i8nglu514LESvYB5yEUIBE6BjQLPobx+3znPDfY0OIXU0b3hQT1Se100B7ViC/ZG8WXxThgVG5wiHq12rrf5zegKwKTs1gN9rCBlv8cLcWiNtvpPaGR1MkeNk031atw4vB/BiwFaOGR/ZxUgdSLzQzhPd2nH5NnTrSBKiBJM5n4H/xSd3LeFa6D/9v+UH9Sj8wUA";
    }
    catch (err)
    {
      reject(err);
    }
  });
};