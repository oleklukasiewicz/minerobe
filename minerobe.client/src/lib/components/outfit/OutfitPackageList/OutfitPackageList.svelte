<script lang="ts">
  import type { OutfitLayer, OutfitPackage } from "$data/models/package";
  import { createEventDispatcher, onMount } from "svelte";
  import OutfitPackageListItem from "../OutfitPackageListItem/OutfitPackageListItem.svelte";
  import { GetLayer } from "$src/api/pack";
  import Resize from "$lib/components/other/Resize/Resize.svelte";
  import { PACKAGE_TYPE } from "$src/data/enums/outfit";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";

  const dispatch = createEventDispatcher();

  export let items: OutfitPackage[];
  export let baseTexture: OutfitLayer | string = null;
  export let columns: number = -1;
  export let resizable = true;
  export let resizeDebounce = 300;
  export let currentPackageId: string = null;
  export let loading = false;
  export let pageSize: number = 10;
  export let selectable = false;

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
    style={`grid-template-columns: repeat(${columns > 0 ? "auto-fill" : "auto-fit"}, minmax(max(5px, ${columns > 0 ? `calc((100% / ${columns}) - 4px)` : "128px"}),1fr));`}
  >
    {#if loading}
      {#each Array(pageSize || 10) as _}
        <Placeholder width="100%" aspectRatio={"0.73"} height="100%" />
      {/each}
    {:else}
      {#each items as item, index (item.id + item?.layers[0]?.id)}
        <OutfitPackageListItem
          {selectable}
          bind:resize={renderList[index]}
          currentItem={currentPackageId == item.id}
          {item}
          {fetchLayer}
          on:click={() => selectOutfit(item)}
          baseTexture={item.type == PACKAGE_TYPE.OUTFIT_SET
            ? baseTexture
            : null}
        />
      {/each}
    {/if}
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
