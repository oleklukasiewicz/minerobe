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
      firstFrameAfterPrepare: true,
    };

    const armDistanceX = 0.31; // Adjust this value to change the distance of the arms from the body in the x direction
    const armDistanceZ = 0.0; // Adjust this value to change the distance of the arms from the body in the z direction

    if (data.leftarm && data.rightarm) {
      data.leftarm.parent.remove(data.leftarm);
      data.rightarm.parent.remove(data.rightarm);

      data.body.add(data.leftarm);
      data.body.add(data.rightarm);

      data.head.parent.remove(data.head);

      data.body.add(data.head);
      data.head.position.set(0, 0, 0);

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
    if (data.firstFrameAfterPrepare) {
      data.firstFrameAfterPrepare = false;
      clock.start();
    }
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
        data.rotationSpeed = Math.random() * 0.03 + 0.02; // New random speed for the head rotation
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
      data.body.rotation.y = lerpOutCubic(data.body.rotation.y, 0, resetSpeed);

      data.body.position.y = lerpOutCubic(
        data.body.position.y,
        1.47,
        resetSpeed
      );

      data.head.rotation.x = lerpOutCubic(data.head.rotation.x, 0, resetSpeed);
      data.head.rotation.y = lerpOutCubic(data.head.rotation.y, 0, resetSpeed);

      data.rightleg.rotation.x = lerpOutCubic(
        data.rightleg.rotation.x,
        -0.2,
        resetSpeed
      );

      data.rightleg.position.z = lerpOutCubic(
        data.rightleg.position.z,
        0,
        resetSpeed
      );

      data.leftleg.rotation.x = lerpOutCubic(
        data.leftleg.rotation.x,
        0.04,
        resetSpeed
      );
      data.leftleg.position.z = lerpOutCubic(
        data.leftleg.position.z,
        0,
        resetSpeed
      );

      // Add the arms
      data.rightarm.rotation.z = lerpOutCubic(
        data.rightarm.rotation.z,
        0.05,
        resetSpeed
      );
      data.rightarm.position.z = lerpOutCubic(
        data.rightarm.position.z,
        0,
        resetSpeed
      );

      data.leftarm.rotation.z = lerpOutCubic(
        data.leftarm.rotation.z,
        -0.05,
        resetSpeed
      );
      data.leftarm.position.z = lerpOutCubic(
        data.leftarm.position.z,
        0,
        resetSpeed
      );
      const isFinished =
        Math.abs(data.body.rotation.y) < 0.01 &&
        Math.abs(data.body.position.y - 1.47) < 0.01 &&
        Math.abs(data.head.rotation.x) < 0.01 &&
        Math.abs(data.rightleg.rotation.x + 0.2) < 0.01 &&
        Math.abs(data.rightleg.position.z) < 0.01 &&
        Math.abs(data.leftleg.rotation.x - 0.04) < 0.01 &&
        Math.abs(data.leftleg.position.z) < 0.01 &&
        // Check the arms
        Math.abs(data.rightarm.rotation.z - 0.05) < 0.01 &&
        Math.abs(data.rightarm.position.z) < 0.01 &&
        Math.abs(data.leftarm.rotation.z + 0.05) < 0.01 &&
        Math.abs(data.leftarm.position.z) < 0.01;
      return isFinished;
    } else {
      return true;
    }
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
      data.firstFrameAfterPrepare = true;
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

    if (data.firstFrameAfterPrepare) {
      data.firstFrameAfterPrepare = false;
      clock.start();
    }

    const cSin = 1 * Math.sin(clock.elapsedTime);
    if (data.head) {
      if (data.isRotatingDown || data.isLookingLeft || data.isLookingRight) {
        data.body.position.y = 1.47 + amplitude * cSin;
      }
      if (data.isRotatingDown) {
        data.isLookingLeft = true;
        // Interpolate between the current rotation and the down rotation
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
          Math.abs(data.head.rotation.x) < epsilon &&
          Math.abs(data.head.rotation.y) < epsilon &&
          Math.abs(data.body.rotation.x) < epsilon &&
          Math.abs(data.body.position.z) < epsilon &&
          Math.abs(data.rightarm.rotation.z - 0.05) < epsilon &&
          Math.abs(data.leftarm.rotation.z + 0.05) < epsilon
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
      data.firstFrameAfterPrepare = true;
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName) {
    const elapsedTime = clock.getDelta();
    const clapSpeed = 0.06; // Adjust this value to change the speed of the clap
    const positionSpeed = 0.015; // Adjust this value to change the speed of the position reset
    const epsilon = 0.01; // Adjust this value to change the precision of the equality check
    const clapRotation = 25 * (Math.PI / 180); // 45 degrees in radians
    const clapRotationEnd = 15 * (Math.PI / 180); // 45 degrees in radians
    const initialRotation = 100 * (Math.PI / 180); // 90 degrees in radians
    const amplitude = 0.025;
    if (data.firstFrameAfterPrepare) {
      data.firstFrameAfterPrepare = false;
      clock.start();
    }

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

      if (!data.isInitialRotationSet) {
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

        // If the arms are close enough to the initial rotation, set the rotation to the initial rotation
        if (
          Math.abs(data.leftarm.rotation.x - initialRotation) < epsilon &&
          Math.abs(data.rightarm.rotation.x - initialRotation) < epsilon &&
          Math.abs(data.leftarm.rotation.z - clapRotation) < epsilon &&
          Math.abs(data.rightarm.rotation.z + clapRotation) < epsilon
        ) {
          data.leftarm.rotation.x = initialRotation;
          data.rightarm.rotation.x = initialRotation;
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
            Math.abs(data.leftarm.rotation.z - clapRotationEnd) < epsilon &&
            Math.abs(data.rightarm.rotation.z + clapRotationEnd) < epsilon
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
          Math.abs(data.leftarm.rotation.x) < epsilon &&
          Math.abs(data.rightarm.rotation.x) < epsilon &&
          Math.abs(data.leftarm.rotation.z + 0.05) < epsilon &&
          Math.abs(data.rightarm.rotation.z - 0.05) < epsilon
        ) {
          data.clapsCount = 0;
          return true;
        }
      }
    }
    return false;
  }
);
