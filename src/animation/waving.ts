import {
  RenderAnimation,
  lerp,
  lerpOutCubic,
  isPoseReady,
} from "$data/animation";
import {
  AnimationPropertyStep,
  AnimationStepManager,
  AnimationStepState,
  CreateModelAnimationData,
} from "$src/helpers/animationHelper";
const WavingAnimation = new RenderAnimation(
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
      data.waveCount = 0;
      data.waveCountMax = 6;
      data.speed = 0.04;
      data.speedOut = 0.017;
      data.stepsManager = AnimationStepManager(
        data,
        [
          new AnimationStepState("start", [], () => "waveIn"),
          new AnimationStepState(
            "waveIn",
            [
              new AnimationPropertyStep(
                "bodyPivot",
                "rotation",
                "z",
                -0.3,
                data.speed
              ),
              new AnimationPropertyStep(
                "bodyPivot",
                "position",
                "y",
                1.45,
                data.speed
              ),
              new AnimationPropertyStep(
                "bodyPivot",
                "position",
                "x",
                0.2,
                data.speed
              ),
              new AnimationPropertyStep(
                "rightArmPivot",
                "rotation",
                "z",
                0.3,
                data.speed
              ),
              new AnimationPropertyStep(
                "leftArmPivot",
                "rotation",
                "x",
                -0.5,
                data.speed
              ),
              new AnimationPropertyStep(
                "leftArmPivot",
                "rotation",
                "z",
                -2.9,
                data.speed
              ),
              new AnimationPropertyStep(
                "headPivot",
                "rotation",
                "z",
                -0.15,
                data.speed
              ),
            ],
            () => {
              data.waveCount++;
              if (data.waveCount >= data.waveCountMax) {
                return "reset";
              } else {
                return "waveOut";
              }
            },0.05
          ),
          new AnimationStepState(
            "waveOut",
            [
              new AnimationPropertyStep(
                "bodyPivot",
                "rotation",
                "z",
                0,
                data.speed
              ),
              new AnimationPropertyStep(
                "bodyPivot",
                "position",
                "y",
                1.48,
                data.speed
              ),
              new AnimationPropertyStep(
                "bodyPivot",
                "position",
                "x",
                0,
                data.speed
              ),
              new AnimationPropertyStep(
                "rightArmPivot",
                "rotation",
                "z",
                0,
                data.speed
              ),
              new AnimationPropertyStep(
                "leftArmPivot",
                "rotation",
                "z",
                -2,
                data.speed
              ),
              new AnimationPropertyStep(
                "headPivot",
                "rotation",
                "z",
                0.1,
                data.speed
              ),
            ],
            () => "waveIn",
            0.05
          ),
          new AnimationStepState(
            "reset",
            [
              new AnimationPropertyStep(
                "bodyPivot",
                "rotation",
                "z",
                0,
                data.speedOut
              ),
              new AnimationPropertyStep(
                "bodyPivot",
                "position",
                "y",
                1.48,
                data.speedOut
              ),
              new AnimationPropertyStep(
                "bodyPivot",
                "position",
                "x",
                0,
                data.speedOut
              ),
              new AnimationPropertyStep(
                "rightArmPivot",
                "rotation",
                "z",
                0,
                data.speedOut
              ),
              new AnimationPropertyStep(
                "leftArmPivot",
                "rotation",
                "z",
                0,
                data.speedOut
              ),
              new AnimationPropertyStep(
                "headPivot",
                "rotation",
                "z",
                0,
                data.speedOut
              ),
              new AnimationPropertyStep(
                "leftArmPivot",
                "rotation",
                "x",
                0,
                data.speed
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
  function (data, scene, clock, modelName, elapsedRenderTime) {
    return data.stepsManager.run(clock);
  }
);
export default WavingAnimation;
