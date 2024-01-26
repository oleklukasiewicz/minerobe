import {
  RenderAnimation
} from "$data/animation";
import {
  AnimationPropertyStep,
  AnimationStep,
  CreateModelAnimationData,
} from "$src/helpers/animationHelper";
const NewOutfitBottomAlt2Animation = new RenderAnimation(
  function (scene, keepData = false, modelName) {
    let data: any = CreateModelAnimationData(scene, modelName);
    data.rightLegPivot.parent.remove(data.rightLegPivot);
    data.leftLegPivot.parent.remove(data.leftLegPivot);
    //add to scene
    scene.add(data.rightLegPivot);
    scene.add(data.leftLegPivot);
    data.rightLegPivot.position.set(0.125, 0.75, 0);
    data.leftLegPivot.position.set(-0.125, 0.75, 0);
    data.leftLegPivot.rotation.x = -0.1;
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
    const rotSpeed = 0.03;
    if (data.head) {
      if (data.isRotatingDown) {
        data.isLookingLeft = true;

        // If the head is close enough to the down rotation, set the rotation to the down rotation
        if (
          AnimationStep(
            data,
            [
              new AnimationPropertyStep(
                "headPivot",
                "rotation",
                "x",
                data.downRotation,
                resetSpeed
              ),
              new AnimationPropertyStep(
                "leftArmPivot",
                "rotation",
                "z",
                data.armRot * -1,
                resetSpeed
              ),
              new AnimationPropertyStep(
                "rightArmPivot",
                "rotation",
                "z",
                data.armRot,
                resetSpeed
              ),
            ],
            clock
          )
        ) {
          data.isRotatingDown = false;
        }
      }
      if (data.isLookingLeft) {
        if (
          AnimationStep(
            data,
            [
              new AnimationPropertyStep(
                "headPivot",
                "rotation",
                "y",
                data.rightRotation,
                resetSpeed
              ),
              new AnimationPropertyStep(
                "rightLegPivot",
                "rotation",
                "x",
                1,
                resetSpeed
              ),
              new AnimationPropertyStep(
                "rightLegPivot",
                "rotation",
                "y",
                data.leftRotation,
                rotSpeed
              ),
            ],
            clock
          )
        ) {
          data.isLookingLeft = false;
          data.isLookingRight = true;
        }
      } else if (data.isLookingRight) {
        if (
          AnimationStep(
            data,
            [
              new AnimationPropertyStep(
                "rightLegPivot",
                "rotation",
                "y",
                data.leftRotation * -1,
                rotSpeed
              ),
            ],
            clock
          )
        ) {
          data.isLookingRight = false;
        }
      } else {
        if (
          AnimationStep(
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
                "bodyPivot",
                "rotation",
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
                "y",
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
                "rightLegPivot",
                "rotation",
                "x",
                0,
                resetSpeed
              ),
              new AnimationPropertyStep(
                "rightLegPivot",
                "rotation",
                "y",
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
            ],
            clock
          )
        ) {
          return true;
        }
        return false;
      }
    }
  }
);
export default NewOutfitBottomAlt2Animation;
