<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import { OutfitPackageCollectionWithPackageContext } from "$data/models/collection";
  import type { PagedResponse } from "$data/models/base";
  //components
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageCollectionListItem from "../OutfitPackageCollectionListItem/OutfitPackageCollectionListItem.svelte";

  const dispatch = createEventDispatcher();

  export let items: PagedResponse<OutfitPackageCollectionWithPackageContext>;
  export let loading = true;

  const onSelect = (item: OutfitPackageCollectionWithPackageContext) => {
    dispatch("select", { item: item });
  };
  const onUnselect = (item: OutfitPackageCollectionWithPackageContext) => {
    dispatch("unselect", { item: item });
  };
</script>

<div id="collections-list">
  {#if loading}
    {#each Array(items?.pageSize || 10) as _}
      <Placeholder width="100%" height="51px" />
    {/each}
  {:else}
    {#each items?.items as item (item.id)}
      <OutfitPackageCollectionListItem
        {item}
        selectable
        on:select={() => onSelect(item)}
        on:unselect={() => onUnselect(item)}
      />
    {/each}
  {/if}
</div>

<style lang="scss">
  #collections-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 8px;
  }
</style>
