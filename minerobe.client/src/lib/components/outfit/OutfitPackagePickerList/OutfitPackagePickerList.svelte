<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import type { OutfitPackage } from "$data/models/package";
  //components
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageSingleLayerListItem from "../OutfitPackageSingleLayerListItem/OutfitPackageSingleLayerListItem.svelte";

  const dispatch = createEventDispatcher();

  export let items: OutfitPackage[];
  export let pageSize: number = 25;
  export let packageContext: OutfitPackage = null;
  export let loading = true;

  const onSelect = (item: OutfitPackage) => {
    dispatch("select", { item: item });
  };
</script>

<div id="outfit-package-picker-list">
  {#if loading}
    {#each Array(pageSize || 10) as _}
      <Placeholder width="100%" height="68px" />
    {/each}
  {:else}
    {#each items as item (item.id + item.layers[0].id)}
      <OutfitPackageSingleLayerListItem
        disabled={packageContext?.layers.find(
          (layer) => layer.id === item.layers[0].id
        ) != null}
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
