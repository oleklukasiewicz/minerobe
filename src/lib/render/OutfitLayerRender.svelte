<script lang="ts">
  import * as THREE from "three";
  import type { OutfitLayer } from "$src/data/common";
  import {
    RenderFromSnapshot,
    RenderProvider,
    RenderSnapshot,
  } from "$src/data/render";
  import { GetCameraConfigForType } from "$src/helpers/renderHelper";
  import { onMount } from "svelte";

  export let item: OutfitLayer = null;
  export let modelName = "steve";
  export let renderProvider: RenderProvider = null;
  export const snapshot: RenderSnapshot = new RenderSnapshot();

  let renderNode: HTMLImageElement;
  let tempNode: HTMLDivElement;

  onMount(async () => {
    if (renderProvider == null) return;
    snapshot.provider = renderProvider;
    snapshot.provider.camera = new THREE.OrthographicCamera();

    snapshot.node = renderNode;
    snapshot.tempNode = tempNode;
    snapshot.texture = item[modelName].content;
    snapshot.cameraOptions = GetCameraConfigForType(item[modelName].type);
    if(snapshot.texture == null) return;
    await RenderFromSnapshot(snapshot);
  });
  const updateSnapshot = async (model) => {
    snapshot.provider = renderProvider;
    snapshot.texture = item[modelName].content;
    snapshot.provider.camera = new THREE.OrthographicCamera();
    snapshot.cameraOptions = GetCameraConfigForType(item[modelName].type);
    if(snapshot.texture == null) return;
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
