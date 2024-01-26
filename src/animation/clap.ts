import {
  RenderAnimation
} from "$data/animation";
import {
  AnimationPropertyStep,
  AnimationStepManager,
  AnimationStepState,
  CreateModelAnimationData,
} from "$src/helpers/animationHelper";
const ClapAnimation = new RenderAnimation(
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

    if (keepData) {
      return data;
    } else {
      data.clapsCount = 0;
      data.speed = 1;
      data.clapSpeed = 0.11;
      data.initSpeed = 0.02;
      data.resetSpeed = 0.04;
      data.stepsManager = AnimationStepManager(
        data,
        [
          new AnimationStepState(
            "start",
            [
              new AnimationPropertyStep(
                "headPivot",
                "rotation",
                "z",
                0.2,
                0.04
              ),
              new AnimationPropertyStep("headPivot", "rotation", "y", 0, 0.02),
              new AnimationPropertyStep("rightarm", "rotation", "x", 0, 0.02),
              new AnimationPropertyStep("leftarm", "rotation", "x", 0, 0.02),
              new AnimationPropertyStep(
                "rightArmPivot",
                "rotation",
                "x",
                60 * (Math.PI / 180),
               data.initSpeed
              ),
              new AnimationPropertyStep(
                "leftArmPivot",
                "rotation",
                "x",
                60 * (Math.PI / 180),
                data.initSpeed
              ),
              new AnimationPropertyStep(
                "rightArmPivot",
                "rotation",
                "z",
                0.1,
                data.clapSpeed
              ),
              new AnimationPropertyStep(
                "leftArmPivot",
                "rotation",
                "z",
                -0.1,
                data.clapSpeed
              ),
            ],
            () => "clapOut",
            0.05
          ),
          new AnimationStepState(
            "clapIn",
            [
              new AnimationPropertyStep(
                "rightArmPivot",
                "rotation",
                "z",
                -0.1,
                data.clapSpeed
              ),
              new AnimationPropertyStep(
                "leftArmPivot",
                "rotation",
                "z",
                0.1,
                data.clapSpeed
              ),
            ],
            () => "clapOut"
          ),
          new AnimationStepState(
            "clapOut",
            [
              new AnimationPropertyStep(
                "rightArmPivot",
                "rotation",
                "z",
                -0.45,
                data.clapSpeed
              ),
              new AnimationPropertyStep(
                "leftArmPivot",
                "rotation",
                "z",
                0.45,
                data.clapSpeed
              ),
            ],
            () => {
              data.clapsCount++;
              if (data.clapsCount <= 5) {
                return "clapIn";
              }
              return "reset";
            }
          ),
          new AnimationStepState(
            "reset",
            [
              new AnimationPropertyStep(
                "rightArmPivot",
                "rotation",
                "z",
                0,
                data.resetSpeed
              ),
              new AnimationPropertyStep(
                "leftArmPivot",
                "rotation",
                "z",
                0,
                data.resetSpeed
              ),
              new AnimationPropertyStep(
                "rightArmPivot",
                "rotation",
                "x",
                0,
                data.resetSpeed
              ),
              new AnimationPropertyStep(
                "leftArmPivot",
                "rotation",
                "x",
                0,
                data.resetSpeed
              ),
              new AnimationPropertyStep(
                "headPivot",
                "rotation",
                "z",
                0,
                data.resetSpeed
              ),
            ],
            () => null
          ),
        ],
        "start"
      );
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName) {
    return data.stepsManager.run(clock);
  }
);
export default ClapAnimation;
