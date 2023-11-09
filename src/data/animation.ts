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
function lerpOutCubic(prop, target, speed) {
  return lerp(prop, target, easeOutCubic(speed));
}
function isPoseReady(poses, epsilon = 0.001) {
  let isPoseReady = true;
  poses.forEach((pose) => {
    if (pose.value + pose.target * -1 > epsilon) {
      isPoseReady = false;
    }
  });
  return isPoseReady;
}
export const DefaultAnimation = new RenderAnimation(
  function (scene, keepData = false, modelName) {
    let data: any = {
      leftarm: scene.getObjectByName("LeftArm"),
      rightarm: scene.getObjectByName("RightArm"),
      rightleg: scene.getObjectByName("RightLeg"),
      leftleg: scene.getObjectByName("LeftLeg"),
      head: scene.getObjectByName("Head"),
      body: scene.getObjectByName("Body"),
    };

    if (data.leftarm && data.rightarm) {
      data.head.parent.remove(data.head);

      data.body.add(data.head);
      data.head.position.set(0, 0, 0);

      const armDistanceX = 0.31;
      const armDistanceZ = 0.0;

      data.leftarm.parent.remove(data.leftarm);
      data.rightarm.parent.remove(data.rightarm);

      data.body.add(data.leftarm);
      data.body.add(data.rightarm);

      if (modelName === "steve") {
        data.leftarm.position.set(-armDistanceX, -0.12, -armDistanceZ);
        data.rightarm.position.set(armDistanceX, -0.12, armDistanceZ);
      } else {
        data.leftarm.position.set(-armDistanceX, -0.15, -armDistanceZ);
        data.rightarm.position.set(armDistanceX, -0.15, armDistanceZ);
      }
    }

    if (!keepData) {
      data.nextRotationTime = Math.random() * 5;
      data.headRotation = 0;
      data.currentRotation = 0;
      data.rotationSpeed = 0;
      data.bodyRotationDelay = 0;
      data.bodyRotationTarget = 0;
      data.angle = 0;
      data.speed = 1;
      data.armAngle = (5 * Math.PI) / 180;
    }
    return data;
  },
  function (data, scene, clock, modelName) {
    const elapsedTime = clock.getDelta();
    const amplitude = 0.025;
    if (data.leftarm) {
      data.angle += data.speed * elapsedTime;
      data.leftarm.rotation.z = lerpOutCubic(
        data.leftarm.rotation.z,
        (Math.sin(data.angle) * 0.5 + 0.5) * -1 * data.armAngle,
        0.02
      );
      data.rightarm.rotation.z = lerpOutCubic(
        data.rightarm.rotation.z,
        (Math.sin(data.angle) * 0.5 + 0.5) * data.armAngle,
        0.02
      );
    }
    if (data.head) {
      if (clock.elapsedTime > data.nextRotationTime) {
        // Time for a new rotation
        data.headRotation = ((Math.random() * 120 - 60) * Math.PI) / 180; // New random rotation
        data.nextRotationTime = clock.elapsedTime + Math.random() * 5; // New random time for the next rotation
        data.rotationSpeed = Math.random() * 0.03 + 0.02; // New random speed for the head rotation
      }
      // Interpolate between the current rotation and the target rotation using an easing function
      data.currentRotation +=
        (data.headRotation - data.currentRotation) * data.rotationSpeed;
      data.head.rotation.y = data.currentRotation;

      data.bodyRotationDelay = (data.bodyRotationDelay || 0) + elapsedTime;
      if (data.bodyRotationDelay > 0.07) {
        // Adjust 1 to change the delay duration
        data.bodyRotationTarget = data.currentRotation / 3; // Set a new target rotation for the body
        data.bodyRotationDelay = 0; // Reset the delay
      }

      // Interpolate between the current body rotation and the target rotation using an easing function
      data.body.rotation.y = lerpOutCubic(
        data.body.rotation.y,
        data.bodyRotationTarget - data.body.rotation.y,
        0.02
      );

      const cSin = Math.sin(clock.elapsedTime);
      data.body.position.y = lerpOutCubic(
        data.body.position.y,
        1.47 + amplitude * Math.sin(clock.elapsedTime),
        0.02
      );

      data.head.rotation.x = lerpOutCubic(
        data.head.rotation.x,
        0.07 * cSin,
        0.02
      );
      data.rightleg.rotation.x = lerpOutCubic(
        data.rightleg.rotation.x,
        -0.2 + 0.06 * cSin,
        0.02
      );
      data.rightleg.position.z = lerpOutCubic(
        data.rightleg.position.z,
        -0.02 + 0.04 * cSin,
        0.02
      );
      const delay = 0.5; // Adjust this value to change the delay

      data.leftleg.rotation.x = lerpOutCubic(
        data.leftleg.rotation.x,
        (data.leftleg.position.z =
          0 + 0.03 * Math.sin(clock.elapsedTime + delay)),
        0.02
      );
    }
  },
  function () {
    return true;
  }
);

