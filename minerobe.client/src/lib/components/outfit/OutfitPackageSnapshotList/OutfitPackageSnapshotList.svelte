<script lang="ts">
  import * as THREE from "three";
  import OutfitPackageSnapshotItem from "$component/outfit/OutfitPackageSnapshotItem/OutfitPackageSnapshotItem.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import { CreateDefaultRenderProvider } from "$src/data/render";
  import { MODEL_TYPE, PACKAGE_TYPE } from "$src/data/consts";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import type { OutfitLayer, OutfitPackage } from "$src/model/package";

  export let items: OutfitPackage[] = [];
  export let renderer = null;
  export let dense = true;
  export let loading = false;
  export let minItemWidth = "135px";
  export let fillMethod = "auto-fit";
  export let maxItemWidth = "1fr";
  export let withBaseTexture = false;
  export let baseTexture: OutfitLayer = null;
  export let placeholderCount = 48;
  export let currentSkinId = null;
  export let isLikeable = false;

  const dispatch = createEventDispatcher();

  let steveListProvider = null;
  let alexListProvider = null;

  onMount(async () => {
    if (renderer == null) {
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    }

    const providers = await CreateDefaultRenderProvider(renderer);
    steveListProvider = providers.steve;
    alexListProvider = providers.alex;
  });

  const normalizeItem = function (item) {
    let temp = structuredClone(item);
    if (
      temp.type == PACKAGE_TYPE.OUTFIT_SET &&
      withBaseTexture &&
      baseTexture &&
      temp.layers.length > 0
    ) {
      temp.layers.unshift(baseTexture);
    }
    return temp as OutfitPackage;
  };

  const selectOutfit = function (item) {
    dispatch("select", item);
  };
  const selectRenderedOutfit = function (e) {
    if (
      e.detail.item.type == PACKAGE_TYPE.OUTFIT_SET &&
      withBaseTexture &&
      baseTexture
    ) {
      e.detail.item.layers.shift();
      e.detail.layer = e.detail.item.layers[0];
    }
    dispatch("innerselect", e.detail);
    selectOutfit(e.detail.item);
  };

  const reRenderList = function (val) {
    items = [ ...items ];
  };
  $: reRenderList(baseTexture);
</script>

<div
  class="outfit-package-list"
  class:no-grid={items.length == 0 && loading == false}
  class:dense
  style="grid-template-columns: repeat({fillMethod}, minmax({minItemWidth}, {maxItemWidth}));"
>
  {#if !loading && steveListProvider && alexListProvider}
    {#if items.length > 0}
      {#each items as item}
        <OutfitPackageSnapshotItem
          on:select={selectRenderedOutfit}
          isLikeable={isLikeable}
          isLiked={item.isInWardrobe}
          isCurrentSkin={currentSkinId == item.id}
          multiple={item.type == PACKAGE_TYPE.OUTFIT_SET ? 1 : 2}
          item={normalizeItem(item)}
          {dense}
          renderProvider={item.model == MODEL_TYPE.STEVE
            ? steveListProvider
            : alexListProvider}
        />
      {/each}
    {:else}
      <h3 style="width:100%;text-align:center;"><div>No items</div></h3>
    {/if}
  {:else}
    {#each Array(placeholderCount) as _}
      <Placeholder style="aspect-ratio:5/8;height:100%" />
    {/each}
  {/if}
</div>

<style lang="scss">
  .outfit-package-list {
    display: grid;
    gap: 4px;
    max-width: 100%;
    &.dense {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
    &.no-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
  }
</style>
