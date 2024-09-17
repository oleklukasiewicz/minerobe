<script lang="ts">
  import { COLORS, OUTFIT_TYPE } from "$src/data/consts";
  import { RenderProvider, RenderSnapshot } from "$src/data/render";
  import CloudIcon from "$icons/cloud.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";
  import { currentUser } from "$src/data/cache";
  import { ConvertToStringColor } from "$src/helpers/image/colorHelper";
  import OutfitPackageSnapshotRender from "$component/render/OutfitPackageSnapshotRender.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import SocialInfo from "$component/social/SocialInfo/SocialInfo.svelte";
  import type { OutfitLayer, OutfitPackage } from "$src/model/package";
  import ColorBadge from "$lib/components/other/ColorBadge/ColorBadge.svelte";

  import HeartIcon from "$icons/heart.svg?raw";
  import HeartFilledIcon from "$icons/heart-filled.svg?raw";
  import { GetLayerSnapshot } from "$src/api/pack";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";

  export let item: OutfitPackage = null;
  export let dense = false;
  export let renderProvider: RenderProvider = null;
  export let multiple = 2;
  export let style = "";
  export let isCurrentSkin = false;
  export let isLikeable = true;
  export let isLiked = false;
  export let element = null;

  const dispatch = createEventDispatcher();
  let aboveLimit = 0;
  let snapshot: RenderSnapshot;
  let currentLayer: OutfitLayer;
  let isSet = false;
  let isLoading = false;

  onMount(async () => {
    isSet = item.type == OUTFIT_TYPE.OUTFIT_SET;
    currentLayer = item.layers[0];
  });
  const updateRender = async function (layer: OutfitLayer) {
    if (multiple > 1) {
      if (layer.isLoaded == false) {
        isLoading = true;
        layer = await GetLayerSnapshot(layer.id);
        isLoading = false;
      }
      currentLayer = layer;
      if (snapshot) {
        snapshot.texture = layer[item.model].content;
      }
    }
  };

  $: aboveLimit =
    (item.totalLayersCount == null
      ? item.layers.length
      : item.totalLayersCount) - multiple;

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
  bind:this={element}
  {style}
  on:click={onClick}
  class="outfit-package-item"
  class:outfit-set={item.type == OUTFIT_TYPE.OUTFIT_SET}
  class:outfit={item.type != OUTFIT_TYPE.OUTFIT_SET}
  class:dense
>
  {#if isCurrentSkin}
    <div class="current-flag" title="Current skin">
      <div class="icon">{@html LoaderIcon}</div>
    </div>
  {/if}

  <div class="user-flag">
    {#if isLikeable && $currentUser?.id != item.publisher?.id && $currentUser != null}
      <div class="icon-small">
        {#if isLiked}
          {@html HeartFilledIcon}
        {:else}
          {@html HeartIcon}
        {/if}
      </div>
    {/if}
    {#if item.social.isShared && item.publisher.id == $currentUser?.id && dense == false}
      <div class="icon-small">{@html CloudIcon}</div>
    {/if}
  </div>
  <div class="render-area">
    <!-- svelte-ignore a11y-missing-attribute -->
    {#if item.layers.length > 0}
      {#if isLoading}
        <Placeholder />
      {:else if item.presentationConfig.isSnapshot == false}
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
      <div class="name">{item.name}</div>
    </div>
    <div class="data-row">
      <div style="flex:1;">
        <!-- {#if item.publisher.id != $currentUser?.id}
          <Label variant="unique" {dense}>{item.publisher.name}</Label>
        {/if} -->
        <div class="item-social-info">
          {#if item.social.isShared}
            <SocialInfo data={item.social} dense style={"margin-top:3px;"} />
          {/if}
        </div>
      </div>
      {#if multiple > 0}
        <div class="colors">
          {#each item.layers
            .slice(0, !isSet ? multiple : 2)
            .filter((x) => x != null && x.colorName != null) as layer (layer.id)}
            <ColorBadge
              colorName={layer.colorName}
              color={ConvertToStringColor(COLORS[layer.colorName])}
              on:click={() => updateRender(layer)}
            ></ColorBadge>
          {/each}
          {#if aboveLimit > 0 && !isSet}
            <span class="above-limit">
              +{aboveLimit}
            </span>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @import "OutfitPackageSnapshotItem.scss";
</style>
