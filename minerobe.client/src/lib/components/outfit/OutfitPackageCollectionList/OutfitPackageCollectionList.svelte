<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import { OutfitPackageCollectionWithPackageContext } from "$src/model/collection";
  import type { PagedResponse } from "$src/model/base";
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
      <Placeholder width="100%" height="50px" />
    {/each}
  {:else}
    {#each items?.items as item}
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
