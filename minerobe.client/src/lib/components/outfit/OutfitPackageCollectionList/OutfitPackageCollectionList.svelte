<script lang="ts">
  //models
  import { OutfitPackageCollectionWithPackageContext } from "$data/models/collection";

  //components
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";

  import OutfitPackageCollectionListItem from "../OutfitPackageCollectionListItem/OutfitPackageCollectionListItem.svelte";

  interface Props {
    items: OutfitPackageCollectionWithPackageContext[];
    pageSize?: number;
    selectable?: boolean;
    loading?: boolean;
    dense?: boolean;
    columns?: number;
    onselect?: (event?: any) => void;
    onunselect?: (event?: any) => void;
    onclick?: (event?: any) => void;
  }

  let {
    items,
    pageSize = 10,
    selectable = false,
    loading = true,
    dense = true,
    columns = -1
  ,
    onselect = null,
    onunselect = null,
    onclick = null
  }: Props = $props();

  const onSelect= (item: OutfitPackageCollectionWithPackageContext) => {
    onselect?.({ detail: { item: item } });
  };
  const onUnselect= (item: OutfitPackageCollectionWithPackageContext) => {
    onunselect?.({ detail: { item: item } });
  };
  const onClick= (item: OutfitPackageCollectionWithPackageContext) => {
    onclick?.({ detail: { item: item } });
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
        onclick={() => onClick(item)}
        onselect={() => onSelect(item)}
        onunselect={() => onUnselect(item)}
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
