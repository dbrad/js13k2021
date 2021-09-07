import { math } from "./math";

let randomInRange = (random: number, min: number, max: number) =>
{
  return math.floor(random * (max - min + 1)) + min;
};

export let rand = (min: number, max: number): number =>
{
  return randomInRange(math.random(), min, max);
};

export let generateSRand = (seed: number): [() => number, (min: number, max: number) => number] =>
{
  let next = (): number =>
  {
    seed = (3967 * seed + 11) % 16127;
    return seed / 16127;
  };
  return [next,
    (min: number, max: number): number =>
    {
      return randomInRange(next(), min, max);
    }];
};

export let shuffle = <T>(array: T[]): T[] =>
{
  let currentIndex: number = array.length, temporaryValue: T, randomIndex: number;
  let arr: T[] = [...array];
  while (0 !== currentIndex)
  {
    randomIndex = rand(0, currentIndex - 1);
    currentIndex -= 1;
    temporaryValue = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temporaryValue;
  }
  return arr;
};