import { RenderAnimation,lerp,lerpOutCubic,isPoseReady } from "$data/animation";
import { MODEL_TYPE } from "$data/consts";
 const DefaultAnimation = new RenderAnimation(
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
  
        if (modelName ==MODEL_TYPE.STEVE) {
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
        if (elapsedRenderTime > data.nextRotationTime) {
          // Time for a new rotation
          data.headRotation = ((Math.random() * 120 - 60) * Math.PI) / 180; // New random rotation
          data.nextRotationTime = elapsedRenderTime + Math.random() * 5; // New random time for the next rotation
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
  export default DefaultAnimation;