<script lang="ts">
  import * as THREE from "three";
  import { ALEX_MODEL, MODEL_TYPE, STEVE_MODEL } from "$src/data/consts";
  import {
    CameraConfig,
    RenderFromSnapshot,
    RenderProvider,
    RenderSnapshot,
  } from "$src/data/render";
  import { GetCameraConfigForType } from "$src/helpers/render/renderHelper";
  import { onMount } from "svelte";
  import { MergeLayersToImage } from "$src/data/imageMerger";
  import { OutfitPackageRenderConfig } from "$model/render";
  import type { OutfitPackage } from "$src/model/package";

  export let item: OutfitPackage = null;
  export let renderProvider: RenderProvider = null;
  export let cameraOptions: CameraConfig = null;
  export const snapshot: RenderSnapshot = new RenderSnapshot();

  let renderNode: HTMLImageElement;
  let tempNode: HTMLDivElement;

  onMount(async () => {
    if (renderProvider == null || item.layers.length == 0) return;

    snapshot.provider = renderProvider;

    snapshot.node = renderNode;
    snapshot.tempNode = tempNode;
    snapshot.texture = item.layers[0][item.model].content;
    if (
      item.presentationConfig?.isMerged ||
      (item.presentationConfig == null && item.layers.length > 1)
    ) {
      //merge layers
      const config = new OutfitPackageRenderConfig();
      config.model = item.model == MODEL_TYPE.ALEX ? ALEX_MODEL : STEVE_MODEL;
      let mergedLayers = await MergeLayersToImage(
        item.layers.filter((x) => x != null),
        config
      );
      snapshot.texture = mergedLayers;
    }
    snapshot.cameraOptions =
      cameraOptions || GetCameraConfigForType(item.outfitType);
    snapshot.provider.camera = new THREE.OrthographicCamera();
    await RenderFromSnapshot(snapshot);
  });
</script>

<div class="render-area">
  <!-- svelte-ignore a11y-missing-attribute -->
  <img bind:this={renderNode} />
  <div class="temp-render-node" bind:this={tempNode}></div>
</div>

<style lang="scss">
  .render-area {
    width: 100%;
    height: 100%;
    display: flex;
    & > img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    & > .temp-render-node {
      display: none;
    }
  }
</style>
