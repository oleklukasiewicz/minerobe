import { RenderAnimation,lerpOutCubic,isPoseReady } from "$data/animation";
import { MODEL_TYPE } from "$src/data/enums/model";
const BowAnimation = new RenderAnimation(
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
    export default BowAnimation;