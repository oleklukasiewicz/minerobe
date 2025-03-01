<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import { OutfitPackageCollectionWithPackageContext } from "$data/models/collection";
  //components
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageCollectionListItem from "../OutfitPackageCollectionListItem/OutfitPackageCollectionListItem.svelte";

  const dispatch = createEventDispatcher();

  export let items: OutfitPackageCollectionWithPackageContext[];
  export let pageSize: number = 10;
  export let selectable: boolean = false;
  export let loading = true;
  export let dense = true;
  export let columns: number = -1;

  const onSelect = (item: OutfitPackageCollectionWithPackageContext) => {
    dispatch("select", { item: item });
  };
  const onUnselect = (item: OutfitPackageCollectionWithPackageContext) => {
    dispatch("unselect", { item: item });
  };
  const onClick = (item: OutfitPackageCollectionWithPackageContext) => {
    dispatch("click", { item: item });
  };
</script>

<div
  id="collections-list"
  style={`grid-template-columns: repeat(${columns > 0 ? "auto-fill" : "auto-fit"}, minmax(max(5px, ${columns > 0 ? `calc((100% / ${columns}) - 4px)` : "190px"}),1fr));`}
>
  {#if loading}
    {#each Array(pageSize || 10) as _}
      <Placeholder width="100%" height={dense ? "51px" : "71px"} />
    {/each}
  {:else}
    {#each items as item (item.id)}
      <OutfitPackageCollectionListItem
        {item}
        {dense}
        {selectable}
        on:click={() => onClick(item)}
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
    gap: 4px;
  }
</style>
