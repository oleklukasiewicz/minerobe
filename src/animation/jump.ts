import {
  RenderAnimation,
  lerp,
  lerpOutCubic,
  isPoseReady,
} from "$data/animation";
const JumpAnimation = new RenderAnimation(
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
      data.speed = 0.02;
      data.waiter = 0;
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
      data.leftleg.rotation.x = lerpOutCubic(
        clock,
        data.leftleg.rotation.x,
        0,
        data.speed
      );
      data.rightleg.position.y = lerpOutCubic(
        clock,
        data.rightleg.position.y,
        1.53,
        data.speed
      );
      data.rightleg.position.z = lerpOutCubic(
        clock,
        data.rightleg.position.z,
        -0.2,
        data.speed
      );
      data.body.rotation.z = lerpOutCubic(
        clock,
        data.body.rotation.z,
        0.1,
        data.speed
      );
      data.body.position.x = lerpOutCubic(
        clock,
        data.body.position.x,
        -0.07,
        data.speed
      );
      data.leftarm.rotation.z = lerpOutCubic(
        clock,
        data.leftarm.rotation.z,
        -0.1,
        data.speed
      );
      data.rightarm.rotation.z = lerpOutCubic(
        clock,
        data.rightarm.rotation.z,
        2.8,
        data.speed
      );
      data.rightarm.rotation.x = lerpOutCubic(
        clock,
        data.rightarm.rotation.x,
        0,
        data.speed
      );
      data.head.rotation.x = lerpOutCubic(
        clock,
        data.head.rotation.x,
        0.5,
        data.speed
      );
      data.head.rotation.y = lerpOutCubic(
        clock,
        data.head.rotation.y,
        -0.3,
        data.speed
      );

      data.body.position.y = lerpOutCubic(
        clock,
        data.body.position.y,
        2,
        data.speed
      );
      data.leftleg.position.y = lerpOutCubic(
        clock,
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
        data.waiter += clock;
        if (data.waiter > 0.1) {
          data.goingUp = false;
        }
      }
    } else {
      data.leftleg.rotation.x = lerpOutCubic(
        clock,
        data.leftleg.rotation.x,
        0,
        data.speedOut
      );
      data.rightleg.position.y = lerpOutCubic(
        clock,
        data.rightleg.position.y,
        0.75,
        data.speedOut
      );
      data.leftleg.position.y = lerpOutCubic(
        clock,
        data.leftleg.position.y,
        0.75,
        data.speedOut
      );
      data.rightleg.position.z = lerpOutCubic(
        clock,
        data.rightleg.position.z,
        0,
        data.speedOut
      );
      data.body.rotation.z = lerpOutCubic(
        clock,
        data.body.rotation.z,
        0,
        data.speedOut
      );
      data.body.position.x = lerpOutCubic(
        clock,
        data.body.position.x,
        0,
        data.speedOut
      );
      data.leftarm.rotation.z = lerpOutCubic(
        clock,
        data.leftarm.rotation.z,
        0,
        data.speedOut
      );
      data.body.position.y = lerpOutCubic(
        clock,
        data.body.position.y,
        1.47,
        data.speedOut
      );
      data.rightarm.rotation.z = lerpOutCubic(
        clock,
        data.rightarm.rotation.z,
        0,
        data.speedOut
      );
      data.rightarm.rotation.x = lerpOutCubic(
        clock,
        data.rightarm.rotation.x,
        0,
        data.speedOut
      );
      data.head.rotation.x = lerpOutCubic(
        clock,
        data.head.rotation.x,
        0,
        data.speedOut
      );
      data.head.rotation.y = lerpOutCubic(
        clock,
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
export default JumpAnimation;
