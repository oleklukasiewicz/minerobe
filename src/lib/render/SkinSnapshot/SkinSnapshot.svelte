<script>
  import SkinRender from "../SkinRender/SkinRender.svelte";
  import { OUTFIT_TYPE } from "$data/consts";

  export let texture = null;
  export let model = null;
  export let modelName = "";
  export let type = OUTFIT_TYPE.DEFAULT;
  export let renderer = undefined;
  export let refreshRender = undefined;

  let camPozY = 0.1,
    camPozX = 0,
    camPozZ = 1.8;
  let sceneRotX = Math.PI / 4;
  let sceneRotY = Math.PI * 0.75;
  const setCameraPosZ = function (type) {
    if (type == OUTFIT_TYPE.HAT) {
      camPozY = 0.2;
      camPozZ = 2;
      return;
    }
    if (type == OUTFIT_TYPE.TOP || type == OUTFIT_TYPE.HOODIE) {
      camPozY = -0.1;
      camPozZ = 1.7;
      return;
    }
    if (type == OUTFIT_TYPE.BOTTOM) {
      camPozY = -0.7;
      camPozZ = 1;
      return;
    }
    if (type == OUTFIT_TYPE.SHOES) {
      camPozY = -1;
      camPozZ = 0.7;
      return;
    }
    if (type == OUTFIT_TYPE.DEFAULT) {
      camPozY = 0.1;
      camPozZ = 1.8;
      return;
    }
    if (type == OUTFIT_TYPE.OUTFIT_SET) {
      camPozY = 0;
      camPozZ = 1.7;
      camPozX = 0;
      sceneRotX=0;
      return;
    }
  };
  setCameraPosZ(type);
</script>

<div>
  <SkinRender
    {texture}
    {model}
    bind:refreshRender
    {sceneRotY}
    {sceneRotX}
    cameraPosZ={camPozZ}
    cameraPosY={camPozY}
    cameraPosX={camPozX}
    {modelName}
    orbitControlsEnabled={false}
    backgroundColorOpacity={0}
    renderFloor={false}
    {renderer}
    onlyRenderSnapshot={true}
  />
</div>
