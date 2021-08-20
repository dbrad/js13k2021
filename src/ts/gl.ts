import { WHITE } from "./colour";
import { assert } from "./debug";

let ctx: WebGLRenderingContext;
let width: number;
let height: number;

// xy + uv + argb
let VERTEX_SIZE: number = (4 * 2) + (4 * 2) + (4);
let MAX_BATCH: number = 10922;
let VERTICES_PER_QUAD: number = 6;
let VERTEX_DATA_SIZE: number = VERTEX_SIZE * MAX_BATCH * 4;
let INDEX_DATA_SIZE: number = MAX_BATCH * (2 * VERTICES_PER_QUAD);

let vertexData: ArrayBuffer = new ArrayBuffer(VERTEX_DATA_SIZE);
let vPositionData: Float32Array = new Float32Array(vertexData);
let vColorData: Uint32Array = new Uint32Array(vertexData);
let vIndexData: Uint16Array = new Uint16Array(INDEX_DATA_SIZE);

let mat: Float32Array = new Float32Array([1, 0, 0, 1, 0, 0]);
let stack: Float32Array = new Float32Array(60);

let TEXTURE_2D = 3553;

let indexBuffer: WebGLBuffer;
let vertexBuffer: WebGLBuffer;
let count: number = 0;
let stackp: number = 0;
let currentTexture: WebGLTexture;
let vertexAttr: number;
let textureAttr: number;
let colourAttr: number;

export let gl_getContext = (canvas: HTMLCanvasElement): WebGLRenderingContext =>
{
  width = canvas.width;
  height = canvas.height;
  let context = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "high-performance", preserveDrawingBuffer: true });
  assert(context !== null, `Unable to get GL context.`);
  return context;
};

export let gl_init = (context: WebGLRenderingContext): void =>
{
  ctx = context;

  let compileShader = (source: string, type: number): WebGLShader =>
  {
    let glShader = ctx.createShader(type);
    assert(glShader !== null, `Unable to created shader`);
    ctx.shaderSource(glShader, source);
    ctx.compileShader(glShader);
    return glShader;
  };

  let createShaderProgram = (vsSource: string, fsSource: string): WebGLProgram =>
  {
    let program = ctx.createProgram();
    assert(program !== null, `Unable to created program`);
    let vShader: WebGLShader = compileShader(vsSource, 35633);
    let fShader: WebGLShader = compileShader(fsSource, 35632);
    ctx.attachShader(program, vShader);
    ctx.attachShader(program, fShader);
    ctx.linkProgram(program);
    return program;
  };

  let createBuffer = (bufferType: number, size: number, usage: number): WebGLBuffer =>
  {
    let buffer = ctx.createBuffer();
    assert(buffer !== null, `Unable to created buffer`);
    ctx.bindBuffer(bufferType, buffer);
    ctx.bufferData(bufferType, size, usage);
    return buffer;
  };

  let shader: WebGLShader = createShaderProgram(
    `precision lowp float;attribute vec2 v,t;attribute vec4 c;varying vec2 uv;varying vec4 col;uniform mat4 m;void main() {gl_Position = m * vec4(v, 1.0, 1.0);uv = t;col = c;}`,
    `precision lowp float;varying vec2 uv;varying vec4 col;uniform sampler2D s;void main() {gl_FragColor = texture2D(s, uv) * col;}`
  );

  indexBuffer = createBuffer(34963, vIndexData.byteLength, 35044);
  vertexBuffer = createBuffer(34962, vertexData.byteLength, 35048);

  ctx.blendFunc(770, 771);
  ctx.enable(3042);
  ctx.useProgram(shader);
  ctx.bindBuffer(34963, indexBuffer);
  for (let indexA: number = 0, indexB: number = 0; indexA < MAX_BATCH * VERTICES_PER_QUAD; indexA += VERTICES_PER_QUAD, indexB += 4)
  {
    vIndexData[indexA + 0] = indexB;
    vIndexData[indexA + 1] = indexB + 1;
    vIndexData[indexA + 2] = indexB + 2;
    vIndexData[indexA + 3] = indexB + 0;
    vIndexData[indexA + 4] = indexB + 3;
    vIndexData[indexA + 5] = indexB + 1;
  }

  ctx.bufferSubData(34963, 0, vIndexData);
  ctx.bindBuffer(34962, vertexBuffer);

  vertexAttr = ctx.getAttribLocation(shader, "v");
  textureAttr = ctx.getAttribLocation(shader, "t");
  colourAttr = ctx.getAttribLocation(shader, "c");

  ctx.enableVertexAttribArray(vertexAttr);
  ctx.vertexAttribPointer(vertexAttr, 2, 5126, false, VERTEX_SIZE, 0);
  ctx.enableVertexAttribArray(textureAttr);
  ctx.vertexAttribPointer(textureAttr, 2, 5126, false, VERTEX_SIZE, 8);
  ctx.enableVertexAttribArray(colourAttr);
  ctx.vertexAttribPointer(colourAttr, 4, 5121, true, VERTEX_SIZE, 16);
  ctx.uniformMatrix4fv(ctx.getUniformLocation(shader, "m"), false, new Float32Array([2 / width, 0, 0, 0, 0, -2 / height, 0, 0, 0, 0, 1, 1, -1, 1, 0, 0]));
  ctx.activeTexture(33984);
};

