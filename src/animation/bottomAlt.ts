import {
  RenderAnimation,
} from "$data/animation";
import {
  AnimationPropertyStep,
  AnimationStep,
  CreateModelAnimationData,
} from "$src/helpers/animationHelper";
const NewOutfitBottomAltAnimation = new RenderAnimation(
  function (scene, keepData = false, modelName) {
    let data: any = CreateModelAnimationData(scene, modelName);
    data.leftLegPivot.rotation.x = -0.13;
    if (keepData) {
      return data;
    } else {
      data.isLookingRight = true;
      data.isLookingLeft = false;
      data.rotationRight = 0.2;
      data.rotationLeft = -0.2;
      data.armRotationRight = -0.2;
      data.armRotationLeft = 0.2;
      data.bodyPositionLeft = 0.15;
      data.bodyPositionRight = -0.15;
      data.headRotationRight = 0.4;
      data.headRotationLeft = -0.4;
      data.headRotationDown = -0.9;
      data.returnSpeed = 0.02;
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName, elapsedRenderTime) {
    const resetSpeed = 0.02; // Adjust this value to change the speed of the reset
    const epsilon = 0.01; // Adjust this value to change the precision of the equality check
    const amplitude = 0.025;
    const elapsedTime = clock;
    const cSin = 1 * Math.sin(clock);
    if (data.head) {
      if (data.isLookingRight) {
        if (
          AnimationStep(
            data,
            [
              new AnimationPropertyStep(
                "leftLegPivot",
                "rotation",
                "z",
                data.rotationRight,
                data.returnSpeed
              ),
              new AnimationPropertyStep(
                "bodyPivot",
                "position",
                "y",
                1.47,
                data.returnSpeed
              ),
              new AnimationPropertyStep(
                "rightLegPivot",
                "rotation",
                "z",
                data.rotationRight,
                data.returnSpeed
              ),
              new AnimationPropertyStep(
                "rightArmPivot",
                "rotation",
                "z",
                data.armRotationRight,
                data.returnSpeed
              ),
              new AnimationPropertyStep(
                "leftArmPivot",
                "rotation",
                "z",
                data.armRotationRight,
                data.returnSpeed
              ),
              new AnimationPropertyStep(
                "bodyPivot",
                "position",
                "x",
                data.bodyPositionRight,
                data.returnSpeed
              ),
              new AnimationPropertyStep(
                "headPivot",
                "rotation",
                "y",
                data.headRotationRight,
                data.returnSpeed
              ),
              new AnimationPropertyStep(
                "headPivot",
                "rotation",
                "x",
                -0.7,
                data.returnSpeed
              ),
            ],
            clock
          )
        ) {
          data.isLookingRight = false;
          data.isLookingLeft = true;
        }
      }
      if (data.isLookingLeft) {
        if (
          AnimationStep(
            data,
            [
              new AnimationPropertyStep(
                "leftLegPivot",
                "rotation",
                "z",
                data.rotationLeft,
                resetSpeed
              ),
              new AnimationPropertyStep(
                "rightLegPivot",
                "rotation",
                "z",
                data.rotationLeft,
                resetSpeed
              ),
              new AnimationPropertyStep(
                "rightArmPivot",
                "rotation",
                "z",
                data.armRotationLeft,
                resetSpeed
              ),
              new AnimationPropertyStep(
                "leftArmPivot",
                "rotation",
                "z",
                data.armRotationLeft,
                resetSpeed
              ),
              new AnimationPropertyStep(
                "bodyPivot",
                "position",
                "x",
                data.bodyPositionLeft,
                resetSpeed
              ),
              new AnimationPropertyStep(
                "headPivot",
                "rotation",
                "y",
                data.headRotationLeft,
                resetSpeed
              ),
            ],
            clock
          )
        ) {
          data.rightLegPivot.rotation.z = data.rotationLeft;
          data.leftLegPivot.rotation.z = data.rotationLeft;
          data.rightArmPivot.rotation.z = data.armRotationLeft;
          data.leftArmPivot.rotation.z = data.armRotationLeft;
          data.bodyPivot.position.x = data.bodyPositionLeft;
          data.headPivot.rotation.y = data.headRotationLeft;
          data.isLookingRight = false;
          data.isLookingLeft = false;
        }
      }
      if (data.isLookingRight == false && data.isLookingLeft == false) {
        if (
          AnimationStep(
            data,
            [
              new AnimationPropertyStep(
                "leftLegPivot",
                "rotation",
                "z",
                0,
                resetSpeed
              ),
              new AnimationPropertyStep(
                "rightLegPivot",
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
                "leftArmPivot",
                "rotation",
                "z",
                0,
                resetSpeed
              ),
              new AnimationPropertyStep(
                "bodyPivot",
                "position",
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
                "headPivot",
                "rotation",
                "x",
                0,
                resetSpeed
              ),
            ],
            clock
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }
);
export default NewOutfitBottomAltAnimation;