export const NewOutfitBottomAnimation = new RenderAnimation(
  function (scene, keepData = false, modelName) {
    let data: any = {
      head: scene.getObjectByName("Head"),
      body: scene.getObjectByName("Body"),
      leftarm: scene.getObjectByName("LeftArm"),
      rightarm: scene.getObjectByName("RightArm"),
      leftleg: scene.getObjectByName("LeftLeg"),
      rightleg: scene.getObjectByName("RightLeg"),
    };
    data.head.parent.remove(data.head);

    data.body.add(data.head);
    data.head.position.set(0, 0, 0);

    data.leftarm.parent.remove(data.leftarm);
    data.rightarm.parent.remove(data.rightarm);

    data.body.add(data.leftarm);
    data.body.add(data.rightarm);

    const armDistanceX = 0.31; // Adjust this value to change the distance of the arms from the body in the x direction
    const armDistanceZ = 0.0; // Adjust this value to change the distance of
    // Set the position of the arms relative to the body
    if (modelName === "steve") {
      data.leftarm.position.set(-armDistanceX, -0.12, -armDistanceZ);
      data.rightarm.position.set(armDistanceX, -0.12, armDistanceZ);
    } else {
      data.leftarm.position.set(-armDistanceX, -0.15, -armDistanceZ);
      data.rightarm.position.set(armDistanceX, -0.15, armDistanceZ);
    }

    if (keepData) {
      return data;
    } else {
      data.isRotatingDown = true;
      data.downRotation = -30 * (Math.PI / 180);
      data.bodyDownRotation = 10 * (Math.PI / 180);
      data.isLookingLeft = false;
      data.isLookingRight = false;
      data.leftRotation = 30 * (Math.PI / 180);
      data.rightRotation = -30 * (Math.PI / 180);
      data.armRot = (Math.random() * 10 + 5) * (Math.PI / 180);
      data.speed = 1;
      data.angle = 0;
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName) {
    const resetSpeed = 0.02; // Adjust this value to change the speed of the reset
    const epsilon = 0.01; // Adjust this value to change the precision of the equality check
    const amplitude = 0.025;
    const elapsedTime = clock.getDelta();

    const cSin = 1 * Math.sin(clock.elapsedTime);
    if (data.head) {
      if (data.isRotatingDown || data.isLookingLeft || data.isLookingRight) {
        data.body.position.y = 1.47 + amplitude * cSin;
      }
      if (data.isRotatingDown) {
        data.isLookingLeft = true;
        // Interpolate between the current rotation and the down rotation
        data.leftleg.rotation.x = lerpOutCubic(
          data.leftleg.rotation.x,
          0.01,
          resetSpeed
        );
        data.head.rotation.x = lerpOutCubic(
          data.head.rotation.x,
          data.downRotation,
          resetSpeed
        );
        data.body.rotation.x = lerpOutCubic(
          data.body.rotation.x,
          data.bodyDownRotation,
          resetSpeed
        );
        data.body.position.z = lerpOutCubic(
          data.body.position.z,
          data.bodyDownRotation,
          resetSpeed
        );

        data.leftarm.rotation.z = lerpOutCubic(
          data.leftarm.rotation.z,
          data.armRot * -1,
          resetSpeed
        );

        data.rightarm.rotation.z = lerpOutCubic(
          data.rightarm.rotation.z,
          data.armRot,
          resetSpeed
        );

        // If the head is close enough to the down rotation, set the rotation to the down rotation
        if (Math.abs(data.head.rotation.x - data.downRotation) < epsilon) {
          data.head.rotation.x = data.downRotation;
          data.isRotatingDown = false;
        }
      }
      if (data.isLookingLeft) {
        // Interpolate between the current rotation and the left rotation
        data.head.rotation.y = lerpOutCubic(
          data.head.rotation.y,
          data.leftRotation,
          resetSpeed
        );

        // If the head is close enough to the left rotation, set the rotation to the left rotation
        if (Math.abs(data.head.rotation.y - data.leftRotation) < epsilon) {
          data.head.rotation.y = data.leftRotation;
          data.isLookingLeft = false;
          data.isLookingRight = true;
        }
      } else if (data.isLookingRight) {
        // Interpolate between the current rotation and the right rotation
        data.head.rotation.y = lerpOutCubic(
          data.head.rotation.y,
          data.rightRotation,
          resetSpeed
        );

        // If the head is close enough to the right rotation, set the rotation to the right rotation
        if (Math.abs(data.head.rotation.y - data.rightRotation) < epsilon) {
          data.head.rotation.y = data.rightRotation;
          data.isLookingRight = false;
        }
      } else {
        // Interpolate between the current rotation and 0
        data.head.rotation.x = lerpOutCubic(
          data.head.rotation.x,
          0,
          resetSpeed
        );
        data.body.rotation.x = lerpOutCubic(
          data.body.rotation.x,
          0,
          resetSpeed
        );
        data.body.position.z = lerpOutCubic(
          data.body.position.z,
          0,
          resetSpeed
        );
        data.head.rotation.z = lerpOutCubic(
          data.head.rotation.z,
          0,
          resetSpeed
        );

        data.head.rotation.y = lerpOutCubic(
          data.head.rotation.y,
          0,
          resetSpeed
        );

        data.leftarm.rotation.z = lerpOutCubic(
          data.leftarm.rotation.z,
          -0.05,
          resetSpeed
        );

        data.rightarm.rotation.z = lerpOutCubic(
          data.rightarm.rotation.z,
          0.05,
          resetSpeed
        );

        data.body.position.y = lerpOutCubic(
          data.body.position.y,
          1.47,
          resetSpeed
        );
        // If the head is close enough to 0, set the rotation to 0
        if (
          isPoseReady([
            { value: data.head.rotation.x, target: 0 },
            { value: data.body.rotation.x, target: 0 },
            { value: data.body.position.z, target: 0 },
            { value: data.head.rotation.y, target: 0 },
            { value: data.head.rotation.z, target: 0 },
            { value: data.leftarm.rotation.z, target: -0.05 },
            { value: data.rightarm.rotation.z, target: 0.05 },
          ])
        ) {
          data.head.rotation.x = 0;
          data.body.rotation.x = 0;
          data.body.position.z = 0;
          data.head.rotation.y = 0;
          data.leftarm.rotation.z = 0;
          data.rightarm.rotation.z = 0;
          data.isRotatingDown = true;

          return true;
        }
        return false;
      }
    }
  }
);
export const NewOutfitShoesAnimation = new RenderAnimation(
  function (scene, keepData = false, modelName) {
    let data: any = {
      head: scene.getObjectByName("Head"),
      body: scene.getObjectByName("Body"),
      leftarm: scene.getObjectByName("LeftArm"),
      rightarm: scene.getObjectByName("RightArm"),
      leftleg: scene.getObjectByName("LeftLeg"),
      rightleg: scene.getObjectByName("RightLeg"),
    };
    data.head.parent.remove(data.head);

    data.body.add(data.head);
    data.head.position.set(0, 0, 0);

    data.leftarm.parent.remove(data.leftarm);
    data.rightarm.parent.remove(data.rightarm);

    data.body.add(data.leftarm);
    data.body.add(data.rightarm);

    const armDistanceX = 0.31; // Adjust this value to change the distance of the arms from the body in the x direction
    const armDistanceZ = 0.0; // Adjust this value to change the distance of
    // Set the position of the arms relative to the body
    if (modelName === "steve") {
      data.leftarm.position.set(-armDistanceX, -0.12, -armDistanceZ);
      data.rightarm.position.set(armDistanceX, -0.12, armDistanceZ);
    } else {
      data.leftarm.position.set(-armDistanceX, -0.15, -armDistanceZ);
      data.rightarm.position.set(armDistanceX, -0.15, armDistanceZ);
    }

    if (keepData) {
      return data;
    } else {
      data.isRotatingDown = true;
      data.downRotation = -30 * (Math.PI / 180);
      data.bodyDownRotation = 10 * (Math.PI / 180);
      data.isLookingLeft = false;
      data.isLookingRight = false;
      data.leftRotation = 30 * (Math.PI / 180);
      data.rightRotation = -30 * (Math.PI / 180);
      data.armRot = (Math.random() * 10 + 5) * (Math.PI / 180);
      data.legRot = (Math.random() * 10 + 5) * (Math.PI / 180);
      data.speed = 4;
      data.angle = 0;
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName) {
    const resetSpeed = 0.01; // Adjust this value to change the speed of the reset
    const epsilon = 0.01; // Adjust this value to change the precision of the equality check
    const amplitude = 0.025;
    const elapsedTime = clock.getDelta();

    const cSin = 1 * Math.sin(clock.elapsedTime);

    if (data.head) {
      data.body.position.y = 1.47 + amplitude * cSin;
      data.rightleg.rotation.x = -0.2 + 0.06 * cSin;
      data.rightleg.position.z = -0.02 + 0.04 * cSin;
      const delay = 0.5; // Adjust this value to change the delay

      data.leftleg.rotation.x =
        0.05 + 0.03 * Math.sin(clock.elapsedTime + delay);
      data.leftleg.position.z = 0 + 0.03 * Math.sin(clock.elapsedTime + delay);

      if (data.isRotatingDown) {
        data.isLookingLeft = true;
        // Interpolate between the current rotation and the down rotation
        data.head.rotation.x = lerpOutCubic(
          data.head.rotation.x,
          data.downRotation,
          resetSpeed
        );
        // data.body.rotation.x = lerpOutCubic(
        //   data.body.rotation.x,
        //   data.bodyDownRotation,
        //  resetSpeed
        // );
        // data.body.position.z = lerpOutCubic(
        //   data.body.position.z,
        //   data.bodyDownRotation,
        //  resetSpeed
        // );

        data.leftarm.rotation.z = lerpOutCubic(
          data.leftarm.rotation.z,
          data.armRot * -1,
          resetSpeed
        );

        data.rightarm.rotation.z = lerpOutCubic(
          data.rightarm.rotation.z,
          data.armRot,
          resetSpeed
        );

        // If the head is close enough to the down rotation, set the rotation to the down rotation
        if (Math.abs(data.head.rotation.x - data.downRotation) < epsilon) {
          data.head.rotation.x = data.downRotation;
          data.isRotatingDown = false;
        }
      }
      if (data.isLookingLeft) {
        // Interpolate between the current rotation and the left rotation
        data.head.rotation.y = lerpOutCubic(
          data.head.rotation.y,
          data.leftRotation,
          resetSpeed
        );
        data.rightleg.rotation.x = lerpOutCubic(
          data.rightleg.rotation.x,
          0,
          resetSpeed
        );

        data.leftleg.rotation.x = lerpOutCubic(
          data.leftleg.rotation.x,
          data.legRot,
          resetSpeed
        );

        // If the head is close enough to the left rotation, set the rotation to the left rotation
        if (Math.abs(data.head.rotation.y - data.leftRotation) < epsilon) {
          data.head.rotation.y = data.leftRotation;
          data.isLookingLeft = false;
          data.isLookingRight = true;
        }
      } else if (data.isLookingRight) {
        // Interpolate between the current rotation and the right rotation
        data.head.rotation.y = lerpOutCubic(
          data.head.rotation.y,
          data.rightRotation,
          resetSpeed
        );

        data.rightleg.rotation.x = lerpOutCubic(
          data.rightleg.rotation.x,
          data.legRot,
          resetSpeed
        );

        data.leftleg.rotation.x = lerpOutCubic(
          data.leftleg.rotation.x,
          0,
          resetSpeed
        );

        // If the head is close enough to the right rotation, set the rotation to the right rotation
        if (Math.abs(data.head.rotation.y - data.rightRotation) < epsilon) {
          data.head.rotation.y = data.rightRotation;
          data.isLookingRight = false;
        }
      } else {
        // Interpolate between the current rotation and 0
        data.head.rotation.x = lerpOutCubic(
          data.head.rotation.x,
          0,
          resetSpeed
        );
        // data.body.rotation.x = lerpOutCubic(
        //   data.body.rotation.x,
        //   0,
        //  resetSpeed
        // );
        // data.body.position.z = lerpOutCubic(
        //   data.body.position.z,
        //   0,
        //  resetSpeed
        // );
        data.head.rotation.y = lerpOutCubic(
          data.head.rotation.y,
          0,
          resetSpeed
        );

        data.leftarm.rotation.z = lerpOutCubic(
          data.leftarm.rotation.z,
          -0.05,
          resetSpeed
        );

        data.rightarm.rotation.z = lerpOutCubic(
          data.rightarm.rotation.z,
          0.05,
          resetSpeed
        );

        data.rightleg.rotation.x = lerpOutCubic(
          data.rightleg.rotation.x,
          0,
          resetSpeed
        );

        // If the head is close enough to 0, set the rotation to 0
        if (
          Math.abs(data.head.rotation.x) < epsilon &&
          Math.abs(data.head.rotation.y) < epsilon &&
          // Math.abs(data.body.rotation.x) < epsilon &&
          // Math.abs(data.body.position.z) < epsilon &&
          Math.abs(data.rightarm.rotation.z - 0.05) < epsilon &&
          Math.abs(data.leftarm.rotation.z + 0.05) < epsilon
        ) {
          data.head.rotation.x = 0;
          // data.body.rotation.x = 0;
          // data.body.position.z = 0;
          data.head.rotation.y = 0;
          data.leftarm.rotation.z = 0;
          data.rightarm.rotation.z = 0;
          data.isRotatingDown = true;
          return true;
        }
        return false;
      }
    }
  }
);

export const NewOutfitClapAnimation = new RenderAnimation(
  function (scene, keepData = false, modelName) {
    let data: any = {
      head: scene.getObjectByName("Head"),
      body: scene.getObjectByName("Body"),
      leftarm: scene.getObjectByName("LeftArm"),
      rightarm: scene.getObjectByName("RightArm"),
      leftleg: scene.getObjectByName("LeftLeg"),
      rightleg: scene.getObjectByName("RightLeg"),
    };
    data.head.parent.remove(data.head);

    data.body.add(data.head);
    data.head.position.set(0, 0, 0);

    data.leftarm.parent.remove(data.leftarm);
    data.rightarm.parent.remove(data.rightarm);

    data.body.add(data.leftarm);
    data.body.add(data.rightarm);

    const armDistanceX = 0.31; // Adjust this value to change the distance of the arms from the body in the x direction
    const armDistanceZ = 0.0; // Adjust this value to change the distance of
    // Set the position of the arms relative to the body
    if (modelName === "steve") {
      data.leftarm.position.set(-armDistanceX, -0.12, -armDistanceZ);
      data.rightarm.position.set(armDistanceX, -0.12, armDistanceZ);
    } else {
      data.leftarm.position.set(-armDistanceX, -0.15, -armDistanceZ);
      data.rightarm.position.set(armDistanceX, -0.15, armDistanceZ);
    }

    if (keepData) {
      return data;
    } else {
      data.clapsCount = 0;
      data.clapIncoming = false;
      data.speed = 1;
      data.isInitialRotationSet = false;
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName) {
    const elapsedTime = clock.getDelta();
    const clapSpeed = 0.08; // Adjust this value to change the speed of the clap
    const positionSpeed = 0.015; // Adjust this value to change the speed of the position reset
    const epsilon = 0.01; // Adjust this value to change the precision of the equality check
    const clapRotation = 25 * (Math.PI / 180); // 45 degrees in radians
    const clapRotationEnd = 15 * (Math.PI / 180); // 45 degrees in radians
    const initialRotation = 100 * (Math.PI / 180); // 90 degrees in radians
    const amplitude = 0.025;

    const cSin = data.speed * Math.sin(clock.elapsedTime);

    if (data.leftarm && data.rightarm) {
      data.head.rotation.x = -0.001 + 0.07 * cSin;
      data.body.position.y = 1.47 + amplitude * cSin;
      data.rightleg.rotation.x = -0.2 + 0.06 * cSin;
      data.rightleg.position.z = -0.02 + 0.04 * cSin;
      const delay = 0.5; // Adjust this value to change the delay

      data.leftleg.rotation.x =
        0.05 + 0.03 * Math.sin(clock.elapsedTime + delay);
      data.leftleg.position.z = 0 + 0.03 * Math.sin(clock.elapsedTime + delay);

      if (!data.isInitialRotationSet == true) {
        // Interpolate between the current rotation and the initial rotation
        data.leftarm.rotation.x = lerpOutCubic(
          data.leftarm.rotation.x,
          initialRotation,
          positionSpeed
        );
        data.leftarm.rotation.z = lerpOutCubic(
          data.leftarm.rotation.z,
          clapRotation,
          clapSpeed
        );
        data.rightarm.rotation.x = lerpOutCubic(
          data.rightarm.rotation.x,
          initialRotation,
          positionSpeed
        );
        data.rightarm.rotation.z = lerpOutCubic(
          data.rightarm.rotation.z,
          -clapRotation,
          clapSpeed
        );
        data.head.rotation.z = lerpOutCubic(data.head.rotation.z, 0.2, 0.02);

        if (
          isPoseReady(
            [
              { value: data.leftarm.rotation.x, target: initialRotation },
              { value: data.rightarm.rotation.x, target: initialRotation },
              { value: data.leftarm.rotation.z, target: clapRotation },
              { value: data.rightarm.rotation.z, target: -clapRotation },
              { value: data.head.rotation.z, target: 0.2 },
            ],
            0.001
          )
        ) {
          data.isInitialRotationSet = true;
        }
      }
      if (data.isInitialRotationSet && data.clapsCount < 5) {
        if (data.clapIncoming) {
          data.leftarm.rotation.z = lerpOutCubic(
            data.leftarm.rotation.z,
            clapRotation,
            clapSpeed
          );
          data.rightarm.rotation.z = lerpOutCubic(
            data.rightarm.rotation.z,
            -clapRotation,
            clapSpeed
          );
          if (
            Math.abs(data.leftarm.rotation.z - clapRotation) < epsilon &&
            Math.abs(data.rightarm.rotation.z + clapRotation) < epsilon
          ) {
            data.clapIncoming = false;
          }
        } else {
          data.leftarm.rotation.z = lerpOutCubic(
            data.leftarm.rotation.z,
            clapRotationEnd,
            clapSpeed
          );
          data.rightarm.rotation.z = lerpOutCubic(
            data.rightarm.rotation.z,
            -clapRotationEnd,
            clapSpeed
          );
          if (
            isPoseReady([
              { value: data.leftarm.rotation.z, target: clapRotationEnd },
              { value: data.rightarm.rotation.z, target: -clapRotationEnd },
            ])
          ) {
            data.clapIncoming = true;
            data.clapsCount++;
          }
        }
      }
      if (data.clapsCount === 5) {
        data.leftarm.rotation.x = lerpOutCubic(
          data.leftarm.rotation.x,
          0,
          positionSpeed
        );
        data.rightarm.rotation.x = lerpOutCubic(
          data.rightarm.rotation.x,
          0,
          positionSpeed
        );
        data.leftarm.rotation.z = lerpOutCubic(
          data.leftarm.rotation.z,
          -0.05,
          clapSpeed
        );
        data.rightarm.rotation.z = lerpOutCubic(
          data.rightarm.rotation.z,
          0.05,
          clapSpeed
        );
        data.head.rotation.z = lerpOutCubic(data.head.rotation.z, 0, 0.01);
        if (
          isPoseReady([
            { value: data.leftarm.rotation.x, target: 0 },
            { value: data.rightarm.rotation.x, target: 0 },
            { value: data.leftarm.rotation.z, target: -0.05 },
            { value: data.rightarm.rotation.z, target: 0.05 },
          ])
        ) {
          data.clapsCount = 0;
          data.isInitialRotationSet = false;
          return true;
        }
      }
    }
    return false;
  }
);
export const FrendshipAnimation = new RenderAnimation(
  function (scene, keepData = false, modelName) {
    let data: any = {
      head: scene.getObjectByName("Head"),
      body: scene.getObjectByName("Body"),
      leftarm: scene.getObjectByName("LeftArm"),
      rightarm: scene.getObjectByName("RightArm"),
      leftleg: scene.getObjectByName("LeftLeg"),
      rightleg: scene.getObjectByName("RightLeg"),
    };
    data.head.parent.remove(data.head);

    data.body.add(data.head);
    data.head.position.set(0, 0, 0);

    data.leftarm.parent.remove(data.leftarm);
    data.rightarm.parent.remove(data.rightarm);

    data.body.add(data.leftarm);
    data.body.add(data.rightarm);

    const armDistanceX = 0.31; // Adjust this value to change the distance of the arms from the body in the x direction
    const armDistanceZ = 0.0; // Adjust this value to change the distance of
    // Set the position of the arms relative to the body
    if (modelName === "steve") {
      data.leftarm.position.set(-armDistanceX, -0.125, -armDistanceZ);
      data.rightarm.position.set(armDistanceX, -0.125, armDistanceZ);
    } else {
      data.leftarm.position.set(-armDistanceX, -0.15, -armDistanceZ);
      data.rightarm.position.set(armDistanceX, -0.15, armDistanceZ);
    }

    if (keepData) {
      return data;
    } else {
      data.isPreparingPose = true;
      data.isGoingDown = true;
      data.speed = 0.05;
      data.poseCount = 0;
      data.maxPoseCount = 3;
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName) {
    if (data.isPreparingPose) {
      data.leftarm.rotation.x = lerpOutCubic(data.leftarm.rotation.x, 0, 0.05);
      data.rightarm.rotation.x = lerpOutCubic(data.rightarm.rotation.x, 0, 0.1);
      data.head.rotation.x = lerpOutCubic(data.head.rotation.x, 0, 0.1);
      data.head.rotation.y = lerpOutCubic(data.head.rotation.y, 0, 0.1);
      data.head.rotation.z = lerpOutCubic(data.head.rotation.z, 0, 0.1);
      data.body.rotation.x = lerpOutCubic(data.body.rotation.x, 0, 0.1);
      data.leftleg.rotation.x = lerpOutCubic(data.leftleg.rotation.x, 0, 0.1);
      data.leftleg.rotation.z = lerpOutCubic(data.leftleg.rotation.z, 0, 0.1);
      data.rightleg.rotation.x = lerpOutCubic(data.rightleg.rotation.x, 0, 0.1);
      data.rightleg.rotation.z = lerpOutCubic(data.rightleg.rotation.z, 0, 0.1);
      if (
        isPoseReady([
          { value: data.leftarm.rotation.x, target: 0 },
          { value: data.rightarm.rotation.x, target: 0 },
          { value: data.head.rotation.x, target: 0 },
          { value: data.head.rotation.y, target: 0 },
          { value: data.head.rotation.z, target: 0 },
          { value: data.body.rotation.x, target: 0 },
          { value: data.leftleg.rotation.x, target: 0 },
          { value: data.leftleg.rotation.z, target: 0 },
          { value: data.rightleg.rotation.x, target: 0 },
          { value: data.rightleg.rotation.z, target: 0 },
        ])
      ) {
        data.isPreparingPose = false;
      }
    } else {
      if (data.poseCount <= data.maxPoseCount) {
        if (data.isGoingDown) {
          data.body.rotation.x = lerpOutCubic(
            data.body.rotation.x,
            -0.6,
            data.speed
          );
          data.body.position.z = lerpOutCubic(
            data.body.position.z,
            -0.4,
            data.speed
          );
          data.body.position.y = lerpOutCubic(
            data.body.position.y,
            1.38,
            data.speed
          );
          data.head.rotation.x = lerpOutCubic(
            data.head.rotation.x,
            0.4,
            data.speed
          );
          if (
            isPoseReady([
              { value: data.body.rotation.x, target: -0.6 },
              { value: data.body.position.z, target: -0.4 },
              { value: data.body.position.y, target: 1.38 },
              { value: data.head.rotation.x, target: 0.4 },
            ])
          ) {
            data.isGoingDown = false;
          }
        } else {
          data.body.rotation.x = lerpOutCubic(
            data.body.rotation.x,
            0,
            data.speed
          );
          data.body.position.z = lerpOutCubic(
            data.body.position.z,
            0,
            data.speed
          );
          data.body.position.y = lerpOutCubic(
            data.body.position.y,
            1.47,
            data.speed
          );
          data.head.rotation.x = lerpOutCubic(
            data.head.rotation.x,
            0,
            data.speed
          );
          if (
            isPoseReady([
              { value: data.body.rotation.x, target: 0 },
              { value: data.body.position.z, target: 0 },
              { value: data.body.position.y, target: 1.47 },
              { value: data.head.rotation.x, target: 0 },
            ])
          ) {
            data.isGoingDown = true;
            data.poseCount++;
          }
        }
      } else {
        return true;
      }
    }
    return false;
  }
);
export const HandsUpAnimation = new RenderAnimation(
  function (scene, keepData = false, modelName) {
    let data: any = {
      head: scene.getObjectByName("Head"),
      body: scene.getObjectByName("Body"),
      leftarm: scene.getObjectByName("LeftArm"),
      rightarm: scene.getObjectByName("RightArm"),
      leftleg: scene.getObjectByName("LeftLeg"),
      rightleg: scene.getObjectByName("RightLeg"),
    };
    data.head.parent.remove(data.head);

    data.body.add(data.head);
    data.head.position.set(0, 0, 0);

    data.leftarm.parent.remove(data.leftarm);
    data.rightarm.parent.remove(data.rightarm);

    data.body.add(data.leftarm);
    data.body.add(data.rightarm);

    const armDistanceX = 0.31; // Adjust this value to change the distance of the arms from the body in the x direction
    const armDistanceZ = 0.0; // Adjust this value to change the distance of
    // Set the position of the arms relative to the body
    if (modelName === "steve") {
      data.leftarm.position.set(-armDistanceX, -0.125, -armDistanceZ);
      data.rightarm.position.set(armDistanceX, -0.125, armDistanceZ);
    } else {
      data.leftarm.position.set(-armDistanceX, -0.15, -armDistanceZ);
      data.rightarm.position.set(armDistanceX, -0.15, armDistanceZ);
    }

    if (keepData) {
      return data;
    } else {
      data.ishandGoUp = true;
      data.deg90 = 160 * (Math.PI / 180);
      data.speed = 0.02;
      data.speedDef = 1;
      data.firstFrameAfterPrepare = true;
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName) {
    const elapsedTime = clock.getDelta();
    if (data.firstFrameAfterPrepare) {
      data.firstFrameAfterPrepare = false;
      clock.start();
    }
    const amplitude = 0.025;
    const cSin = data.speedDef * Math.sin(clock.elapsedTime);

    data.body.position.y = 1.47 + amplitude * cSin;
    data.head.rotation.x = -0.001 + 0.07 * cSin;
    data.rightleg.rotation.x = -0.2 + 0.06 * cSin;
    data.rightleg.position.z = -0.02 + 0.04 * cSin;
    const delay = 0.5; // Adjust this value to change the delay

    data.leftleg.rotation.x = 0.05 + 0.03 * Math.sin(clock.elapsedTime + delay);
    data.leftleg.position.z = 0 + 0.03 * Math.sin(clock.elapsedTime + delay);

    if (data.ishandGoUp) {
      data.leftarm.rotation.x = lerpOutCubic(
        data.leftarm.rotation.x,
        data.deg90,
        data.speed
      );
      data.leftarm.rotation.z = lerpOutCubic(
        data.leftarm.rotation.z,
        -0.1,
        data.speed
      );
      data.rightarm.rotation.x = lerpOutCubic(
        data.rightarm.rotation.x,
        data.deg90,
        data.speed
      );
      data.rightarm.rotation.z = lerpOutCubic(
        data.rightarm.rotation.z,
        0.1,
        data.speed
      );
      if (
        isPoseReady([
          { value: data.leftarm.rotation.x, target: data.deg90 },
          { value: data.leftarm.rotation.z, target: -0.1 },
          { value: data.rightarm.rotation.x, target: data.deg90 },
          { value: data.rightarm.rotation.z, target: 0.1 },
        ])
      ) {
        setTimeout(() => {
          data.ishandGoUp = false;
        }, 2000);
      }
    } else {
      data.leftarm.rotation.x = lerpOutCubic(
        data.leftarm.rotation.x,
        0,
        data.speed
      );
      data.leftarm.rotation.z = lerpOutCubic(
        data.leftarm.rotation.z,
        0,
        data.speed
      );
      data.rightarm.rotation.x = lerpOutCubic(
        data.rightarm.rotation.x,
        0,
        data.speed
      );
      data.rightarm.rotation.z = lerpOutCubic(
        data.rightarm.rotation.z,
        0,
        data.speed
      );
      if (
        isPoseReady([
          { value: data.leftarm.rotation.x, target: 0 },
          { value: data.leftarm.rotation.z, target: 0 },
          { value: data.rightarm.rotation.x, target: 0 },
          { value: data.rightarm.rotation.z, target: 0 },
        ])
      ) {
        return true;
      }
    }
  }
);
