import { RenderAnimation,lerp,lerpOutCubic,isPoseReady } from "$data/animation";
import { MODEL_TYPE } from "$data/consts";
const WavingAnimation = new RenderAnimation(
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
        data.isWaveIn = true;
        data.waveCount = 0;
        data.waveCountMax = 5;
        data.speed = 0.04;
        data.speedOut = 0.017;
        data.bodyPosition = 1.47;
      }
      return data;
    },
    function () {
      return true;
    },
    function (data, scene, clock, modelName,elapsedRenderTime) {
      const cSin = Math.sin(elapsedRenderTime);
      const amplitude = 0.025;
  
      data.body.position.y = lerpOutCubic(clock,
        data.body.position.y,
        data.bodyPosition + amplitude * cSin,
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
          0 + 0.03 * Math.sin(elapsedRenderTime + delay)),
        0.02
      );
      if (data.waveCount >= data.waveCountMax) {
        data.body.rotation.z = lerpOutCubic(clock,data.body.rotation.z, 0, data.speed);
        data.body.position.y = lerpOutCubic(clock,
          data.body.position.y,
          1.47,
          data.speedOut
        );
        data.body.position.x = lerpOutCubic(clock,data.body.position.x, 0, data.speed);
        data.leftarm.rotation.z = lerpOutCubic(clock,
          data.leftarm.rotation.z,
          -0.05,
          data.speedOut
        );
        data.leftarm.rotation.x = lerpOutCubic(clock,
          data.leftarm.rotation.x,
          0,
          data.speedOut
        );
        data.rightarm.rotation.z = lerpOutCubic(clock,
          data.rightarm.rotation.z,
          0.05,
          data.speedOut
        );
        data.rightarm.rotation.x = lerpOutCubic(clock,
          data.rightarm.rotation.x,
          0,
          data.speed
        );
        data.head.rotation.z = lerpOutCubic(clock,data.head.rotation.z, 0, data.speedOut);
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
    export default WavingAnimation;