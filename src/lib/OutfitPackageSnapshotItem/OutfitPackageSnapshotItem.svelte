<script lang="ts">
  import * as THREE from "three";
  import type { OutfitPackage } from "$src/data/common";
  import { OUTFIT_TYPE } from "$src/data/consts";
  import {
    RenderFromSnapshot,
    RenderProvider,
    RenderSnapshot,
  } from "$src/data/render";
  import { GetCameraConfigForType } from "$src/helpers/renderHelper";
  import CloudIcon from "$icons/cloud.svg?raw";

  import { onMount } from "svelte";
  import { currentUser } from "$src/data/cache";
  import {
    FindStringInColors,
    FindStringInColorsAsHex,
  } from "$src/helpers/colorHelper";

  export let item: OutfitPackage = null;
  export let dense = false;
  export let renderProvider: RenderProvider;
  export let multiple = 2;

  let aboveLimit = 0;

  let renderNode: HTMLImageElement;
  let tempNode: HTMLDivElement;
  let snapshot: RenderSnapshot;

  onMount(async () => {
    if (renderProvider == null) return;

    snapshot = new RenderSnapshot();
    snapshot.provider = renderProvider;
    snapshot.provider.camera = new THREE.OrthographicCamera();

    snapshot.node = renderNode;
    snapshot.tempNode = tempNode;
    snapshot.texture = item.layers[0][item.model].content;
    snapshot.cameraOptions = GetCameraConfigForType(
      item.type != OUTFIT_TYPE.OUTFIT_SET ? item.outfitType : item.type
    );
    await RenderFromSnapshot(snapshot);
  });

  const updateRender = async function (layer) {
    snapshot.texture = layer[item.model].content;
    await RenderFromSnapshot(snapshot);
  };

  $: aboveLimit = item.layers.length - multiple;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:click
  class="outfit-package-item"
  class:outfit-set={item.type == OUTFIT_TYPE.OUTFIT_SET}
  class:outfit={item.type != OUTFIT_TYPE.OUTFIT_SET}
  class:dense
>
  <div class="render-area">
    <!-- svelte-ignore a11y-missing-attribute -->
    <img bind:this={renderNode} />
    <div class="temp-render-node" bind:this={tempNode}></div>
  </div>
  <div class="data-area">
    <div class="title-row">
      <b class="name">{item.name}</b>
      <div class="share-icon icon-small">{@html CloudIcon}</div>
    </div>
    <div class="title-row">
      {#if item.publisher.id != $currentUser.id}
        <div style="flex:1;">
          <span class="label unique" class:dense>{item.publisher.name}</span>
        </div>
      {/if}
      {#if multiple > 0}
        {#each item.layers
          .slice(0, multiple)
          .filter((x) => x[item.model].color != null) as layer (layer.variantId)}
          <span
            class="color-view"
            title={FindStringInColors(layer[item.model].color)}
            on:click={() => updateRender(layer)}
            style="background-color: {FindStringInColorsAsHex(
              layer[item.model].color
            )}; margin-left:4px;"
          ></span>
        {/each}
        {#if aboveLimit > 0}
          <span class="above-limit" style="margin-left:4px;">
            +{aboveLimit}
          </span>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @import "OutfitPackageSnapshotItem.scss";
</style>
