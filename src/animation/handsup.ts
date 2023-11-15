import { RenderAnimation,lerp,lerpOutCubic,isPoseReady } from "$data/animation";
import { MODEL_TYPE } from "$src/data/common";
const HandsUpAnimation = new RenderAnimation(
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
      if (modelName ==MODEL_TYPE.STEVE) {
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
        data.delay = 0.2;
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
  export default HandsUpAnimation;