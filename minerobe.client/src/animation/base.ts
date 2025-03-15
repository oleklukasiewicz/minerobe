import {
  RenderAnimation,
  lerp,
  lerpOutCubic,
  isPoseReady,
} from "$data/animation";
import {
  CreateModelAnimationData,
} from "$src/helpers/render/animationHelper";
const BaseAnimation = new RenderAnimation(
  async function (scene, keepData = false, modelName) {
    const data = await CreateModelAnimationData(scene,modelName);
    return data;
  },
  function (data, scene, clock, modelName, elapsedRenderTime) {
  },
  function () {
    return true;
  }
);
export default BaseAnimation;
