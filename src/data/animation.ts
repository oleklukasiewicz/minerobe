export class RenderAnimation {
  prepare: Function;
  render: Function;
  constructor(prepare: Function, render: Function) {
    this.prepare = prepare;
    this.render = render;
  }
}

export const DefaultAnimation = new RenderAnimation(
  function (scene, keepData = false) {
    let data = {
      angle: 0,
      speed: 1,
      leftarm: scene.getObjectByName("LeftArm"),
      rightarm: scene.getObjectByName("RightArm"),
      rightleg: scene.getObjectByName("RightLeg"),
      leftleg: scene.getObjectByName("LeftLeg"),
      head: scene.getObjectByName("Head"),
      body: scene.getObjectByName("Body"),
      nextRotationTime: Math.random() * 5,
      headRotation: ((Math.random() * 120 - 60) * Math.PI) / 180,
      currentRotation: 0,
      rotationSpeed: Math.random() * 0.02 + 0.01,
      bodyRotationDelay: 0,
      bodyRotationTarget: 0,
    };
    data.head.rotation.x = -0.001;
    data.leftarm.rotation.x = -0.001;
    data.rightarm.rotation.x = -0.001;

    const armDistanceX = 0.3; // Adjust this value to change the distance of the arms from the body in the x direction
    const armDistanceZ = 0.0; // Adjust this value to change the distance of the arms from the body in the z direction

    if (data.leftarm && data.rightarm) {
      data.leftarm.parent.remove(data.leftarm);
      data.rightarm.parent.remove(data.rightarm);

      // Add the arms to the body, making the body their parent
      data.body.add(data.leftarm);
      data.body.add(data.rightarm);

      // Set the position of the arms relative to the body
      data.leftarm.position.set(-armDistanceX, -0.12, -armDistanceZ);
      data.rightarm.position.set(armDistanceX, -0.12, armDistanceZ);
    }

    if (keepData) {
      return {
        leftarm: scene.getObjectByName("LeftArm"),
        rightarm: scene.getObjectByName("RightArm"),
        head: scene.getObjectByName("Head"),
        body: scene.getObjectByName("Body"),
        rightleg: scene.getObjectByName("RightLeg"),
        leftleg: scene.getObjectByName("LeftLeg"),
      };
    }
    return data;
  },
  function (data, scene, clock) {
    const elapsedTime = clock.getDelta();
    const amplitude = 0.025;
    //console.log(data);
    if (data.leftarm) {
      data.angle += data.speed * elapsedTime;
      data.leftarm.rotation.z =
        (Math.sin(data.angle) * 0.5 + 0.5) * ((-5 * Math.PI) / 180);
      data.rightarm.rotation.z =
        (Math.sin(data.angle) * 0.5 + 0.5) * ((5 * Math.PI) / 180);
    }
    if (data.head) {
      if (clock.elapsedTime > data.nextRotationTime) {
        // Time for a new rotation
        data.headRotation = ((Math.random() * 120 - 60) * Math.PI) / 180; // New random rotation
        data.nextRotationTime = clock.elapsedTime + Math.random() * 5; // New random time for the next rotation
        data.rotationSpeed = Math.random() * 0.02 + 0.01; // New random speed for the head rotation
      }
      // Interpolate between the current rotation and the target rotation using an easing function
      data.currentRotation +=
        (data.headRotation - data.currentRotation) * data.rotationSpeed;
      data.head.rotation.y = data.currentRotation;
    }

    data.bodyRotationDelay = (data.bodyRotationDelay || 0) + elapsedTime;
    if (data.bodyRotationDelay > 0.07) {
      // Adjust 1 to change the delay duration
      data.bodyRotationTarget = data.currentRotation / 3; // Set a new target rotation for the body
      data.bodyRotationDelay = 0; // Reset the delay
    }

    // Interpolate between the current body rotation and the target rotation using an easing function
    data.body.rotation.y +=
      (data.bodyRotationTarget - data.body.rotation.y) * 0.02; // Adjust 0.01 to change the speed of the interpolation

    if (data.body) {
      const cSin = data.speed * Math.sin(clock.elapsedTime);
      data.body.position.y = 1.47 + amplitude * cSin;

      data.head.position.y = 1.47 + amplitude * cSin;
      data.head.rotation.x = -0.001 + 0.07 * cSin;
      data.rightleg.rotation.x = -0.2 + 0.06 * cSin;
      data.rightleg.position.z = 0 + 0.06 * cSin;
      data.leftleg.rotation.x = 0.05 + 0.04 * cSin;
      data.leftleg.position.z = 0 + 0.04 * cSin;
    }
  }
);
