import { GREY_999, HULL_RED, POWER_GREEN, WHITE } from "../colour";
import { createNode, node_interactive, node_render_function, node_size } from "../scene-node";
import { gl_pushTextureQuad, gl_restore, gl_save, gl_scale, gl_translate } from "../gl";

import { assert } from "../debug";
import { getTexture } from "../texture";
import { math } from "../math";
import { txt_empty_string } from "../text";

export const Align_Left = 0;
export const Align_Center = 1;
export const Align_Right = 2;

export type TextParameters =
  {
    _colour?: number,
    _textAlign?: number,
    _scale?: number,
    _width?: number;
  };

let textCache: Map<string, [string, number][]> = new Map();
let fontSize = 8;

let node_text: string[] = [];
let node_text_align: number[] = [];
let node_text_scale: number[] = [];
let node_text_colour: number[] = [];

export let createTextNode = (text: string, parameters: TextParameters = {}): number =>
{
  let width = parameters._width || 640;
  let nodeId = createNode();

  node_interactive[nodeId] = false;
  node_render_function[nodeId] = renderTextNode;

  node_text[nodeId] = text;
  node_text_align[nodeId] = parameters._textAlign || Align_Left;
  node_text_scale[nodeId] = parameters._scale || 1;
  node_text_colour[nodeId] = parameters._colour || WHITE;

  let numberOfLines = parseText(node_text[nodeId], width, node_text_scale[nodeId]);
  let textHeight = ((numberOfLines - 1) * ((fontSize + 2) * node_text_scale[nodeId])) + (fontSize * node_text_scale[nodeId]);

  node_size[nodeId] = [width, textHeight];

  return nodeId;
};

export let updateTextNode = (nodeId: number, text: string | null, parameters: TextParameters = {}): void =>
{
  node_text[nodeId] = text === null ? node_text[nodeId] : text;
  node_text_align[nodeId] = parameters._textAlign || node_text_align[nodeId];
  node_text_scale[nodeId] = parameters._scale || node_text_scale[nodeId];
  node_text_colour[nodeId] = parameters._colour || node_text_colour[nodeId];

  let numberOfLines = parseText(node_text[nodeId], node_size[nodeId][0], node_text_scale[nodeId]);
  let textHeight = ((numberOfLines - 1) * ((fontSize + 2) * node_text_scale[nodeId])) + (fontSize * node_text_scale[nodeId]);

  node_size[nodeId][1] = textHeight;
};

export let parseText = (text: string, width: number = 640, scale: number = 1): number =>
{
  if (textCache.has(`${ text }_${ scale }_${ width }`)) return textCache.get(`${ text }_${ scale }_${ width }`)?.length || 0;

  let letterSize: number = fontSize * scale;
  let resultLines: [string, number][] = [];
  let resultLine: string[] = [];

  let sourceLines = text.split("\n");
  for (let sourceLine of sourceLines)
  {
    let words: string[] = sourceLine.split(" ");
    for (let word of words)
    {
      resultLine.push(word);
      if ((resultLine.join(" ").length) * letterSize > width)
      {
        let lastWord = resultLine.pop();
        assert(lastWord !== undefined, `No last word to pop found.`);
        let line = resultLine.join(" ");
        let lineLength = line.replace(/[A-Z]/g, txt_empty_string).length;
        resultLines.push([line, lineLength]);
        resultLine = [lastWord];
      }
    }
    if (resultLine.length > 0)
    {
      let line = resultLine.join(" ");
      let lineLength = line.replace(/[A-Z]/g, txt_empty_string).length;
      resultLines.push([line, lineLength]);
    }
    resultLine = [];
  }

  textCache.set(`${ text }_${ scale }_${ width }`, resultLines);

  // return the number of lines this was parsed into
  return resultLines.length;
};

let renderTextNode = (nodeId: number, now: number, delta: number): void =>
{
  let text = node_text[nodeId];
  let align = node_text_align[nodeId];
  let scale = node_text_scale[nodeId];
  let colour = node_text_colour[nodeId];
  let size = node_size[nodeId];
  let x = 0;
  let y = 0;

  let letterSize: number = fontSize * scale;

  let xOffset: number = 0;

  let lines = textCache.get(`${ text }_${ scale }_${ size[0] }`);
  assert(lines !== undefined, `text lines not found`);

  let alignmentOffset: number = 0;

  for (let [line, characterCount] of lines)
  {
    let words: string[] = line.split(" ");
    let lineLength: number = characterCount * letterSize;

    if (align === Align_Center)
    {
      alignmentOffset = math.floor(-lineLength / 2);
    }
    else if (align === Align_Right)
    {
      alignmentOffset = math.floor(-(lineLength));
    }

    for (let word of words)
    {
      for (let letter of word.split(txt_empty_string))
      {
        if (letter === letter.toUpperCase() && /[a-z]+/i.test(letter))
        {
          if (letter === "R") colour = HULL_RED;
          else if (letter === "G") colour = POWER_GREEN;
          else if (letter === "F") colour = GREY_999;
          // @ifdef DEBUG
          else assert(false, `Non-control capital letter used ${ letter }`);
          // @endif
          continue;
        }
        let t = getTexture(letter);
        x = xOffset + alignmentOffset;
        gl_save();
        gl_translate(x, y);
        gl_scale(scale, scale);
        gl_pushTextureQuad(t._atlas, 0, 0, t._w, t._h, t._u0, t._v0, t._u1, t._v1, colour);
        gl_restore();
        xOffset += letterSize;
      }
      colour = node_text_colour[nodeId];
      xOffset += letterSize;
    }
    y += letterSize + scale * 2;
    xOffset = 0;
  }
};