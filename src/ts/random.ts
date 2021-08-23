export let rand = (min: number, max: number): number =>
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
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