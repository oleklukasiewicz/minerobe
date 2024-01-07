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
const HandsUpAnimation = new RenderAnimation(
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
      data.deg90 = 160 * (Math.PI / 180);
      data.speed = 0.025;
      data.speedDef = 1;
      data.stepManager = AnimationStepManager(data, [
        new AnimationStepState("start",
        [
          new AnimationPropertyStep("bodyPivot","rotation","x",0.2,data.speed),
          new AnimationPropertyStep("bodyPivot","position","z",0.17,data.speed),
          new AnimationPropertyStep("bodyPivot","position","y",1.45,data.speed),
          new AnimationPropertyStep("leftArmPivot","rotation","x",data.deg90,data.speed),
          new AnimationPropertyStep("rightArmPivot","rotation","x",data.deg90,data.speed),
          new AnimationPropertyStep("leftArmPivot","rotation","z",-0.2,data.speed),
          new AnimationPropertyStep("rightArmPivot","rotation","z",0.2,data.speed),
          new AnimationPropertyStep("headPivot","rotation","x",0.2,data.speed),
          new AnimationPropertyStep("headPivot","rotation","y",0,data.speed),
          new AnimationPropertyStep("headPivot","rotation","z",0,data.speed),
        ],()=>"reset"),
      new AnimationStepState("reset",
      [
        new AnimationPropertyStep("bodyPivot","rotation","x",0,data.speed),
        new AnimationPropertyStep("bodyPivot","position","z",0,data.speed),
        new AnimationPropertyStep("bodyPivot","position","y",1.47,data.speed),
        new AnimationPropertyStep("leftArmPivot","rotation","x",0,data.speed),
        new AnimationPropertyStep("rightArmPivot","rotation","x",0,data.speed),
        new AnimationPropertyStep("leftArmPivot","rotation","z",0,data.speed),
        new AnimationPropertyStep("rightArmPivot","rotation","z",0,data.speed),
        new AnimationPropertyStep("headPivot","rotation","x",0,data.speed),
        new AnimationPropertyStep("headPivot","rotation","y",0,data.speed),
      ],()=>null)],"start");
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName) {
    return data.stepManager.run(clock);
  }
);
export default HandsUpAnimation;
