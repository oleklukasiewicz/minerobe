<script lang="ts">
  import {
    CameraConfig,
    CreateDynamicRender,
    DynamicRenderOptions,
    RenderProvider,
  } from "$src/data/render";
  import * as THREE from "three";
  import { onDestroy, onMount } from "svelte";
  import floorTexture from "$texture/floor.png?url";
  import type { RenderAnimation } from "$src/data/animation";

  export let provider: RenderProvider = null;
  export let defaultAnimation: RenderAnimation = null;
  export let model;
  export let modelName = "";
  export let texture;
  export let renderOptions: DynamicRenderOptions = null;
  export let cameraOptions: CameraConfig = null;
  export const addAnimation: any = async (anim: RenderAnimation) =>
    await dynamicRender?.addAnimation(anim);

  let dynamicRender;
  let renderNode = null;
  onMount(async () => {
    if (provider == null) {
      provider = new RenderProvider();
      provider.renderer = new THREE.WebGLRenderer({
        alpha: true,
      });
      provider.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

      provider.scene = new THREE.Scene();
      provider.scene.position.y = -1;
      provider.textureLoader = new THREE.TextureLoader();
      provider.camera = new THREE.PerspectiveCamera();
    }
    if (renderOptions == null) {
      renderOptions = new DynamicRenderOptions();
      renderOptions.backgroundColor = "black";
      renderOptions.backgroundColorOpacity = 1;
      renderOptions.floorTexture = floorTexture;
      renderOptions.orbitControls = true;
    }
    if (cameraOptions == null) {
      cameraOptions = new CameraConfig();
      cameraOptions.position = new THREE.Vector3(0, 0, -2);
    }
    try {
      dynamicRender = await CreateDynamicRender(
        renderNode,
        provider,
        cameraOptions,
        renderOptions,
      );
      await dynamicRender.setTexture(texture);
      await dynamicRender.setModel(model, modelName);
      await dynamicRender.setRenderNode(renderNode);
      if (defaultAnimation != null) {
        await dynamicRender.addAnimation(defaultAnimation);
      }
      dynamicRender?.startRendering();
    } catch (e) {
      console.error(e);
    }
  });
  onDestroy(() => {
    dynamicRender?.stopRendering();
  });

  $: dynamicRender?.setModel(model, modelName);
  $: dynamicRender?.setTexture(texture);
</script>

<div class="dynamic-render" bind:this={renderNode}></div>

<style lang="scss">
  .dynamic-render {
    width: 100%;
    height: 100%;
  }
</style>
