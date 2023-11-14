import { RenderAnimation,lerp,lerpOutCubic,isPoseReady } from "$data/animation";
const ClapAnimation = new RenderAnimation(
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
  export default ClapAnimation;