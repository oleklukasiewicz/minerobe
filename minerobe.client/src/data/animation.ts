export class RenderAnimation {
  prepare: Function;
  render: Function;
  stop: Function;
  constructor(prepare: Function, render: Function, stop: Function) {
    this.prepare = prepare;
    this.render = render;
    this.stop = stop;
  }
}
export function lerp(start, end, factor) {
  return (1 - factor) * start + factor * end;
}
export function easeOutCubic(t) {
  return (1 - Math.pow(1 - t, 3));
}
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export function lerpOutCubic(clock, prop, target, speed) {
  // Clamp interpolation to avoid overshoot/jitter on unstable frame deltas.
  const normalizedClock = Math.max(0, clock);
  const interpolationFactor = clamp01(speed * (normalizedClock * 130));
  return lerp(prop, target, easeOutCubic(interpolationFactor));
}
export function isPoseReady(poses, epsilon = 0.003) {
  let isPoseReady = true;
  poses.forEach((pose) => {
    if (pose.value + pose.target * -1 > epsilon) {
      isPoseReady = false;
    }
  });
  return isPoseReady;
}
export function isNextStepReady(poses, epsilon = 0.003) {
  let isPoseReady = true;
  poses.forEach((pose) => {
    if (Math.abs( pose.value - pose.target) > epsilon) {
      isPoseReady = false;
    }
  });
  return isPoseReady;
}