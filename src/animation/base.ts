import {
  RenderAnimation,
  lerp,
  lerpOutCubic,
  isPoseReady,
} from "$data/animation";
import {
  CreateModelAnimationData,
} from "$src/helpers/animationHelper";
const BaseAnimation = new RenderAnimation(
  function (scene, keepData = false, modelName) {
    const data = CreateModelAnimationData(scene,modelName);
    return data;
  },
  function (data, scene, clock, modelName, elapsedRenderTime) {
  },
  function () {
    return true;
  }
);
export default BaseAnimation;
