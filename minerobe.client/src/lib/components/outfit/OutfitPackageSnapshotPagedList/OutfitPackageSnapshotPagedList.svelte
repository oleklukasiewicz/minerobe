<script lang="ts">
  import * as THREE from "three";
  import OutfitPackageSnapshotItem from "$component/outfit/OutfitPackageSnapshotItem/OutfitPackageSnapshotItem.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import IntersectionObserver from "svelte-intersection-observer";
  import { MODEL_TYPE, PACKAGE_TYPE } from "$src/data/consts";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import type { OutfitLayer, OutfitPackage } from "$src/model/package";
  import type { PagedResponse } from "$src/model/base";
  import { CreateDefaultRenderProvider } from "$src/data/render";
  import MenuItemSeparator from "$lib/components/base/MenuItemSeparator/MenuItemSeparator.svelte";

  export let paged: PagedResponse<any>;
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
  export let pageSize = 48;
  export let filters: any = {};
  export let loadMethod = function (itemCount, page, filters): any[] {
    return [];
  };

  const dispatch = createEventDispatcher();

  let steveListProvider = null;
  let alexListProvider = null;
  let lastItem = null;

  onMount(async () => {
    if (renderer == null) {
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    }

    const providers = await CreateDefaultRenderProvider(renderer);
    steveListProvider = providers.steve;
    alexListProvider = providers.alex;
  });

  const normalizeItem = function (item, index) {
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
    paged.items = [...paged.items];
  };
  const onObserve = function (elem) {
    if (paged.items.length < paged.total)
      paged.items.push(...loadMethod(pageSize, paged.page + 1, filters));
  };

  $: reRenderList(baseTexture);
</script>

<div
  class="outfit-package-list"
  class:no-grid={paged.items.length == 0 && loading == false}
  class:dense
  style="grid-template-columns: repeat({fillMethod}, minmax({minItemWidth}, {maxItemWidth}));"
>
  {#if !loading && steveListProvider && alexListProvider}
    {#if paged.items.length > 0}
      {#each paged.items as item, index}
        {#if index == paged.items.length - 1 && index > 0 && loading == false}
          <IntersectionObserver once element={lastItem} on:observe={onObserve}>
            <OutfitPackageSnapshotItem
              bind:element={lastItem}
              on:select={selectRenderedOutfit}
              {isLikeable}
              isLiked={item.isInWardrobe}
              isCurrentSkin={currentSkinId == item.id}
              multiple={item.type == PACKAGE_TYPE.OUTFIT_SET ? 1 : 2}
              item={normalizeItem(item, index)}
              {dense}
              renderProvider={item.model == MODEL_TYPE.STEVE
                ? steveListProvider
                : alexListProvider}
            />
          </IntersectionObserver>
        {:else}
          <OutfitPackageSnapshotItem
            on:select={selectRenderedOutfit}
            {isLikeable}
            isLiked={item.isInWardrobe}
            isCurrentSkin={currentSkinId == item.id}
            multiple={item.type == PACKAGE_TYPE.OUTFIT_SET ? 1 : 2}
            item={normalizeItem(item, index)}
            {dense}
            renderProvider={item.model == MODEL_TYPE.STEVE
              ? steveListProvider
              : alexListProvider}
          />
        {/if}
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
