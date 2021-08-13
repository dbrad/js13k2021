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
  _url: string;
  _textures: TextureJson[];
};

let sheet: TextureAssetJson = {
  _url: "sheet.png",
  _textures: [
    {
      _type: "s",
      _name: "#",
      _x: 3,
      _y: 0,
      _w: 1,
      _h: 1
    },
    {
      _type: "r",
      _name: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
      _x: 0,
      _y: 0,
      _w: 8,
      _h: 8
    },
    {
      _type: "r",
      _name: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
      _x: 0,
      _y: 8,
      _w: 8,
      _h: 8
    },
    {
      _type: "r",
      _name: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "(", ")", "!", "?", ",", ".", ":", ";", "'", "\"", "&", "-", "_", "/", "\\", "[", "]", "+", "…"],
      _x: 0,
      _y: 16,
      _w: 8,
      _h: 8
    }
  ]
};

const TEXTURE_CACHE: Map<string, Texture> = new Map();
export function getTexture(textureName: string): Texture
{
  let texture = TEXTURE_CACHE.get(textureName);
  assert(texture !== undefined, `Unable to load texture "${ textureName }"`);
  return texture;
}

export function loadSpriteSheet(): Promise<void>
{
  const image: HTMLImageElement = new Image();

  return new Promise((resolve, reject) =>
  {
    try
    {
      image.addEventListener("load", () =>
      {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext("2d")?.drawImage(image, 0, 0);

        const glTexture: WebGLTexture = gl_createTexture(canvas);

        for (const texture of sheet._textures)
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
      image.src = sheet._url;
    }
    catch (err)
    {
      reject(err);
    }
  });
};