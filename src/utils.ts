export function roundDownToInterval(value: number, interval: number): number {
  return Math.floor(value / interval) * interval;
}
