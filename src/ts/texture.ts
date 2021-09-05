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

export let SPRITE_PLAYER_SHIP = "ps";
export let SPRITE_STAR = "st";
export let SPRITE_GAS_PLANET = "gp";
export let SPRITE_ROCK_PLANET = "rp";
export let SPRITE_SHIELD = "sh";
export let SPRITE_RANGE_BRACKET = "br";
export let SPRITE_ASTEROID = "as";
export let SPRITE_STATION = "sn";
export let SPRITE_PIRATE_SHIP = "pr";
export let SPRITE_SPACE_BEAST = "bs";
export let SPRITE_ANOMALY = "an";

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
      _name: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "(", ")", "!", "?", ".", ",", "=", "-", "+"],
      _x: 0,
      _y: 8,
      _w: 8,
      _h: 8
    },
    {
      _type: "r",
      _name: [SPRITE_PLAYER_SHIP, SPRITE_STAR, SPRITE_GAS_PLANET, SPRITE_ROCK_PLANET, SPRITE_SHIELD, SPRITE_RANGE_BRACKET, SPRITE_ASTEROID, SPRITE_STATION, SPRITE_PIRATE_SHIP, SPRITE_SPACE_BEAST, SPRITE_ANOMALY],
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
      image.src = "data:image/webp;base64,UklGRtADAABXRUJQVlA4TMMDAAAvz8AHEO+gKJLkJApYQir+TeXPzCSCbSRbbfCmCFJyGqJcWnAFeKSXKpOaSLaaq+miBvCGZyz81BLIpG1ivNeELwHB+v8BIQXZGNnICGFTEL4fzQYFkQayEQpiXFguFMQnYgddQmyA/mDfxN2A0yLbYZBl23bbNnATTTp0UXH3/OcJPLz3CCr/50b0H4LbNpIk2dlJV1+pqr72CzdWpTsS6TpSJyiwsZ7SFNVxQ74fW/uXOcF+/dmJmwD69qsDr3/b64S4jtQJnO0ypVJ6gnEpw+bZmwE2jBvedev0PHVdRyTO1NXa15PCVpNl0zzG9W3DKRbbMS8y/dyRG5LYfm/lhiHg99+HIAYvJOpM0gpJ1hlSIKgTb6+N+AW4+LuOex7AtuvT63L6ubC5H6l5T9bhtKfqi6/nkLITpCGNO87bifqRqy+6bMLxy4wLzv2VK7hEd1AgU9f1q5/XELLzv/0E0fHCYS0M827DnX5/+RUEpDp5Q/K6CwfE709+Iq+a4AJJ38du0X49ebzIE5/gWujD79+G6zm8n8ew5Xq+Yvo+JEfAsKmOBOn7sucaF8Y8VyBfz8BNsqfZwv4uaUpIgaieoO54wrf3uPxHupOEq4MkXE2S4skoo/VDqFXLFWc3gORld5KbTDpUJC+7leTkrvL8FqY4S3MOtGOYJIja3sd8aD50Q1GzAtRkWJgWhZnrSUKSpMbRVRnB798n8B1sduP7IHUh46liXNttlE7GmVhmo/A2kdzMZ+q1SGq8OiqDeDcOwrEbsmk7rmSotuE7cdyFzmCZHVme9KjOf79lWhASwhTQWDuNii9JP4+SHrgnSRcu3UKOVMAqb+DmB5wlG9WvRqt+pyVSodKVMIoP4xbNdwHoIMkJmfGb+8bmFoFTeUOASeZANqQj0Py3nJuWF1jaXwpUzHN8EH98ND/JmhRTv2iK0Dycda52di9Es/7jqHktL+fjzfH80ml5KUDlhvlfGaVnMFNjmkpDAVOlz+4MGEAawb9lVQ8SrRRHwAeBGxhWSWDA8jIOLykZJrW0Cx1aYGIY1YCzgSnGyTDJV6cjlBfO8LZKb5JWyXl0Vd6G2UtKZ38TE8Em3e+G3Ur0A2YnFyEQOAnWBd5CeeNeOY01NQxOInV0BzyoR2q/k8aglqzBs1H8WrwGo2LNMeLFqnLZ55vRFYAJ2UcP9F5Ayr7HC7G1RI/6H2hkdTRLjaMN9WrsbO8jeDJAs0P2O6sAqYbMh3CeblXFxMnTXhAFRAEmct/B16Kje1i4BPpv/0+5ohEdLwAA";
    }
    catch (err)
    {
      reject(err);
    }
  });
};