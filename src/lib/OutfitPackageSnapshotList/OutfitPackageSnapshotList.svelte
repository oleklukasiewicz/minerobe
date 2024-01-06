<script lang="ts">
  import * as THREE from "three";
  import OutfitPackageSnapshotItem from "$lib/OutfitPackageSnapshotItem/OutfitPackageSnapshotItem.svelte";
  import { FileData, OutfitLayer, type OutfitPackage } from "$src/data/common";
  import { createEventDispatcher, onMount } from "svelte";
  import { CreateDefaultRenderProvider } from "$src/data/render";
  import { MODEL_TYPE, PACKAGE_TYPE } from "$src/data/consts";

  export let items: OutfitPackage[] = [];
  export let renderer = null;
  export let dense = true;
  export let ready = false;
  export let minItemWidth = 175;
  export let withBaseTexture = false;
  export let baseTexture = null;

  const dispatch = createEventDispatcher();

  let steveListProvider = null;
  let alexListProvider = null;
  let normalizedItems = [];

  onMount(async () => {
    if (renderer == null) {
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.shadowMap.enabled = true;
      renderer.outputEncoding = 1;
    }

    const providers = await CreateDefaultRenderProvider(renderer);
    steveListProvider = providers.steve;
    alexListProvider = providers.alex;

    ready = true;
  });

  const normalizeItems = async function (itemsToNormalize) {
    for (let i = 0; i < itemsToNormalize.length; i++) {
      let item = itemsToNormalize[i];
      if (
        item.type == PACKAGE_TYPE.OUTFIT_SET &&
        withBaseTexture &&
        baseTexture &&
        baseTexture.length > 0
      ) {
        item.layers.push(
          new OutfitLayer(
            "base",
            new FileData("base", baseTexture, ""),
            new FileData("base", baseTexture, ""),
            null,
            null,
            null
          )
        );
      }
    }
    normalizedItems = itemsToNormalize;
  };

  const selectOutfit = function (item) {
    dispatch("select", item);
  };
  const selectRenderedOutfit = function (e) {
    dispatch("innerselect", e.detail);
    selectOutfit(e.detail.item);
  };

  $: normalizeItems(items);
</script>

<div
  class="outfit-package-list"
  class:dense
  style="grid-template-columns: repeat(auto-fit, minmax({minItemWidth}px, 1fr));"
>
  {#if ready}
    {#each normalizedItems as item (item.id + item.layers[0]?.variantId)}
      <OutfitPackageSnapshotItem
        on:select={selectRenderedOutfit}
        {item}
        {dense}
        renderProvider={item.model == MODEL_TYPE.STEVE
          ? steveListProvider
          : alexListProvider}
      />
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
  }
</style>
