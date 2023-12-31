<script lang="ts">
  import type { OutfitPackage } from "$src/data/common";
  import { OUTFIT_TYPE } from "$src/data/consts";
  import {
    RenderFromSnapshot,
    RenderProvider,
    RenderSnapshot,
  } from "$src/data/render";
  import CloudIcon from "$icons/cloud.svg?raw";
  import { currentUser } from "$src/data/cache";
  import {
    FindStringInColors,
    FindStringInColorsAsHex,
  } from "$src/helpers/colorHelper";
  import OutfitPackageSnapshotRender from "$lib/render/OutfitPackageSnapshotRender.svelte";
  import { onMount } from "svelte";

  export let item: OutfitPackage = null;
  export let dense = false;
  export let renderProvider: RenderProvider=null;
  export let multiple = 2;

  let aboveLimit = 0;
  let snapshot: RenderSnapshot;
  let isSet = false;

  onMount(async () => {
    isSet = item.type == OUTFIT_TYPE.OUTFIT_SET;
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
    <OutfitPackageSnapshotRender bind:snapshot {item} {renderProvider} />
  </div>
  <div class="data-area">
    <div class="title-row">
      <b class="name">{item.name}</b>
      {#if item.isShared}
        <div class="share-icon icon-small">{@html CloudIcon}</div>
      {/if}
    </div>
    <div class="title-row">
      <div style="flex:1;">
        {#if item.publisher.id != $currentUser?.id}
          <span class="label unique" class:dense>{item.publisher.name}</span>
        {/if}
      </div>
      {#if multiple > 0}
        {#each item.layers
          .slice(0, !isSet ? multiple : 1)
          .filter((x) => x[item.model].color != null) as layer (layer.variantId)}
          <span
            class="color-view"
            title={FindStringInColors(layer[item.model].color)}
            on:click|stopPropagation={() => updateRender(layer)}
            style="background-color: {FindStringInColorsAsHex(
              layer[item.model].color
            )}; margin-left:4px;"
          ></span>
        {/each}
        {#if aboveLimit > 0 && !isSet}
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
