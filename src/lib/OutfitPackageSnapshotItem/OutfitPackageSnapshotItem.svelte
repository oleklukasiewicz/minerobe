<script lang="ts">
  import type { OutfitLayer, OutfitPackage } from "$src/data/common";
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
  import { createEventDispatcher, onMount } from "svelte";
  import SocialInfo from "$lib/SocialInfo/SocialInfo.svelte";

  export let item: OutfitPackage = null;
  export let dense = false;
  export let renderProvider: RenderProvider = null;
  export let multiple = 2;

  const dispatch = createEventDispatcher();
  let aboveLimit = 0;
  let snapshot: RenderSnapshot;
  let currentLayer: OutfitLayer;
  let isSet = false;

  onMount(async () => {
    isSet = item.type == OUTFIT_TYPE.OUTFIT_SET;
    currentLayer = item.layers[0];
  });
  const updateRender = async function (layer) {
    currentLayer = layer;
    snapshot.texture = layer[item.model].content;
    await RenderFromSnapshot(snapshot);
  };

  $: aboveLimit = item.layers.length - multiple;

  const onClick = function () {
    dispatch("select", {
      item,
      layer: currentLayer,
    });
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:click={onClick}
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
      {#if item.isShared && item.publisher.id == $currentUser?.id}
        <div class="share-icon icon-small">{@html CloudIcon}</div>
      {/if}
    </div>
    <div class="title-row">
      <div style="flex:1;">
        <!-- {#if item.publisher.id != $currentUser?.id}
          <Label variant="unique" {dense}>{item.publisher.name}</Label>
        {/if} -->
        <div class="item-social-info">
          {#if item.isShared}
            <SocialInfo data={item.social} dense />
          {/if}
        </div>
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
            )};"
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
