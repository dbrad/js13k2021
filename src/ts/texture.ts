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
      _name: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "!", "?", ".", ",", "=", "-", "+"],
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
          let { _w, _h, _x, _y, _name } = texture;
          if (texture._type === "s")
          {
            TEXTURE_CACHE.set(_name as string, {
              _atlas: glTexture,
              _w: _w,
              _h: _h,
              _u0: _x / width,
              _v0: _y / height,
              _u1: (_x + _w) / width,
              _v1: (_y + _h) / height
            });
          }
          else
          {
            for (let ox: number = _x, i: number = 0; ox < width; ox += _w)
            {
              TEXTURE_CACHE.set(_name[i], {
                _atlas: glTexture,
                _w: _w,
                _h: _h,
                _u0: ox / width,
                _v0: _y / height,
                _u1: (ox + _w) / width,
                _v1: (_y + _h) / height
              });
              i++;
            }
          }
        }
        resolve();
      });
      image.src = "data:image/webp;base64,UklGRsIDAABXRUJQVlA4TLYDAAAvz8AHEO+gKJLkJApYQir+TeXPzCSCbSRbbfCmCFJyGqJcWnAFeKSXKpOaSLaaq+miBvCGZyz81BLIpG1ivNeELwHB+v8BIQXZGNnICGFTEL4fzQYFkQayEQpiXFguFMQnYgddQmyA/mDfxN2A0yLbYYBl21bbhjQrUqIUl/TMf57weO8J2//nRvQfgiRJUpvqHmtYQJo9OPyFG6vSfRPpOlI/UGBjPaUpquOGfD+29i/zA+frz5m4CaBvvzjw+re9TojrSP2Ac1ymVEpPMC5l2Dx7M8CGccNbt07PU+s6IvFLXa19PSlsNVk2zWNc3zacYrEd8yLTzzNyQxLb763cMAT8/vsQxOCNRJ1JWiHJOkMKBHXinbURvwAX/9Rx9wPYtj69LqfvC5v7kZr3ZB1Oe6q+eD2HlDNBGtK447ydqB+5+qJlE45fZlxwrq9cwcWVqeP61M9rCNn53/wDwRVk53lU1y+E9PPLryAg6HS2Lh8M+Ym7KoIFn76O3aL9enq8yBP/wKXSh9/fDes5vJ5zbFnPV8QNZHoejNvGOrLXZc81bIy5r8Doem7IzgJbuDyXNCWkQFgPQ5arE1esO0m42knC1STp7M+435hVywVnN4DkZXeSm0zaVSQvu5XkLGtXef4KU5ylOQY6Y5gkiNrex7xr3nVDUbMC1GRYmBaFmetJQpKkxt5VGcHf/xfwExx243sndSHjqWJc222UTsaZWGaj8DKR3Mxn6rVIarw5KoP4MA7CsRuyafteyVBtw3fiexc6g2V2ZHnSozr//5VpQUgIU0Bj7TQqviX9Pkp64J4kXbh0GzlSAau8gZsfcLZsVL8ZrfqblkiFSlfCKD6NWzTfBaCdJCdkxm/uG5tbBE7lDQEmmQPZkPZA8/9ybFpeYWl/KVAx9/FB/PPZ/CRrUkz9pilC83DWudo5vRDN+q+j5rW8Hvc3++Nrp+W1AJUb5ucySi9gpsY0lYYCpkqf3RkwgDSC52VVDxKtFEfAJ4EbGFZJYMDyOg4vKRkmtbQL7VpgYhjVgHOAKcbJMMl3pz2UV47wvkrvklbJuXVV3ofZS0pn/xATwSHd54bTSvQB5iQXIRA4CdYF3kN54145jDU1DE4idXRfuFOP1D4njUEtWYN7o/izeA1GxZp9xKtV5XSed0ZXACZkbz3QewEp+xwvxNYS3ep/oZHV3mw19jbUq3Fmey/BkwGaHbLvWQVINWRehPN0uyomDp7OBVFAFGAi9x58Kdq7XwunQFf7f8oFjeh4AQ==";
    }
    catch (err)
    {
      reject(err);
    }
  });
};