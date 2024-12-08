import { RenderAnimation,lerpOutCubic,isPoseReady } from "$data/animation";
import { MODEL_TYPE } from "$src/data/enums/model";
const FrendshipAnimation = new RenderAnimation(
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
  export default FrendshipAnimation;