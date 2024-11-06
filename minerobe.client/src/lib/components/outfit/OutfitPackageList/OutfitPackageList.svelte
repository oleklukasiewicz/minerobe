<script lang="ts">
  import type { OutfitLayer, OutfitPackage } from "$src/model/package";
  import { createEventDispatcher } from "svelte";
  import OutfitPackageListItem from "../OutfitPackageListItem/OutfitPackageListItem.svelte";
  import { PACKAGE_TYPE } from "$src/data/consts";
  import { GetLayer } from "$src/api/pack";

  const dispatch = createEventDispatcher();

  export let items: OutfitPackage[];
  export let baseTexture: OutfitLayer | string = null;

  const selectOutfit = function (item) {
    dispatch("select", item);
  };
  const fetchLayer = async function (id, item): Promise<OutfitLayer> {
    return await GetLayer(id);
  };
</script>

<div class="outfit-package-list">
  {#each items as item (item.id)}
    <OutfitPackageListItem
      {item}
      {fetchLayer}
      on:click={() => selectOutfit(item)}
      baseTexture={item.type == PACKAGE_TYPE.OUTFIT_SET ? baseTexture : null}
    />
  {/each}
</div>

<style lang="scss">
  .outfit-package-list {
    max-width: 100%;
    display: grid;
    gap: 4px;
    flex-wrap: wrap;
    grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
  }
</style>
