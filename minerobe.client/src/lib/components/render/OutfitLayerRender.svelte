<script lang="ts">
  import * as THREE from "three";
  import {
    CreateDefaultRenderProvider,
    RenderFromSnapshot,
    RenderProvider,
    RenderSnapshot,
  } from "$src/data/render";
  import { GetCameraConfigForType } from "$src/helpers/render/renderHelper";
  import { onMount } from "svelte";
  import { defaultRenderer } from "$src/data/cache";
  import type { OutfitLayer } from "$src/model/package";

  export let item: OutfitLayer = null;
  export let modelName = "steve";
  export let renderProvider: RenderProvider = null;
  export const snapshot: RenderSnapshot = new RenderSnapshot();

  let renderNode: HTMLImageElement;
  let tempNode: HTMLDivElement;

  onMount(async () => {
    if (renderProvider == null) {
      const tempProvider = await CreateDefaultRenderProvider($defaultRenderer);
      renderProvider = tempProvider[modelName];
    }
    snapshot.provider = renderProvider;

    snapshot.node = renderNode;
    snapshot.tempNode = tempNode;
    updateSnapshot(item);
  });
  const updateSnapshot = async (model) => {
    snapshot.provider = renderProvider;
    snapshot.texture = item[modelName].content;
    snapshot.cameraOptions = GetCameraConfigForType(item.outfitType);
    snapshot.provider.camera = new THREE.OrthographicCamera();
    if (snapshot.texture == null || snapshot.node == null) return;
    await RenderFromSnapshot(snapshot);
  };
  $: updateSnapshot(item);
  $: updateSnapshot(renderProvider);
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
