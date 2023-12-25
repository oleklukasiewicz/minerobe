<script>
  import SkinRender from "../SkinRender/SkinRender.svelte";
  import { OUTFIT_TYPE } from "$data/consts";
  import {
    GetContextFromBase64,
    GetOutfitType,
  } from "$src/helpers/imageDataHelpers";
  import { onMount } from "svelte";

  export let texture = null;
  export let model = null;
  export let modelName = "";
  export let type = null;
  export let renderer = undefined;
  export let refreshRender = null;

  let camPozY = 0,
    camPozX = 0.05,
    camPozZ = 1.8;
  let sceneRotX = Math.PI / 4;
  let sceneRotY = Math.PI * 0.75;
  let loaded = false;
  onMount(async () => {
    await setCameraPosZ(type);
    loaded = true;
  });
  const setCameraPosZ = async function (type) {
    if (type == null) {
      type = GetOutfitType(await GetContextFromBase64(texture));
    }
    if (type == OUTFIT_TYPE.HAT) {
      camPozY = 0.3;
      camPozZ = 2.2;
      return;
    }
    if (type == OUTFIT_TYPE.TOP) {
      camPozY = -0.1;
      camPozZ = 1.7;
      camPozX = 0.1;
      return;
    }
    if (type == OUTFIT_TYPE.HOODIE) {
      camPozY = 0.1;
      camPozZ = 2;
      camPozX = 0.1;
      return;
    }
    if (type == OUTFIT_TYPE.BOTTOM) {
      camPozY = -0.7;
      camPozZ = 1.2;
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
    if (type == OUTFIT_TYPE.SUIT) {
      camPozY = -0;
      camPozZ = 2.1;
      return;
    }
    if (type == OUTFIT_TYPE.OUTFIT_SET) {
      camPozY = 0;
      camPozZ = 1.7;
      camPozX = 0;
      sceneRotX = 0;
      return;
    }
  };
</script>

<div class="skin-snapshot">
  {#if loaded}
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
  {/if}
</div>

<style lang="scss">
  .skin-snapshot {
    width: 100%;
    height: 100%;
    aspect-ratio: 1;
  }
</style>
