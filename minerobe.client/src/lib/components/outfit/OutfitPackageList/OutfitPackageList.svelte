<script lang="ts">
  import type { OutfitLayer, OutfitPackage } from "$data/models/package";
  import { createEventDispatcher, onMount } from "svelte";
  import OutfitPackageListItem from "../OutfitPackageListItem/OutfitPackageListItem.svelte";
  import { GetLayer } from "$src/api/pack";
  import Resize from "$lib/components/other/Resize/Resize.svelte";
  import { PACKAGE_TYPE } from "$src/data/enums/outfit";

  const dispatch = createEventDispatcher();

  export let items: OutfitPackage[];
  export let baseTexture: OutfitLayer | string = null;
  export let columns: number = -1;
  export let resizable = true;
  export let resizeDebounce = 300;
  export let currentPackageId: string = null;

  const selectOutfit = function (item) {
    dispatch("select", { item: item });
  };
  const fetchLayer = async function (id, item): Promise<OutfitLayer> {
    return await GetLayer(id);
  };
  let renderList: any[] = [];

  const onResize = async function () {
    for (let i = 0; i < items.length; i++) {
      await renderList[i]();
    }
  };
</script>

<div class="outfit-package-list">
  <div
    class="outfit-package-list-items"
    style={`grid-template-columns: repeat(auto-fit, minmax(max(5px, ${columns > 0 ? `calc((100% / ${columns}) - 4px)` : "128px"}),1fr));`}
  >
    {#each items as item, index (item.id + item?.layers[0]?.id)}
      <OutfitPackageListItem
        bind:resize={renderList[index]}
        currentItem={currentPackageId == item.id}
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
    }
  }
</style>
