export function roundDownToInterval(value: number, interval: number) {
  return Math.floor(value / interval) * interval;
}