export let gl_createTexture = (image: HTMLImageElement | HTMLCanvasElement): WebGLTexture =>
{
  let texture = ctx.createTexture();
  assert(texture !== null, `Unable to create texture.`);
  ctx.bindTexture(TEXTURE_2D, texture);
  ctx.texParameteri(TEXTURE_2D, 10242, 33071);
  ctx.texParameteri(TEXTURE_2D, 10243, 33071);
  ctx.texParameteri(TEXTURE_2D, 10240, 9728);
  ctx.texParameteri(TEXTURE_2D, 10241, 9728);
  ctx.texImage2D(TEXTURE_2D, 0, 6408, 6408, 5121, image);
  ctx.bindTexture(TEXTURE_2D, null);
  return texture;
};

let background: [number, number, number] = [0, 0, 0];
export let gl_setClear = (r: number, g: number, b: number): void =>
{
  background = [r / 255, g / 255, b / 255];
  ctx.clearColor(background[0], background[1], background[2], 1);
};

export let gl_getClear = (): [number, number, number] =>
{
  return [background[0] * 255, background[1] * 255, background[2] * 255];
};

export let gl_clear = (): void =>
{
  ctx.clear(16384);
};

export let gl_translate = (x: number, y: number): void =>
{
  mat[4] = mat[0] * x + mat[2] * y + mat[4];
  mat[5] = mat[1] * x + mat[3] * y + mat[5];
};

export let gl_scale = (x: number, y: number): void =>
{
  mat[0] = mat[0] * x;
  mat[1] = mat[1] * x;
  mat[2] = mat[2] * y;
  mat[3] = mat[3] * y;
};

export let gl_rotate = (r: number): void =>
{
  let sr: number = Math.sin(r);
  let cr: number = Math.cos(r);

  mat[0] = mat[0] * cr + mat[2] * sr;
  mat[1] = mat[1] * cr + mat[3] * sr;
  mat[2] = mat[0] * -sr + mat[2] * cr;
  mat[3] = mat[1] * -sr + mat[3] * cr;
};

export let gl_save = (): void =>
{
  stack[stackp + 0] = mat[0];
  stack[stackp + 1] = mat[1];
  stack[stackp + 2] = mat[2];
  stack[stackp + 3] = mat[3];
  stack[stackp + 4] = mat[4];
  stack[stackp + 5] = mat[5];
  stackp += 6;
};

export let gl_restore = (): void =>
{
  stackp -= 6;
  mat[0] = stack[stackp + 0];
  mat[1] = stack[stackp + 1];
  mat[2] = stack[stackp + 2];
  mat[3] = stack[stackp + 3];
  mat[4] = stack[stackp + 4];
  mat[5] = stack[stackp + 5];
};

export let gl_pushTextureQuad = (texture: WebGLTexture, x: number, y: number, w: number, h: number, u0: number, v0: number, u1: number, v1: number, aabbggrr: number = WHITE): void =>
{
  let x0: number = x;
  let y0: number = y;
  let x1: number = x + w;
  let y1: number = y + h;
  let x2: number = x;
  let y2: number = y + h;
  let x3: number = x + w;
  let y3: number = y;
  let mat0: number = mat[0];
  let mat1: number = mat[1];
  let mat2: number = mat[2];
  let mat3: number = mat[3];
  let mat4: number = mat[4];
  let mat5: number = mat[5];
  let argb: number = aabbggrr;

  if (texture !== currentTexture || count + 1 >= MAX_BATCH)
  {
    ctx.bufferSubData(34962, 0, vertexData);
    ctx.drawElements(4, count * VERTICES_PER_QUAD, 5123, 0);
    count = 0;
    if (currentTexture !== texture)
    {
      currentTexture = texture;
      ctx.bindTexture(TEXTURE_2D, currentTexture);
    }
  }

  let offset: number = count * VERTEX_SIZE;

  // Vertex Order
  // Vertex Position | UV | ARGB
  // Vertex 1
  vPositionData[offset++] = x0 * mat0 + y0 * mat2 + mat4;
  vPositionData[offset++] = x0 * mat1 + y0 * mat3 + mat5;
  vPositionData[offset++] = u0;
  vPositionData[offset++] = v0;
  vColorData[offset++] = argb;

  // Vertex 2
  vPositionData[offset++] = x1 * mat0 + y1 * mat2 + mat4;
  vPositionData[offset++] = x1 * mat1 + y1 * mat3 + mat5;
  vPositionData[offset++] = u1;
  vPositionData[offset++] = v1;
  vColorData[offset++] = argb;

  // Vertex 3
  vPositionData[offset++] = x2 * mat0 + y2 * mat2 + mat4;
  vPositionData[offset++] = x2 * mat1 + y2 * mat3 + mat5;
  vPositionData[offset++] = u0;
  vPositionData[offset++] = v1;
  vColorData[offset++] = argb;

  // Vertex 4
  vPositionData[offset++] = x3 * mat0 + y3 * mat2 + mat4;
  vPositionData[offset++] = x3 * mat1 + y3 * mat3 + mat5;
  vPositionData[offset++] = u1;
  vPositionData[offset++] = v0;
  vColorData[offset++] = argb;

  if (++count >= MAX_BATCH)
  {
    ctx.bufferSubData(34962, 0, vertexData);
    ctx.drawElements(4, count * VERTICES_PER_QUAD, 5123, 0);
    count = 0;
  }
};

export let gl_flush = (): void =>
{
  if (count === 0) return;
  ctx.bufferSubData(34962, 0, vPositionData.subarray(0, count * VERTEX_SIZE));
  ctx.drawElements(4, count * VERTICES_PER_QUAD, 5123, 0);
  count = 0;
};