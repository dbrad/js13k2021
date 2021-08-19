export type v2 = [number, number];

export let addV2 = (a: v2, b: v2): v2 =>
{
  a = [...a];
  a[0] += b[0];
  a[1] += b[1];
  return a;
};
export let subV2 = (a: v2, b: v2): v2 =>
{
  a = [...a];
  a[0] -= b[0];
  a[1] -= b[1];
  return a;
};