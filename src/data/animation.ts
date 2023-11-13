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
  return (1 - Math.pow(1 - t, 3));
}
function lerpOutCubic(clock,prop, target, speed) {
  return lerp(prop, target, easeOutCubic(speed*(clock*150)));
}
function isPoseReady(poses, epsilon = 0.003) {
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
      data.angle = 5;
      data.speed = 1;
      data.returnSpeed = 0.01;
      data.armAngle = (5 * Math.PI) / 180;
    }
    return data;
  },
  function (data, scene, clock, modelName,elapsedRenderTime) {
    const elapsedTime = clock;
    const amplitude = 0.025;
    const cSin = Math.sin(elapsedRenderTime);
    if (data.leftarm) {
      data.leftarm.rotation.z = lerpOutCubic(clock,
        data.leftarm.rotation.z,
        -0.06 + -0.06 * cSin,
        data.returnSpeed
      );
      data.rightarm.rotation.z = lerpOutCubic(clock,
        data.rightarm.rotation.z,
        0.06 + 0.06 * cSin,
        data.returnSpeed
      );
    }
    if (data.head) {
      if (clock > data.nextRotationTime) {
        // Time for a new rotation
        data.headRotation = ((Math.random() * 120 - 60) * Math.PI) / 180; // New random rotation
        data.nextRotationTime = clock + Math.random() * 5; // New random time for the next rotation
        data.rotationSpeed = Math.random() * 0.03 + data.returnSpeed; // New random speed for the head rotation
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
      data.body.rotation.y = lerpOutCubic(clock,
        data.body.rotation.y,
        data.bodyRotationTarget - data.body.rotation.y,
        data.returnSpeed
      );

      data.head.rotation.x = lerpOutCubic(clock,
        data.head.rotation.x,
        0.07 * cSin,
        data.returnSpeed
      );

      data.body.position.y = lerpOutCubic(clock,
        data.body.position.y,
        1.47 + amplitude * Math.sin(elapsedRenderTime),
        data.returnSpeed
      );

      data.rightleg.rotation.x = lerpOutCubic(clock,
        data.rightleg.rotation.x,
        -0.2 + 0.06 * cSin,
        data.returnSpeed
      );
      data.rightleg.position.z = lerpOutCubic(clock,
        data.rightleg.position.z,
        -0.02 + 0.04 * cSin,
        data.returnSpeed
      );
      const delay = 0.5; // Adjust this value to change the delay

      data.leftleg.rotation.x = lerpOutCubic(clock,
        data.leftleg.rotation.x,
        0 + 0.03 * Math.sin(elapsedRenderTime + delay),
        data.returnSpeed
      );
      data.leftleg.position.z = lerpOutCubic(clock,
        data.leftleg.position.z,
        0 + 0.03 * Math.sin(elapsedRenderTime + delay),
        data.returnSpeed
      );
    }
  },
  function (data, scene, clock, modelName) {
    data.head.rotation.y = lerpOutCubic(clock,data.head.rotation.y, 0, 0.04);
    data.leftleg.rotation.x = lerpOutCubic(clock,data.leftleg.rotation.x, 0, 0.04);
    data.leftleg.position.z = lerpOutCubic(clock,data.leftleg.position.z, 0, 0.04);
    if (
      isPoseReady(
        [
          { value: data.head.rotation.y, target: 0 },
          { value: data.leftleg.rotation.x, target: 0 },
          { value: data.leftleg.position.z, target: 0 },
        ],
        0.01
      )
    ) {
      return true;
    }
    return false;
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
    const elapsedTime = clock;

    const cSin = 1 * Math.sin(clock);
    if (data.head) {
      if (data.isRotatingDown || data.isLookingLeft || data.isLookingRight) {
        data.body.position.y = 1.47 + amplitude * cSin;
      }
      if (data.isRotatingDown) {
        data.isLookingLeft = true;
        // Interpolate between the current rotation and the down rotation
        data.leftleg.rotation.x = lerpOutCubic(clock,
          data.leftleg.rotation.x,
          0.01,
          resetSpeed
        );
        data.head.rotation.x = lerpOutCubic(clock,
          data.head.rotation.x,
          data.downRotation,
          resetSpeed
        );
        data.body.rotation.x = lerpOutCubic(clock,
          data.body.rotation.x,
          data.bodyDownRotation,
          resetSpeed
        );
        data.body.position.z = lerpOutCubic(clock,
          data.body.position.z,
          data.bodyDownRotation,
          resetSpeed
        );

        data.leftarm.rotation.z = lerpOutCubic(clock,
          data.leftarm.rotation.z,
          data.armRot * -1,
          resetSpeed
        );

        data.rightarm.rotation.z = lerpOutCubic(clock,
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
        data.head.rotation.y = lerpOutCubic(clock,
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
        data.head.rotation.y = lerpOutCubic(clock,
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
        data.head.rotation.x = lerpOutCubic(clock,
          data.head.rotation.x,
          0,
          resetSpeed
        );
        data.body.rotation.x = lerpOutCubic(clock,
          data.body.rotation.x,
          0,
          resetSpeed
        );
        data.body.position.z = lerpOutCubic(clock,
          data.body.position.z,
          0,
          resetSpeed
        );
        data.head.rotation.z = lerpOutCubic(clock,
          data.head.rotation.z,
          0,
          resetSpeed
        );

        data.head.rotation.y = lerpOutCubic(clock,
          data.head.rotation.y,
          0,
          resetSpeed
        );

        data.leftarm.rotation.z = lerpOutCubic(clock,
          data.leftarm.rotation.z,
          0,
          resetSpeed
        );

        data.rightarm.rotation.z = lerpOutCubic(clock,
          data.rightarm.rotation.z,
          0,
          resetSpeed
        );

        data.body.position.y = lerpOutCubic(clock,
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
            { value: data.leftarm.rotation.z, target: 0 },
            { value: data.rightarm.rotation.z, target: 0 },
          ])
        ) {
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
    const elapsedTime = clock;

    const cSin = 1 * Math.sin(clock);

    if (data.head) {
      data.body.position.y = 1.47 + amplitude * cSin;
      data.rightleg.rotation.x = -0.2 + 0.06 * cSin;
      data.rightleg.position.z = -0.02 + 0.04 * cSin;
      const delay = 0.5; // Adjust this value to change the delay

      data.leftleg.rotation.x =
        0.05 + 0.03 * Math.sin(clock + delay);
      data.leftleg.position.z = 0 + 0.03 * Math.sin(clock + delay);

      if (data.isRotatingDown) {
        data.isLookingLeft = true;
        // Interpolate between the current rotation and the down rotation
        data.head.rotation.x = lerpOutCubic(clock,
          data.head.rotation.x,
          data.downRotation,
          resetSpeed
        );
        // data.body.rotation.x = lerpOutCubic(clock,
        //   data.body.rotation.x,
        //   data.bodyDownRotation,
        //  resetSpeed
        // );
        // data.body.position.z = lerpOutCubic(clock,
        //   data.body.position.z,
        //   data.bodyDownRotation,
        //  resetSpeed
        // );

        data.leftarm.rotation.z = lerpOutCubic(clock,
          data.leftarm.rotation.z,
          data.armRot * -1,
          resetSpeed
        );

        data.rightarm.rotation.z = lerpOutCubic(clock,
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
        data.head.rotation.y = lerpOutCubic(clock,
          data.head.rotation.y,
          data.leftRotation,
          resetSpeed
        );
        data.rightleg.rotation.x = lerpOutCubic(clock,
          data.rightleg.rotation.x,
          0,
          resetSpeed
        );

        data.leftleg.rotation.x = lerpOutCubic(clock,
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
        data.head.rotation.y = lerpOutCubic(clock,
          data.head.rotation.y,
          data.rightRotation,
          resetSpeed
        );

        data.rightleg.rotation.x = lerpOutCubic(clock,
          data.rightleg.rotation.x,
          data.legRot,
          resetSpeed
        );

        data.leftleg.rotation.x = lerpOutCubic(clock,
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
        data.head.rotation.x = lerpOutCubic(clock,
          data.head.rotation.x,
          0,
          resetSpeed
        );
        // data.body.rotation.x = lerpOutCubic(clock,
        //   data.body.rotation.x,
        //   0,
        //  resetSpeed
        // );
        // data.body.position.z = lerpOutCubic(clock,
        //   data.body.position.z,
        //   0,
        //  resetSpeed
        // );
        data.head.rotation.y = lerpOutCubic(clock,
          data.head.rotation.y,
          0,
          resetSpeed
        );

        data.leftarm.rotation.z = lerpOutCubic(clock,
          data.leftarm.rotation.z,
          -0.05,
          resetSpeed
        );

        data.rightarm.rotation.z = lerpOutCubic(clock,
          data.rightarm.rotation.z,
          0.05,
          resetSpeed
        );

        data.rightleg.rotation.x = lerpOutCubic(clock,
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
    const elapsedTime = clock;
    const clapSpeed = 0.08; // Adjust this value to change the speed of the clap
    const positionSpeed = 0.015; // Adjust this value to change the speed of the position reset
    const epsilon = 0.01; // Adjust this value to change the precision of the equality check
    const clapRotation = 25 * (Math.PI / 180); // 45 degrees in radians
    const clapRotationEnd = 15 * (Math.PI / 180); // 45 degrees in radians
    const initialRotation = 100 * (Math.PI / 180); // 90 degrees in radians
    const amplitude = 0.025;

    const cSin = data.speed * Math.sin(clock);

    if (data.leftarm && data.rightarm) {
      data.head.rotation.x = -0.001 + 0.07 * cSin;
      data.head.rotation.y = lerpOutCubic(clock,data.head.rotation.y, 0, 0.02);
      data.body.position.y = 1.47 + amplitude * cSin;
      data.rightleg.rotation.x = -0.2 + 0.06 * cSin;
      data.rightleg.position.z = -0.02 + 0.04 * cSin;
      const delay = 0.5; // Adjust this value to change the delay

      data.leftleg.rotation.x =
        0.05 + 0.03 * Math.sin(clock + delay);
      data.leftleg.position.z = 0 + 0.03 * Math.sin(clock + delay);

      if (!data.isInitialRotationSet == true) {
        // Interpolate between the current rotation and the initial rotation
        data.leftarm.rotation.x = lerpOutCubic(clock,
          data.leftarm.rotation.x,
          initialRotation,
          positionSpeed
        );
        data.leftarm.rotation.z = lerpOutCubic(clock,
          data.leftarm.rotation.z,
          clapRotation,
          clapSpeed
        );
        data.rightarm.rotation.x = lerpOutCubic(clock,
          data.rightarm.rotation.x,
          initialRotation,
          positionSpeed
        );
        data.rightarm.rotation.z = lerpOutCubic(clock,
          data.rightarm.rotation.z,
          -clapRotation,
          clapSpeed
        );
        data.head.rotation.z = lerpOutCubic(clock,data.head.rotation.z, 0.2, 0.02);

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
          data.leftarm.rotation.z = lerpOutCubic(clock,
            data.leftarm.rotation.z,
            clapRotation,
            clapSpeed
          );
          data.rightarm.rotation.z = lerpOutCubic(clock,
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
          data.leftarm.rotation.z = lerpOutCubic(clock,
            data.leftarm.rotation.z,
            clapRotationEnd,
            clapSpeed
          );
          data.rightarm.rotation.z = lerpOutCubic(clock,
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
        data.leftarm.rotation.x = lerpOutCubic(clock,
          data.leftarm.rotation.x,
          0,
          positionSpeed
        );
        data.rightarm.rotation.x = lerpOutCubic(clock,
          data.rightarm.rotation.x,
          0,
          positionSpeed
        );
        data.leftarm.rotation.z = lerpOutCubic(clock,
          data.leftarm.rotation.z,
          -0.05,
          clapSpeed
        );
        data.rightarm.rotation.z = lerpOutCubic(clock,
          data.rightarm.rotation.z,
          0.05,
          clapSpeed
        );
        data.head.rotation.z = lerpOutCubic(clock,data.head.rotation.z, 0, 0.01);
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
      data.leftarm.rotation.x = lerpOutCubic(clock,data.leftarm.rotation.x, 0, 0.05);
      data.rightarm.rotation.x = lerpOutCubic(clock,data.rightarm.rotation.x, 0, 0.1);
      data.head.rotation.x = lerpOutCubic(clock,data.head.rotation.x, 0, 0.1);
      data.head.rotation.y = lerpOutCubic(clock,data.head.rotation.y, 0, 0.1);
      data.head.rotation.z = lerpOutCubic(clock,data.head.rotation.z, 0, 0.1);
      data.body.rotation.x = lerpOutCubic(clock,data.body.rotation.x, 0, 0.1);
      data.leftleg.rotation.x = lerpOutCubic(clock,data.leftleg.rotation.x, 0, 0.1);
      data.leftleg.rotation.z = lerpOutCubic(clock,data.leftleg.rotation.z, 0, 0.1);
      data.rightleg.rotation.x = lerpOutCubic(clock,data.rightleg.rotation.x, 0, 0.1);
      data.rightleg.rotation.z = lerpOutCubic(clock,data.rightleg.rotation.z, 0, 0.1);
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
          data.body.rotation.x = lerpOutCubic(clock,
            data.body.rotation.x,
            -0.6,
            data.speed
          );
          data.body.position.z = lerpOutCubic(clock,
            data.body.position.z,
            -0.4,
            data.speed
          );
          data.body.position.y = lerpOutCubic(clock,
            data.body.position.y,
            1.38,
            data.speed
          );
          data.head.rotation.x = lerpOutCubic(clock,
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
          data.body.rotation.x = lerpOutCubic(clock,
            data.body.rotation.x,
            0,
            data.speed
          );
          data.body.position.z = lerpOutCubic(clock,
            data.body.position.z,
            0,
            data.speed
          );
          data.body.position.y = lerpOutCubic(clock,
            data.body.position.y,
            1.47,
            data.speed
          );
          data.head.rotation.x = lerpOutCubic(clock,
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
      data.bodyPosition = 1.47;
      data.delay = 1.5;
      data.waiter = 0;
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName) {
    if (data.ishandGoUp) {
      data.body.rotation.x = lerpOutCubic(clock,
        data.body.rotation.x,
        0.2,
        data.speed
      );
      data.body.position.z = lerpOutCubic(clock,
        data.body.position.z,
        0.17,
        data.speed
      );
      data.body.position.y = lerpOutCubic(clock,
        data.body.position.y,
        1.43,
        data.speed
      );
      data.leftarm.rotation.x = lerpOutCubic(clock,
        data.leftarm.rotation.x,
        data.deg90,
        data.speed
      );
      data.leftarm.rotation.z = lerpOutCubic(clock,
        data.leftarm.rotation.z,
        -0.2,
        data.speed
      );
      data.rightarm.rotation.x = lerpOutCubic(clock,
        data.rightarm.rotation.x,
        data.deg90,
        data.speed
      );
      data.rightarm.rotation.z = lerpOutCubic(clock,
        data.rightarm.rotation.z,
        0.2,
        data.speed
      );
      if (
        isPoseReady([
          { value: data.leftarm.rotation.x, target: data.deg90 },
          { value: data.leftarm.rotation.z, target: -0.2 },
          { value: data.rightarm.rotation.x, target: data.deg90 },
          { value: data.rightarm.rotation.z, target: 0.2 },
        ])
      ) {
        data.waiter+=clock
        if (data.waiter > data.delay) {
          data.ishandGoUp = false;
        }
      }
    } else {
      data.body.rotation.x = lerpOutCubic(clock,data.body.rotation.x, 0, data.speed);
      data.body.position.z = lerpOutCubic(clock,data.body.position.z, 0, data.speed);
      data.body.position.y = lerpOutCubic(clock,
        data.body.position.y,
        1.47,
        data.speed
      );
      data.leftarm.rotation.x = lerpOutCubic(clock,
        data.leftarm.rotation.x,
        0,
        data.speed
      );
      data.leftarm.rotation.z = lerpOutCubic(clock,
        data.leftarm.rotation.z,
        0,
        data.speed
      );
      data.rightarm.rotation.x = lerpOutCubic(clock,
        data.rightarm.rotation.x,
        0,
        data.speed
      );
      data.rightarm.rotation.z = lerpOutCubic(clock,
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
    data.bodyPosition = data.body.position.y;
  }
);
export const BowAnimation = new RenderAnimation(
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
      data.isBowing = true;
      data.waiter = 0;
      data.bodyPosition = 1.47;
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName) {
    const elapsedTime = clock;
    const speed = 0.03;
    const speedOut = 0.02;
    const cSin = Math.sin(clock);
    const amplitude = 0.025;

    data.body.position.y = lerpOutCubic(clock,
      data.body.position.y,
      data.bodyPosition + amplitude * Math.sin(clock),
      0.02
    );

    data.rightleg.rotation.x = lerpOutCubic(clock,
      data.rightleg.rotation.x,
      -0.2 + 0.06 * cSin,
      0.02
    );
    data.rightleg.position.z = lerpOutCubic(clock,
      data.rightleg.position.z,
      -0.02 + 0.04 * cSin,
      0.02
    );
    const delay = 0.5; // Adjust this value to change the delay

    data.leftleg.rotation.x = lerpOutCubic(clock,
      data.leftleg.rotation.x,
      (data.leftleg.position.z =
        0 + 0.03 * Math.sin(clock + delay)),
      0.02
    );

    if (data.isBowing) {
      data.body.rotation.x = lerpOutCubic(clock,data.body.rotation.x, -1, speed);
      data.body.position.z = lerpOutCubic(clock,data.body.position.z, -0.6, speed);
      data.body.position.y = lerpOutCubic(clock,data.body.position.y, 1.16, speed);
      data.body.rotation.y = lerpOutCubic(clock,data.body.rotation.y, 0.3, speed);

      data.leftarm.rotation.x = lerpOutCubic(clock,
        data.leftarm.rotation.x,
        -0.5,
        speed
      );
      data.leftarm.rotation.z = lerpOutCubic(clock,
        data.leftarm.rotation.z,
        0.2,
        speed
      );

      data.rightarm.rotation.x = lerpOutCubic(clock,
        data.rightarm.rotation.x,
        0.5,
        speed
      );
      data.rightarm.rotation.z = lerpOutCubic(clock,
        data.rightarm.rotation.z,
        -0.5,
        speed
      );
      if (
        isPoseReady([
          { value: data.body.rotation.x, target: -1 },
          { value: data.body.rotation.y, target: 0.3 },
          { value: data.leftarm.rotation.x, target: -0.5 },
          { value: data.leftarm.rotation.z, target: 0.2 },
          { value: data.rightarm.rotation.x, target: 0.5 },
          { value: data.rightarm.rotation.z, target: -0.5 },
        ])
      ) {
        data.waiter+=clock
        if (data.waiter > 0.2) {
          data.isBowing = false;
        }
      }
    } else {
      data.body.rotation.x = lerpOutCubic(clock,data.body.rotation.x, 0, speedOut);
      data.body.position.z = lerpOutCubic(clock,data.body.position.z, 0, speedOut);
      data.body.position.y = lerpOutCubic(clock,data.body.position.y, 1.47, speedOut);
      data.body.rotation.y = lerpOutCubic(clock,data.body.rotation.y, 0, speedOut);

      data.leftarm.rotation.x = lerpOutCubic(clock,
        data.leftarm.rotation.x,
        0,
        speedOut
      );
      data.leftarm.rotation.z = lerpOutCubic(clock,
        data.leftarm.rotation.z,
        0,
        speedOut
      );

      data.rightarm.rotation.x = lerpOutCubic(clock,
        data.rightarm.rotation.x,
        0,
        speedOut
      );
      data.rightarm.rotation.z = lerpOutCubic(clock,
        data.rightarm.rotation.z,
        0,
        speedOut
      );
      if (
        isPoseReady([
          { value: data.body.rotation.x, target: 0 },
          { value: data.body.position.z, target: 0 },
          { value: data.body.position.y, target: 1.47 },
          { value: data.body.rotation.y, target: 0 },
          { value: data.leftarm.rotation.x, target: 0 },
          { value: data.leftarm.rotation.z, target: 0 },
          { value: data.rightarm.rotation.x, target: 0 },
          { value: data.rightarm.rotation.z, target: 0 },
        ])
      ) {
        return true;
      }
    }
    data.bodyPosition = data.body.position.y;
  }
);
export const WavingAnimation = new RenderAnimation(
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
      data.isWaveIn = true;
      data.waveCount = 0;
      data.waveCountMax = 5;
      data.speed = 0.035;
      data.bodyPosition = 1.47;
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName) {
    const elapsedTime = clock;
    const speed = 0.03;
    const speedOut = 0.02;
    const cSin = Math.sin(clock);
    const amplitude = 0.025;

    data.body.position.y = lerpOutCubic(clock,
      data.body.position.y,
      data.bodyPosition + amplitude * Math.sin(clock),
      0.02
    );
    data.head.rotation.y = lerpOutCubic(clock,data.head.rotation.y, 0, 0.02);

    data.rightleg.rotation.x = lerpOutCubic(clock,
      data.rightleg.rotation.x,
      -0.2 + 0.06 * cSin,
      0.02
    );
    data.rightleg.position.z = lerpOutCubic(clock,
      data.rightleg.position.z,
      -0.02 + 0.04 * cSin,
      0.02
    );
    const delay = 0.5; // Adjust this value to change the delay

    data.leftleg.rotation.x = lerpOutCubic(clock,
      data.leftleg.rotation.x,
      (data.leftleg.position.z =
        0 + 0.03 * Math.sin(clock + delay)),
      0.02
    );
    if (data.waveCount >= data.waveCountMax) {
      data.body.rotation.z = lerpOutCubic(clock,data.body.rotation.z, 0, data.speed);
      data.body.position.y = lerpOutCubic(clock,
        data.body.position.y,
        1.47,
        data.speed
      );
      data.body.position.x = lerpOutCubic(clock,data.body.position.x, 0, data.speed);
      data.leftarm.rotation.z = lerpOutCubic(clock,
        data.leftarm.rotation.z,
        -0.05,
        data.speed
      );
      data.leftarm.rotation.x = lerpOutCubic(clock,
        data.leftarm.rotation.x,
        0,
        data.speed
      );
      data.rightarm.rotation.z = lerpOutCubic(clock,
        data.rightarm.rotation.z,
        0.05,
        data.speed
      );
      data.rightarm.rotation.x = lerpOutCubic(clock,
        data.rightarm.rotation.x,
        0,
        data.speed
      );
      data.head.rotation.z = lerpOutCubic(clock,data.head.rotation.z, 0, data.speed);
      if (
        isPoseReady(
          [
            { value: data.body.rotation.z, target: 0 },
            { value: data.body.position.x, target: 0 },
            { value: data.leftarm.rotation.z, target: -0.05 },
            { value: data.leftarm.rotation.x, target: 0 },
            { value: data.rightarm.rotation.z, target: 0.05 },
            { value: data.rightarm.rotation.x, target: 0 },
          ],
          0.01
        )
      ) {
        return true;
      }
    } else {
      if (data.isWaveIn) {
        data.head.rotation.z = lerpOutCubic(clock,
          data.head.rotation.z,
          0.1,
          data.speed
        );
        data.body.rotation.z = lerpOutCubic(clock,
          data.body.rotation.z,
          -0.3,
          data.speed
        );
        data.body.position.y = lerpOutCubic(clock,
          data.body.position.y,
          1.45,
          data.speed
        );
        data.body.position.x = lerpOutCubic(clock,
          data.body.position.x,
          0.2,
          data.speed
        );
        data.leftarm.rotation.z = lerpOutCubic(clock,
          data.leftarm.rotation.z,
          -2.5,
          data.speed
        );
        data.leftarm.rotation.x = lerpOutCubic(clock,
          data.leftarm.rotation.x,
          0,
          data.speed
        );
        data.rightarm.rotation.z = lerpOutCubic(clock,
          data.rightarm.rotation.z,
          0.3,
          data.speed
        );
        data.rightarm.rotation.x = lerpOutCubic(clock,
          data.rightarm.rotation.x,
          0,
          data.speed
        );
        if (
          isPoseReady(
            [
              { value: data.body.rotation.z, target: -0.3 },
              { value: data.body.position.x, target: 0.2 },
              { value: data.leftarm.rotation.z, target: -2.5 },
              { value: data.leftarm.rotation.x, target: 0 },
              { value: data.rightarm.rotation.z, target: 0.3 },
              { value: data.rightarm.rotation.x, target: 0 },
            ],
            0.05
          )
        ) {
          data.isWaveIn = false;
        }
      } else {
        data.head.rotation.z = lerpOutCubic(clock,
          data.head.rotation.z,
          -0.1,
          data.speed
        );
        data.body.rotation.z = lerpOutCubic(clock,
          data.body.rotation.z,
          -0.2,
          data.speed
        );
        data.body.position.y = lerpOutCubic(clock,
          data.body.position.y,
          1.46,
          data.speed
        );
        data.body.position.x = lerpOutCubic(clock,
          data.body.position.x,
          0.14,
          data.speed
        );
        data.leftarm.rotation.z = lerpOutCubic(clock,
          data.leftarm.rotation.z,
          -2,
          data.speed
        );
        data.leftarm.rotation.x = lerpOutCubic(clock,
          data.leftarm.rotation.x,
          0,
          data.speed
        );
        data.rightarm.rotation.z = lerpOutCubic(clock,
          data.rightarm.rotation.z,
          0.1,
          data.speed
        );
        data.rightarm.rotation.x = lerpOutCubic(clock,
          data.rightarm.rotation.x,
          0,
          data.speed
        );
        if (
          isPoseReady(
            [
              { value: data.body.rotation.z, target: -0.2 },
              { value: data.body.position.x, target: 0.14 },
              { value: data.leftarm.rotation.z, target: -2 },
              { value: data.leftarm.rotation.x, target: 0 },
              { value: data.rightarm.rotation.z, target: 0.1 },
              { value: data.rightarm.rotation.x, target: 0 },
            ],
            0.01
          )
        ) {
          data.isWaveIn = true;
          data.waveCount++;
        }
      }
    }
    data.bodyPosition = data.body.position.y;
  }
);
export const JumpAnimation = new RenderAnimation(
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

    //data.leftleg.parent.remove(data.leftleg);
    //data.rightleg.parent.remove(data.rightleg);

    //data.body.add(data.leftleg);
    //data.body.add(data.rightleg);

    //data.leftleg.position.set(-0.12, -0.75, 0);
    //data.rightleg.position.set(0.12, -0.75, 0);

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
      data.speed = 0.025;
      data.waiter=0;
      data.speedOut = 0.02;
      data.goingUp = true;
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName) {
    if (data.goingUp) {
      data.leftleg.rotation.x = lerpOutCubic(clock,
        data.leftleg.rotation.x,
        0,
        data.speed
      );
      data.rightleg.position.y = lerpOutCubic(clock,
        data.rightleg.position.y,
        1.53,
        data.speed
      );
      data.rightleg.position.z = lerpOutCubic(clock,
        data.rightleg.position.z,
        -0.2,
        data.speed
      );
      data.body.rotation.z = lerpOutCubic(clock,
        data.body.rotation.z,
        0.1,
        data.speed
      );
      data.body.position.x = lerpOutCubic(clock,
        data.body.position.x,
        -0.07,
        data.speed
      );
      data.leftarm.rotation.z = lerpOutCubic(clock,
        data.leftarm.rotation.z,
        -0.1,
        data.speed
      );
      data.rightarm.rotation.z = lerpOutCubic(clock,
        data.rightarm.rotation.z,
        2.8,
        data.speed
      );
      data.rightarm.rotation.x = lerpOutCubic(clock,
        data.rightarm.rotation.x,
        0,
        data.speed
      );
      data.head.rotation.x = lerpOutCubic(clock,
        data.head.rotation.x,
        0.5,
        data.speed
      );
      data.head.rotation.y = lerpOutCubic(clock,
        data.head.rotation.y,
        -0.3,
        data.speed
      );

      data.body.position.y = lerpOutCubic(clock,data.body.position.y, 2, data.speed);
      data.leftleg.position.y = lerpOutCubic(clock,
        data.leftleg.position.y,
        1.24,
        data.speed
      );
      if (
        isPoseReady([
          { value: data.leftleg.rotation.x, target: 0 },
          { value: data.rightleg.position.y, target: 1.53 },
          { value: data.rightleg.position.z, target: -0.2 },
          { value: data.body.rotation.z, target: 0.1 },
          { value: data.body.position.x, target: -0.07 },
          { value: data.leftarm.rotation.z, target: -0.1 },
          { value: data.rightarm.rotation.z, target: 2.8 },
          { value: data.rightarm.rotation.x, target: 0 },
          { value: data.head.rotation.x, target: 0.5 },
          { value: data.head.rotation.y, target: -0.3 },
          { value: data.body.position.y, target: 2 },
          { value: data.leftleg.position.y, target: 1.24 },
        ])
      ) {
        data.waiter+=clock;
        if (data.waiter > 0.1) {
          
          data.goingUp = false;
        }
      }
    } else {
      data.leftleg.rotation.x = lerpOutCubic(clock,
        data.leftleg.rotation.x,
        0,
        data.speedOut
      );
      data.rightleg.position.y = lerpOutCubic(clock,
        data.rightleg.position.y,
        0.75,
        data.speedOut
      );
      data.leftleg.position.y = lerpOutCubic(clock,
        data.leftleg.position.y,
        0.75,
        data.speedOut
      );
      data.rightleg.position.z = lerpOutCubic(clock,
        data.rightleg.position.z,
        0,
        data.speedOut
      );
      data.body.rotation.z = lerpOutCubic(clock,
        data.body.rotation.z,
        0,
        data.speedOut
      );
      data.body.position.x = lerpOutCubic(clock,
        data.body.position.x,
        0,
        data.speedOut
      );
      data.leftarm.rotation.z = lerpOutCubic(clock,
        data.leftarm.rotation.z,
        0,
        data.speedOut
      );
      data.body.position.y = lerpOutCubic(clock,
        data.body.position.y,
        1.47,
        data.speedOut
      );
      data.rightarm.rotation.z = lerpOutCubic(clock,
        data.rightarm.rotation.z,
        0,
        data.speedOut
      );
      data.rightarm.rotation.x = lerpOutCubic(clock,
        data.rightarm.rotation.x,
        0,
        data.speedOut
      );
      data.head.rotation.x = lerpOutCubic(clock,
        data.head.rotation.x,
        0,
        data.speedOut
      );
      data.head.rotation.y = lerpOutCubic(clock,
        data.head.rotation.y,
        0,
        data.speedOut
      );

      if (
        isPoseReady([
          { value: data.leftleg.rotation.x, target: 0 },
          { value: data.rightleg.position.y, target: 0.75 },
          { value: data.rightleg.position.z, target: 0 },
          { value: data.body.rotation.z, target: 0 },
          { value: data.body.position.x, target: 0 },
          { value: data.leftarm.rotation.z, target: 0 },
          { value: data.rightarm.rotation.z, target: 0 },
          { value: data.rightarm.rotation.x, target: 0 },
          { value: data.head.rotation.x, target: 0 },
          { value: data.head.rotation.y, target: 0 },
          { value: data.body.position.y, target: 1.47 },
          { value: data.leftleg.position.y, target: 0.75 },
        ])
      ) {
        return true;
      }
    }
  }
);
