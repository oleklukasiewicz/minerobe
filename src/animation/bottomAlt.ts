import {
  RenderAnimation,
  lerp,
  lerpOutCubic,
  isPoseReady,
  isNextStepReady,
} from "$data/animation";
import { MODEL_TYPE } from "$data/consts";
import { CreateModelAnimationData, RemoveModelAnimationData } from "$src/helpers/animationHelper";
const NewOutfitBottomAltAnimation = new RenderAnimation(
  function (scene, keepData = false, modelName) {
    let data: any = CreateModelAnimationData(scene);

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
        data.leftLegPivot.rotation.z = lerpOutCubic(
          clock,
          data.leftLegPivot.rotation.z,
          data.rotationRight,
          resetSpeed
        );
        data.rightLegPivot.rotation.z = lerpOutCubic(
          clock,
          data.rightLegPivot.rotation.z,
          data.rotationRight,
          resetSpeed
        );
        data.rightArmPivot.rotation.z = lerpOutCubic(
          clock,
          data.rightArmPivot.rotation.z,
          data.armRotationRight,
          resetSpeed
        );
        data.leftArmPivot.rotation.z = lerpOutCubic(
          clock,
          data.leftArmPivot.rotation.z,
          data.armRotationRight,
          resetSpeed
        );
          data.bodyPivot.position.x = lerpOutCubic(
            clock,
            data.bodyPivot.position.x,
            data.bodyPositionRight,
            resetSpeed
          );
          data.headPivot.rotation.y = lerpOutCubic(
            clock,
            data.headPivot.rotation.y,
            data.headRotationRight,
            resetSpeed
          );
          data.headPivot.rotation.x = lerpOutCubic(
            clock,
            data.headPivot.rotation.x,
            data.headRotationDown,
            resetSpeed
          );
        if (
          isNextStepReady(
            [
              {
                value: data.leftLegPivot.rotation.z,
                target: data.rotationRight,
              },
              {
                value: data.rightLegPivot.rotation.z,
                target: data.rotationRight,
              },
              {
                value: data.rightArmPivot.rotation.z,
                target: data.armRotationRight,
              },
              {
                value: data.leftArmPivot.rotation.z,
                target: data.armRotationRight,
              },
              {
                value: data.bodyPivot.position.x,
                target: data.bodyPositionRight,
              },
              {
                value: data.headPivot.rotation.y,
                target: data.headRotationRight,
              },
              {
                value: data.headPivot.rotation.x,
                target: data.headRotationDown,
              },
            ],epsilon
          )
        ) {
          data.rightLegPivot.rotation.z = data.rotationRight;
          data.leftLegPivot.rotation.z = data.rotationRight;
          data.rightArmPivot.rotation.z = data.armRotationRight;
          data.leftArmPivot.rotation.z = data.armRotationRight;
          data.bodyPivot.position.x = data.bodyPositionRight;
          data.headPivot.rotation.y = data.headRotationRight;
          data.headPivot.rotation.x = data.headRotationDown;
          data.isLookingRight = false;
          data.isLookingLeft = true;
        }
      }
      if(data.isLookingLeft){
        data.leftLegPivot.rotation.z = lerpOutCubic(
          clock,
          data.leftLegPivot.rotation.z,
          data.rotationLeft,
          resetSpeed
        );
        data.rightLegPivot.rotation.z = lerpOutCubic(
          clock,
          data.rightLegPivot.rotation.z,
          data.rotationLeft,
          resetSpeed
        );
        data.rightArmPivot.rotation.z = lerpOutCubic(
          clock,
          data.rightArmPivot.rotation.z,
          data.armRotationLeft,
          resetSpeed
        );
        data.leftArmPivot.rotation.z = lerpOutCubic(
          clock,
          data.leftArmPivot.rotation.z,
          data.armRotationLeft,
          resetSpeed
        );
        data.bodyPivot.position.x = lerpOutCubic(
          clock,
          data.bodyPivot.position.x,
          data.bodyPositionLeft,
          resetSpeed
        );
        data.headPivot.rotation.y = lerpOutCubic(
          clock,
          data.headPivot.rotation.y,
          data.headRotationLeft,
          resetSpeed
        );
        if (
          isNextStepReady(
            [
              {
                value: data.leftLegPivot.rotation.z,
                target: data.rotationLeft,
              },
              {
                value: data.rightLegPivot.rotation.z,
                target: data.rotationLeft1,
              },
              {
                value: data.rightArmPivot.rotation.z,
                target: data.armRotationLeft,
              },
              {
                value: data.leftArmPivot.rotation.z,
                target: data.armRotationLeft,
              },
              {
                value: data.bodyPivot.position.x,
                target: data.bodyPositionLeft,
              },
              {
                value: data.headPivot.rotation.y,
                target: data.headRotationLeft,
              },
            ],epsilon
          )
        ) {
          data.rightLegPivot.rotation.z =data.rotationLeft;
          data.leftLegPivot.rotation.z = data.rotationLeft;
          data.rightArmPivot.rotation.z = data.armRotationLeft;
          data.leftArmPivot.rotation.z = data.armRotationLeft;
          data.bodyPivot.position.x = data.bodyPositionLeft;
          data.headPivot.rotation.y = data.headRotationLeft;
          data.isLookingRight = false;
          data.isLookingLeft = false;
        }
      }
      if(data.isLookingRight == false && data.isLookingLeft == false){
        data.leftLegPivot.rotation.z = lerpOutCubic(
          clock,
          data.leftLegPivot.rotation.z,
          0,
          resetSpeed
        );
        data.rightLegPivot.rotation.z = lerpOutCubic(
          clock,
          data.rightLegPivot.rotation.z,
          0,
          resetSpeed
        );
        data.rightArmPivot.rotation.z = lerpOutCubic(
          clock,
          data.rightArmPivot.rotation.z,
          0,
          resetSpeed
        );
        data.leftArmPivot.rotation.z = lerpOutCubic(
          clock,
          data.leftArmPivot.rotation.z,
          0,
          resetSpeed
        );
        data.bodyPivot.position.x = lerpOutCubic(
          clock,
          data.bodyPivot.position.x,
          0,
          resetSpeed
        );
        data.headPivot.rotation.y = lerpOutCubic(
          clock,
          data.headPivot.rotation.y,
          0,
          resetSpeed
        );
        data.headPivot.rotation.x = lerpOutCubic(
          clock,
          data.headPivot.rotation.x,
          0,
          resetSpeed
        );
        if( isNextStepReady(
          [{
            value: data.leftLegPivot.rotation.z,
            target: 0,
          },
          {
            value: data.rightLegPivot.rotation.z,
            target: 0,
          },
          {
            value: data.rightArmPivot.rotation.z,
            target: 0,
          },
          {
            value: data.leftArmPivot.rotation.z,
            target: 0,
          },
          {
            value: data.bodyPivot.position.x,
            target: 0,
          },
          {
            value: data.headPivot.rotation.y,
            target: 0,
          },
          {
            value: data.headPivot.rotation.x,
            target: 0,
          }],epsilon
        ))
        {
          RemoveModelAnimationData(data);
          return true;
        }
      }
    }
    return false;
  },
);
export default NewOutfitBottomAltAnimation;
