import { RenderAnimation } from "$data/animation";
import {
  AnimationPropertyStep,
  AnimationStep,
  CreateModelAnimationData,
} from "$src/helpers/render/animationHelper";
const DefaultAnimation = new RenderAnimation(
  function (scene, keepData = false, modelName) {
    let data: any = CreateModelAnimationData(scene, modelName);
    //unpin legs from body
    data.rightLegPivot.parent.remove(data.rightLegPivot);
    data.leftLegPivot.parent.remove(data.leftLegPivot);
    //add to scene
    scene.add(data.rightLegPivot);
    scene.add(data.leftLegPivot);
    data.rightLegPivot.position.set(0.125, 0.75, 0);
    data.leftLegPivot.position.set(-0.125, 0.75, 0);
    data.leftLegPivot.rotation.x = -0.1;

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
  function (data, scene, clock, modelName, elapsedRenderTime) {
    const elapsedTime = clock;
    const amplitude = 0.025;
    const cSin = Math.sin(elapsedRenderTime);
    AnimationStep(
      data,
      [
        new AnimationPropertyStep(
          "rightArmPivot",
          "rotation",
          "z",
          0.06 + 0.06 * cSin,
          data.returnSpeed
        ),
        new AnimationPropertyStep(
          "leftArmPivot",
          "rotation",
          "z",
          -0.06 + -0.06 * cSin,
          data.returnSpeed
        ),
      ],

      clock
    );
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
      data.headPivot.rotation.y = data.currentRotation;

      data.bodyRotationDelay = (data.bodyRotationDelay || 0) + elapsedTime;
      if (data.bodyRotationDelay > 0.07) {
        // Adjust 1 to change the delay duration
        data.bodyRotationTarget = data.currentRotation / 3; // Set a new target rotation for the body
        data.bodyRotationDelay = 0; // Reset the delay
      }

      // Interpolate between the current body rotation and the target rotation using an easing function
      const delay = 0.5; // Adjust this value to change the delay
      AnimationStep(
        data,
        [
          new AnimationPropertyStep(
            "bodyPivot",
            "rotation",
            "y",
            data.bodyRotationTarget - data.bodyPivot.rotation.y,
            data.returnSpeed
          ),
          new AnimationPropertyStep(
            "bodyPivot",
            "position",
            "y",
            1.47 + amplitude * Math.sin(elapsedRenderTime),
            data.returnSpeed
          ),
          new AnimationPropertyStep(
            "cape",
            "rotation",
            "x",
            -0.1 + amplitude * Math.sin(elapsedRenderTime) * 2,
            data.returnSpeed
          ),
          new AnimationPropertyStep(
            "headPivot",
            "rotation",
            "x",
            -0.1 + 0.07 * cSin,
            data.returnSpeed
          ),
          new AnimationPropertyStep(
            "rightLegPivot",
            "rotation",
            "x",
            0 + 0.06 * cSin,
            data.returnSpeed
          ),
          new AnimationPropertyStep(
            "rightLegPivot",
            "rotation",
            "y",
            -0.02 + 0.04 * cSin,
            data.returnSpeed
          ),
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
            -0.15 + 0.03 * Math.sin(elapsedRenderTime + delay),
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
  },
  function (data, scene, clock, modelName) {
    const resetSpeed = 0.03;
    return AnimationStep(
      data,
      [
        new AnimationPropertyStep("headPivot", "rotation", "z", 0, resetSpeed),
        new AnimationPropertyStep("headPivot", "rotation", "y", 0, resetSpeed),
        new AnimationPropertyStep("headPivot", "rotation", "x", 0, resetSpeed),
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
      ],
      clock,
      0.05
    );
  }
);
export default DefaultAnimation;
