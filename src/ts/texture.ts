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
      _name: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "(", ")", "!", "?", ".", ",", ";", ":", "'", "\"", "=", "-", "+", "/", "\\"],
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
      image.src = "data:image/webp;base64,UklGRvIDAABXRUJQVlA4TOUDAAAvz8AHEO+gKJLkJApYQir+TeXPzCSCbSRbbfCmCFJyGqJcWnAFeKSXKpOaSLaaq+miBvCGZyz81BLIpG1ivNeELwHB+v8BIQXZGNnICGFTEL4fzQYFkQayEQpiXFguFMQnYgddQmyA/mDfxN2A0yLbYZBl23bbNqCdiBETuqi4e/7zBB7ee4Cc/3Mj+g/BbRtJkpzspM9yVVcf+4XFqnRnIu0j1UCBQT+lKfKxkO/HaP8yDdyuPzdiCaBf/+PA69+4T4h9pBpw9stYpfQE41KmXWfvCjAwbnjz1ul5al5HJFrqvPZ+Ulg3WYauY+xvDMcstmNeZvp5QxaS2H6PsjAF/P77EOTkhYTPJM1I0mdIgcAn3lGD+AZc/EPnPQ9gbH56XU4/F4b7kbruSR/O+pS/eD6HlBtBGtK44zxO1I+cv2jahOOXGRec+ytnuER3UCDja1SRbWN9uvrrGkL2+o83EJ0vHNZCOhbyTPC5FBzT6feX7yAg6HTSl7sf8aMBxgj9Occ5EzSDN9bDBBM+fR+7/fD95MlktpmRiRs34BpdGKBP3//AfA7v5znk58OMGzIm8j3EAiM9NQz5yDA6r2e0kl/I92/OcwVm+1mYNl59AzegH7yBKGlKSIHIT+g739GomUT+B7qXhKuDJFytkhLvtNn6JNSu7QdXCyB51b3kFqsOFcmr7iQ5tas8X4U1rtJcAt0wTRFkXd/n8dDi0A1FrQpQi2lp1iis3FglJElqnFyVGXx9vwEfwW6LHwepS5lYKybqepu9YxOZ3I5G4W0iuZXP2muT1HhyVCbxYiJIJ9yULdt5JUMNm34kzrvRBViOjix/9UddfH+VdUNICGOgsXeale+SPv9I+s0vknTp0i3kSCXs8gbu+BtnyWaNJ6NdX+sWqVDpLMzi1UTLFvcB6CDJSZnxO/YrW7QMIlU3BJjiGMimdAJafG+Xpu0RtvaXAhXzHJ/EN68t/soGKdZ+0ZjQcTr7sYZzeCG66p+OWuzl8XJaTpfHTttjASoLx39llh7AXBqzqjQUsFb66t6AAaQZ/Nt29SDRrDgCXgmigWGXBAYsj/PwipJhVSu71KElJqdRA3B2MGacClO8dzpBeeQCz7v0LGmXnEdX5XlaeEXpwt/FZLBL9ztwWIl+wBzkIgQCp8BGgedQ3rhXznODmgankDq6Ex7UI7XfVXNQK/bg2Si+LN4Ko2KDU8SjVeV6m29GVwAmZR890McGUvY9XohDW/So/4RGViez1DjZVK/GjcP7CF4N0MIh+51VgNSKzIdwnm5TxeTZ060gSogSTOa+g3+KTu5p4Rrov/0/5QeN6HwBAA==";
    }
    catch (err)
    {
      reject(err);
    }
  });
};