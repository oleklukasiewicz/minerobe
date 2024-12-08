<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import type { PagedResponse } from "$data/models/base";
  import type { OutfitPackage } from "$data/models/package";
  //components
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageSingleLayerListItem from "../OutfitPackageSingleLayerListItem/OutfitPackageSingleLayerListItem.svelte";

  const dispatch = createEventDispatcher();

  export let items: PagedResponse<OutfitPackage>;
  export let loading = true;

  const onSelect = (item: OutfitPackage) => {
    dispatch("select", { item: item });
  };
</script>

<div id="outfit-package-picker-list">
  {#if loading}
    {#each Array(items?.pageSize || 10) as _}
      <Placeholder width="100%" height="68px" />
    {/each}
  {:else}
    {#each items?.items as item}
      <OutfitPackageSingleLayerListItem
        {item}
        on:click={() => onSelect(item)}
      />
    {/each}
  {/if}
</div>

<style lang="scss">
  #outfit-package-picker-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 8px;
  }
</style>
