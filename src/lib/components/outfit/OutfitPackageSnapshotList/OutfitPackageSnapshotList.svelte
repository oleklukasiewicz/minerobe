<script lang="ts">
  import * as THREE from "three";
  import OutfitPackageSnapshotItem from "$component/outfit/OutfitPackageSnapshotItem/OutfitPackageSnapshotItem.svelte";
  import { FileData, OutfitLayer, type OutfitPackage } from "$src/data/common";
  import { createEventDispatcher, onMount } from "svelte";
  import { CreateDefaultRenderProvider } from "$src/data/render";
  import { MODEL_TYPE, PACKAGE_TYPE } from "$src/data/consts";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";

  export let items: OutfitPackage[] = [];
  export let renderer = null;
  export let dense = true;
  export let loading = false;
  export let minItemWidth = "135px";
  export let fillMethod = "auto-fit";
  export let maxItemWidth = "1fr";
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
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    }

    const providers = await CreateDefaultRenderProvider(renderer);
    steveListProvider = providers.steve;
    alexListProvider = providers.alex;
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
  style="grid-template-columns: repeat({fillMethod}, minmax({minItemWidth}, {maxItemWidth}));"
>
  {#if !loading && steveListProvider && alexListProvider}
    {#each normalizedItems as item (item.id + item.layers[0]?.variantId)}
      <OutfitPackageSnapshotItem
        on:select={selectRenderedOutfit}
        multiple={item.type == PACKAGE_TYPE.OUTFIT_SET ? 1 : 2}
        {item}
        {dense}
        renderProvider={item.model == MODEL_TYPE.STEVE
          ? steveListProvider
          : alexListProvider}
      />
    {/each}
  {:else}
    {#each Array(10) as _}
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
  }
</style>
