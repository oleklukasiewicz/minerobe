export class RenderAnimation {
  prepare: Function;
  render: Function;
  constructor(prepare: Function, render: Function) {
    this.prepare = prepare;
    this.render = render;
  }
}

export const TweenAnimation = new RenderAnimation(
  function (scene, keepData = false) {
    let data = {
      angle: 0,
      speed: 2,
      arm: scene.getObjectByName("LeftArm"),
      rightarm: scene.getObjectByName("RightArm"),
      head: scene.getObjectByName("Head"),
      nextRotationTime: Math.random() * 5,
      headRotation: ((Math.random() * 160 - 80) * Math.PI) / 180,
      currentRotation: 0,
      rotationSpeed: Math.random() * 0.02 + 0.01,
    };
    data.head.rotation.x = -0.001;
    data.arm.rotation.x = -0.001;
    data.rightarm.rotation.x = -0.001;
    if (keepData) {
      return {
        arm: scene.getObjectByName("LeftArm"),
        rightarm: scene.getObjectByName("RightArm"),
        head: scene.getObjectByName("Head"),
      };
    }
    return data;
  },
  function (data, scene, clock) {
    const elapsedTime = clock.getDelta();
    //console.log(data);
    if (data.arm) {
      data.angle += data.speed * elapsedTime;
      data.arm.rotation.z =
        (Math.sin(data.angle) * 0.5 + 0.5) * ((-5 * Math.PI) / 180);
      data.rightarm.rotation.z =
        (Math.sin(data.angle) * 0.5 + 0.5) * ((5 * Math.PI) / 180);
    }
    if (data.head) {
      if (clock.elapsedTime > data.nextRotationTime) {
        // Time for a new rotation
        data.headRotation = ((Math.random() * 160 - 80) * Math.PI) / 180; // New random rotation
        data.nextRotationTime = clock.elapsedTime + Math.random() * 5; // New random time for the next rotation
        data.rotationSpeed = Math.random() * 0.02 + 0.01; // New random speed for the head rotation
      }
      // Interpolate between the current rotation and the target rotation using an easing function
      data.currentRotation +=
        (data.headRotation - data.currentRotation) * data.rotationSpeed;
      data.head.rotation.y = data.currentRotation;
    }
  }
);
