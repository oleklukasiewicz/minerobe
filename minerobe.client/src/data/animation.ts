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
export function lerpOutCubic(clock,prop, target, speed) {
  return lerp(prop, target, easeOutCubic(speed*(clock*130)));
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