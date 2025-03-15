import {
  RenderAnimation,
} from "$data/animation";
import {
  AnimationPropertyStep,
  AnimationStep,
  CreateModelAnimationData,
} from "$src/helpers/render/animationHelper";
const NewOutfitBottomAnimation = new RenderAnimation(
 async function (scene, keepData = false, modelName) {
    let data: any =await CreateModelAnimationData(scene, modelName);
    scene.add(data.rightLegPivot);
    scene.add(data.leftLegPivot);
    data.rightLegPivot.position.set(0.125, 0.75, 0);
    data.leftLegPivot.position.set(-0.125, 0.75, 0);
    data.leftLegPivot.rotation.x = -0.13;

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
      data.returnSpeed = 0.01;
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName, elapsedRenderTime) {
    const resetSpeed = 0.015; // Adjust this value to change the speed of the reset
    const epsilon = 0.02; // Adjust this value to change the precision of the equality check

    const cSin = 1 * Math.sin(clock);
    if (data.head) {
      if (data.isRotatingDown || data.isLookingLeft || data.isLookingRight) {
        const delay = 0.5; // Adjust this value to change the delay

        AnimationStep(
          data,
          [
            new AnimationPropertyStep(
              "rightLegPivot",
              "position",
              "z",
              -0.02 + 0.04 * cSin,
              data.returnSpeed
            ),
            new AnimationPropertyStep(
              "leftLegPivot",
              "rotation",
              "x",
              -0.13 + 0.03 * Math.sin(elapsedRenderTime + delay),
              data.returnSpeed
            ),
            new AnimationPropertyStep(
              "leftLegPivot",
              "rotation",
              "y",
              0 + 0.03 * Math.sin(elapsedRenderTime + delay),
              data.returnSpeed
            ),
            new AnimationPropertyStep(
              "leftLegPivot",
              "position",
              "z",
              0 + 0.03 * Math.sin(elapsedRenderTime + delay),
              data.returnSpeed
            ),
          ],
          clock
        );
      }
      if (data.isRotatingDown) {
        data.isLookingLeft = true;
        AnimationStep(
          data,
          [
            new AnimationPropertyStep(
              "headPivot",
              "rotation",
              "x",
              data.downRotation,
              data.returnSpeed
            ),
            new AnimationPropertyStep(
              "bodyPivot",
              "rotation",
              "x",
              data.bodyDownRotation,
              data.returnSpeed
            ),
            new AnimationPropertyStep(
              "bodyPivot",
              "position",
              "z",
              data.bodyDownRotation,
              data.returnSpeed
            ),
            new AnimationPropertyStep(
              "leftArmPivot",
              "rotation",
              "z",
              data.armRot * -1,
              data.returnSpeed
            ),
            new AnimationPropertyStep(
              "rightArmPivot",
              "rotation",
              "z",
              data.armRot,
              data.returnSpeed
            ),
          ],
          clock
        );

        // If the head is close enough to the down rotation, set the rotation to the down rotation
        if (Math.abs(data.headPivot.rotation.x - data.downRotation) < epsilon) {
          data.headPivot.rotation.x = data.downRotation;
          data.isRotatingDown = false;
        }
      }
      if (data.isLookingLeft) {
        AnimationStep(
          data,
          [
            new AnimationPropertyStep(
              "headPivot",
              "rotation",
              "y",
              data.leftRotation,
              data.returnSpeed*2
            ),
          ],
          clock
        );

        // If the head is close enough to the left rotation, set the rotation to the left rotation
        if (Math.abs(data.headPivot.rotation.y - data.leftRotation) < epsilon) {
          data.headPivot.rotation.y = data.leftRotation;
          data.isLookingLeft = false;
          data.isLookingRight = true;
        }
      } else if (data.isLookingRight) {
        AnimationStep(
          data,
          [
            new AnimationPropertyStep(
              "headPivot",
              "rotation",
              "y",
              data.rightRotation,
              data.returnSpeed*2
            ),
          ],
          clock
        );

        if (Math.abs(data.headPivot.rotation.y - data.rightRotation) < epsilon) {
          data.headPivot.rotation.y = data.rightRotation;
          data.isLookingRight = false;
        }
      } else {
        return AnimationStep(
          data,
          [
            new AnimationPropertyStep(
              "headPivot",
              "rotation",
              "x",
              0,
              resetSpeed
            ),
            new AnimationPropertyStep(
              "headPivot",
              "rotation",
              "y",
              0,
              resetSpeed
            ),
            new AnimationPropertyStep(
              "bodyPivot",
              "rotation",
              "x",
              0,
              resetSpeed
            ),
            new AnimationPropertyStep(
              "bodyPivot",
              "position",
              "z",
              0,
              resetSpeed
            ),
            new AnimationPropertyStep(
              "headPivot",
              "rotation",
              "z",
              0,
              resetSpeed
            ),
            new AnimationPropertyStep(
              "headPivot",
              "rotation",
              "x",
              0,
              resetSpeed
            ),
            new AnimationPropertyStep(
              "leftArmPivot",
              "rotation",
              "z",
              0,
              resetSpeed
            ),
            new AnimationPropertyStep(
              "rightArmPivot",
              "rotation",
              "z",
              0,
              resetSpeed
            ),
            new AnimationPropertyStep(
              "bodyPivot",
              "position",
              "y",
              1.47,
              resetSpeed
            ),
          ],
          clock
        );
      }
      return false;
    }
  }
);
export default NewOutfitBottomAnimation;
