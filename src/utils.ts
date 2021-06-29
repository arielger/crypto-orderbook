export function roundToNearest(value: number, interval: number) {
  return Math.floor(value / interval) * interval;
}
