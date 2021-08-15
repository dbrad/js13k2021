import { createNode, node_interactive, node_render_function, node_size } from "../scene-node";
import { gl_pushTextureQuad, gl_restore, gl_save, gl_scale, gl_translate } from "../gl";

import { assert } from "../debug";
import { getTexture } from "../texture";

export const enum Align
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

const textCache: Map<string, string[]> = new Map();
const fontSize = 8 as const;

const node_text: string[] = [];
const node_text_align: Align[] = [];
const node_text_scale: number[] = [];
const node_text_colour: number[] = [];

export function createTextNode(text: string, width: number, parameters: TextParameters = {}): number
{
  const nodeId = createNode();

  node_interactive[nodeId] = false;
  node_render_function[nodeId] = renderTextNode;

  text = text.toUpperCase();
  node_text[nodeId] = text;
  node_text_align[nodeId] = parameters._textAlign || Align.L;
  node_text_scale[nodeId] = parameters._scale || 1;
  node_text_colour[nodeId] = parameters._colour || 0xFFFFFFFF;

  const numberOfLines = parseText(node_text[nodeId], width, node_text_scale[nodeId]);
  const textHeight = ((numberOfLines - 1) * ((fontSize + 2) * node_text_scale[nodeId])) + (fontSize * node_text_scale[nodeId]);

  node_size[nodeId] = [width, textHeight];

  return nodeId;
}

export function updateTextNode(nodeId: number, text: string, parameters: TextParameters = {}): void
{
  text = text.toUpperCase();
  node_text[nodeId] = text;
  node_text_align[nodeId] = parameters._textAlign || node_text_align[nodeId];
  node_text_scale[nodeId] = parameters._scale || node_text_scale[nodeId];
  node_text_colour[nodeId] = parameters._colour || node_text_colour[nodeId];

  const numberOfLines = parseText(node_text[nodeId], node_size[nodeId][0], node_text_scale[nodeId]);
  const textHeight = ((numberOfLines - 1) * ((fontSize + 2) * node_text_scale[nodeId])) + (fontSize * node_text_scale[nodeId]);

  node_size[nodeId][1] = textHeight;
}

function parseText(text: string, width: number, scale: number = 1): number
{
  const letterSize: number = fontSize * scale;
  const allWords: string[] = text.split(" ");
  const lines: string[] = [];
  let line: string[] = [];
  for (const word of allWords)
  {
    line.push(word);
    if ((line.join(" ").length) * letterSize > width)
    {
      const lastWord = line.pop();
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
}

function renderTextNode(nodeId: number, now: number, delta: number): void
{
  const text = node_text[nodeId];
  const align = node_text_align[nodeId];
  const scale = node_text_scale[nodeId];
  const colour = node_text_colour[nodeId];
  const size = node_size[nodeId];
  let x = 0;
  let y = 0;

  const letterSize: number = fontSize * scale;

  let xOffset: number = 0;

  const lines = textCache.get(`${ text }_${ scale }_${ size[0] }`);
  assert(lines !== undefined, `text lines not found`);

  for (const line of lines)
  {
    const words: string[] = line.split(" ");
    const lineLength: number = line.length * letterSize;

    let alignmentOffset: number = 0;
    if (align === Align.C)
    {
      alignmentOffset = ~~((-lineLength + (1 * scale)) / 2);
    }
    else if (align === Align.R)
    {
      alignmentOffset = ~~-(lineLength - (1 * scale));
    }

    for (const word of words)
    {
      for (const letter of word.split(""))
      {
        const t = getTexture(letter);
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
}