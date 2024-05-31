<script lang="ts">
  import type { OutfitLayer, OutfitPackage } from "$src/data/common";
  import { OUTFIT_TYPE } from "$src/data/consts";
  import {
    RenderFromSnapshot,
    RenderProvider,
    RenderSnapshot,
  } from "$src/data/render";
  import CloudIcon from "$icons/cloud.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";
  import { currentUser } from "$src/data/cache";
  import { FindColorTitle, FindColor } from "$src/helpers/image/colorHelper";
  import OutfitPackageSnapshotRender from "$component/render/OutfitPackageSnapshotRender.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import SocialInfo from "$component/social/SocialInfo/SocialInfo.svelte";

  export let item: OutfitPackage = null;
  export let dense = false;
  export let renderProvider: RenderProvider = null;
  export let multiple = 2;
  export let style = "";

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
    if (multiple > 1) {
      currentLayer = layer;
      if (snapshot) {
        snapshot.texture = layer[item.model].content;
        await RenderFromSnapshot(snapshot);
      }
    }
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
  {style}
  on:click={onClick}
  class="outfit-package-item"
  class:outfit-set={item.type == OUTFIT_TYPE.OUTFIT_SET}
  class:outfit={item.type != OUTFIT_TYPE.OUTFIT_SET}
  class:dense
>
  <!-- {#if item.id == $userSettings.currentSkin?.id}
    <div class="current-flag" title="Current skin">
      <div class="icon-small">{@html LoaderIcon}</div>
    </div>
  {/if} -->
  <div class="render-area">
    <!-- svelte-ignore a11y-missing-attribute -->
    {#if item.layers.length > 0}
      {#if item.presentationConfig.isSnapshot == false}
        <OutfitPackageSnapshotRender bind:snapshot {item} {renderProvider} />
      {:else}
        <img
          src={currentLayer != null ? currentLayer[item.model].content : null}
          style="width: 100%;height:100%"
        />
      {/if}
    {/if}
  </div>
  <div class="data-area">
    <div class="title-row">
      <b class="name">{item.name} </b>
      {#if item.social.isShared && item.publisher.id == $currentUser?.id}
        <div class="share-icon icon-small">{@html CloudIcon}</div>
      {/if}
    </div>
    <div class="title-row">
      <div style="flex:1;">
        <!-- {#if item.publisher.id != $currentUser?.id}
          <Label variant="unique" {dense}>{item.publisher.name}</Label>
        {/if} -->
        <div class="item-social-info">
          {#if item.social.isShared}
            <SocialInfo data={item.social} dense />
          {/if}
        </div>
      </div>
      {#if multiple > 0}
        {#each item.layers
          .slice(0, !isSet ? multiple : 1)
          .filter((x) => x != null && x[item.model].color != null) as layer (layer.id)}
          <span
            class="color-view"
            title={FindColorTitle(layer[item.model].color)}
            on:click|stopPropagation={() => updateRender(layer)}
            style="background-color: {FindColor(layer[item.model].color)};"
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
