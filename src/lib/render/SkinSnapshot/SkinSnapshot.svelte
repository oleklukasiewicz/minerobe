<script>
  import SkinRender from "../SkinRender/SkinRender.svelte";
  import { OUTFIT_TYPE } from "$src/data/common";

  export let texture = null;
  export let model = null;
  export let type = OUTFIT_TYPE.DEFAULT;
  export let renderer = undefined;
  export let refreshRender = undefined;

  let camPozY = 0.1,
    camPozZ = 1.8;
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
  };
  $: setCameraPosZ(type);
</script>

<div>
  <SkinRender
    {texture}
    {model}
    bind:refreshRender={refreshRender}
    sceneRotY={Math.PI * 0.75}
    sceneRotX={Math.PI / 4}
    cameraPosZ={camPozZ}
    cameraPosY={camPozY}
    cameraPosX={0.1}
    orbitControlsEnabled={false}
    backgroundColorOpacity={0}
    renderFloor={false}
    {renderer}
    onlyRenderSnapshot={true}
  />
</div>
