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
function lerp(start, end, factor) {
  return (1 - factor) * start + factor * end;
}
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export const DefaultAnimation = new RenderAnimation(
  function (scene, keepData = false, modelName) {
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
      headRotation: 0,
      currentRotation: 0,
      rotationSpeed: 0,
      bodyRotationDelay: 0,
      bodyRotationTarget: 0,
    };

    const armDistanceX = 0.3; // Adjust this value to change the distance of the arms from the body in the x direction
    const armDistanceZ = 0.0; // Adjust this value to change the distance of the arms from the body in the z direction

    if (data.leftarm && data.rightarm) {
      data.leftarm.parent.remove(data.leftarm);
      data.rightarm.parent.remove(data.rightarm);

      data.body.add(data.leftarm);
      data.body.add(data.rightarm);

      // Set the position of the arms relative to the body
      if (modelName === "steve") {
        data.leftarm.position.set(-armDistanceX, -0.12, -armDistanceZ);
        data.rightarm.position.set(armDistanceX, -0.12, armDistanceZ);
      } else {
        data.leftarm.position.set(-armDistanceX, -0.15, -armDistanceZ);
        data.rightarm.position.set(armDistanceX, -0.15, armDistanceZ);
      }
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
  function (data, scene, clock, modelName) {
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
        data.rotationSpeed = Math.random() * 0.01 + 0.005; // New random speed for the head rotation
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
      data.rightleg.position.z = -0.02 + 0.04 * cSin;
      const delay = 0.5; // Adjust this value to change the delay

      data.leftleg.rotation.x =
        0.05 + 0.03 * Math.sin(clock.elapsedTime + delay);
      data.leftleg.position.z = 0 + 0.03 * Math.sin(clock.elapsedTime + delay);
    }
  },
  function (data, scene, clock, modelName) {
    const resetSpeed = 0.05; // Adjust this value to change the speed of the reset
    if (data.body) {
      // Interpolate between the current values and the target values
      data.body.rotation.y = lerp(
        data.body.rotation.y,
        0,
        easeOutCubic(resetSpeed)
      );
      data.body.position.y = lerp(
        data.body.position.y,
        1.47,
        easeOutCubic(resetSpeed)
      );

      data.head.position.y = lerp(
        data.head.position.y,
        1.47,
        easeOutCubic(resetSpeed)
      );
      data.head.rotation.x = lerp(
        data.head.rotation.x,
        0,
        easeOutCubic(resetSpeed)
      );
      data.head.rotation.y = lerp(
        data.head.rotation.y,
        0,
        easeOutCubic(resetSpeed)
      );

      data.rightleg.rotation.x = lerp(
        data.rightleg.rotation.x,
        -0.2,
        easeOutCubic(resetSpeed)
      );
      data.rightleg.position.z = lerp(
        data.rightleg.position.z,
        0,
        easeOutCubic(resetSpeed)
      );

      data.leftleg.rotation.x = lerp(
        data.leftleg.rotation.x,
        0.04,
        easeOutCubic(resetSpeed)
      );
      data.leftleg.position.z = lerp(
        data.leftleg.position.z,
        0,
        easeOutCubic(resetSpeed)
      );

      // Add the arms
      data.rightarm.rotation.z = lerp(
        data.rightarm.rotation.z,
        0.05,
        easeOutCubic(resetSpeed)
      );
      data.rightarm.position.z = lerp(
        data.rightarm.position.z,
        0,
        easeOutCubic(resetSpeed)
      );

      data.leftarm.rotation.z = lerp(
        data.leftarm.rotation.z,
        -0.05,
        easeOutCubic(resetSpeed)
      );
      data.leftarm.position.z = lerp(
        data.leftarm.position.z,
        0,
        easeOutCubic(resetSpeed)
      );
      const isFinished =
        Math.abs(data.body.rotation.y) < 0.01 &&
        Math.abs(data.body.position.y - 1.47) < 0.01 &&
        Math.abs(data.head.position.y - 1.47) < 0.01 &&
        Math.abs(data.head.rotation.x) < 0.01 &&
        Math.abs(data.rightleg.rotation.x+0.2) < 0.01 &&
        Math.abs(data.rightleg.position.z) < 0.01 &&
        Math.abs(data.leftleg.rotation.x-0.04) < 0.01 &&
        Math.abs(data.leftleg.position.z) < 0.01 &&
        // Check the arms
        Math.abs(data.rightarm.rotation.z-0.05) < 0.01 &&
        Math.abs(data.rightarm.position.z) < 0.01 &&
        Math.abs(data.leftarm.rotation.z+0.05) < 0.01 &&
        Math.abs(data.leftarm.position.z) < 0.01;
      return isFinished;
    } else {
      return true;
    }
  }
);

export const NewOutfitBottom = new RenderAnimation(
  function (scene, keepData = false, modelName) {},
  function (data, scene, clock, modelName) {},
  function () {}
);
