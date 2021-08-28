import { createNode, node_interactive, node_render_function, node_size } from "../scene-node";
import { gl_pushTextureQuad, gl_restore, gl_save, gl_scale, gl_translate } from "../gl";

import { WHITE } from "../colour";
import { assert } from "../debug";
import { getTexture } from "../texture";
import { math } from "../math";

export enum Align
{
  L,
  C,
  R
}

export type TextParameters =
  {
    _colour?: number,
    _textAlign?: Align,
    _scale?: number;
  };

let textCache: Map<string, string[]> = new Map();
let fontSize = 8;

let node_text: string[] = [];
let node_text_align: Align[] = [];
let node_text_scale: number[] = [];
let node_text_colour: number[] = [];

export let createTextNode = (text: string, width: number, parameters: TextParameters = {}): number =>
{
  let nodeId = createNode();

  node_interactive[nodeId] = false;
  node_render_function[nodeId] = renderTextNode;

  node_text[nodeId] = text;
  node_text_align[nodeId] = parameters._textAlign || Align.L;
  node_text_scale[nodeId] = parameters._scale || 1;
  node_text_colour[nodeId] = parameters._colour || WHITE;

  let numberOfLines = parseText(node_text[nodeId], width, node_text_scale[nodeId]);
  let textHeight = ((numberOfLines - 1) * ((fontSize + 2) * node_text_scale[nodeId])) + (fontSize * node_text_scale[nodeId]);

  node_size[nodeId] = [width, textHeight];

  return nodeId;
};

export let updateTextNode = (nodeId: number, text: string, parameters: TextParameters = {}): void =>
{
  node_text[nodeId] = text;
  node_text_align[nodeId] = parameters._textAlign || node_text_align[nodeId];
  node_text_scale[nodeId] = parameters._scale || node_text_scale[nodeId];
  node_text_colour[nodeId] = parameters._colour || node_text_colour[nodeId];

  let numberOfLines = parseText(node_text[nodeId], node_size[nodeId][0], node_text_scale[nodeId]);
  let textHeight = ((numberOfLines - 1) * ((fontSize + 2) * node_text_scale[nodeId])) + (fontSize * node_text_scale[nodeId]);

  node_size[nodeId][1] = textHeight;
};

export let parseText = (text: string, width: number, scale: number = 1): number =>
{
  let letterSize: number = fontSize * scale;
  let allWords: string[] = text.split(" ");
  let lines: string[] = [];
  let line: string[] = [];
  for (let word of allWords)
  {
    line.push(word);
    if ((line.join(" ").length) * letterSize > width)
    {
      let lastWord = line.pop();
      assert(lastWord !== undefined, `No last word to pop found.`);
      lines.push(line.join(" "));
      line = [lastWord];
    }
  }
  if (line.length > 0)
  {
    lines.push(line.join(" "));
  }
  textCache.set(`${ text }_${ scale }_${ width }`, lines);
  return lines.length;
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

  for (let line of lines)
  {
    let words: string[] = line.split(" ");
    let lineLength: number = line.length * letterSize;

    let alignmentOffset: number = 0;
    if (align === Align.C)
    {
      alignmentOffset = math.floor(-lineLength / 2);
    }
    else if (align === Align.R)
    {
      alignmentOffset = math.floor(-(lineLength));
    }

    for (let word of words)
    {
      for (let letter of word.split(""))
      {
        let t = getTexture(letter);
        x = xOffset + alignmentOffset;
        gl_save();
        gl_translate(x, y);
        gl_scale(scale, scale);
        gl_pushTextureQuad(t._atlas, 0, 0, t._w, t._h, t._u0, t._v0, t._u1, t._v1, colour);
        gl_restore();
        xOffset += letterSize;
      }
      xOffset += letterSize;
    }
    y += letterSize + scale * 2;
    xOffset = 0;
  }
};