<script lang="ts">
  import type { OutfitLayer, OutfitPackage } from "$src/model/package";
  import { createEventDispatcher } from "svelte";
  import OutfitPackageListItem from "../OutfitPackageListItem/OutfitPackageListItem.svelte";
  import { PACKAGE_TYPE } from "$src/data/consts";
  import { GetLayer } from "$src/api/pack";
  import Resize from "$lib/components/other/Resize/Resize.svelte";

  const dispatch = createEventDispatcher();

  export let items: OutfitPackage[];
  export let baseTexture: OutfitLayer | string = null;
  export let resizable = true;
  export let resizeDebounce = 300;

  const selectOutfit = function (item) {
    dispatch("select", item);
  };
  const fetchLayer = async function (id, item): Promise<OutfitLayer> {
    return await GetLayer(id);
  };

  const onResize = function () {
    items = [...items];
  };
</script>

<div class="outfit-package-list">
  <div class="outfit-package-list-items">
    {#each items as item (item.id)}
      <OutfitPackageListItem
        {item}
        {fetchLayer}
        on:click={() => selectOutfit(item)}
        baseTexture={item.type == PACKAGE_TYPE.OUTFIT_SET ? baseTexture : null}
      />
    {/each}
  </div>
  {#if resizable}
    <Resize debounce={resizeDebounce} on:resize={onResize} />
  {/if}
</div>

<style lang="scss">
  .outfit-package-list {
    .outfit-package-list-items {
      max-width: 100%;
      display: grid;
      gap: 4px;
      flex-wrap: wrap;
      grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
    }
  }
</style>
