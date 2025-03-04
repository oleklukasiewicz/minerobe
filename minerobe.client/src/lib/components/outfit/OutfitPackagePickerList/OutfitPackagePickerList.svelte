<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import type { OutfitLayer, OutfitPackage } from "$data/models/package";
  //components
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageSingleLayerListItem from "../OutfitPackageSingleLayerListItem/OutfitPackageSingleLayerListItem.svelte";

  const dispatch = createEventDispatcher();

  export let items: OutfitPackage[];
  export let pageSize: number = 25;
  export let disableContext: any = null;
  export let disableFunction = function (context, item) {
    return (
      context?.layers.find((layer) => layer.id === item.layers[0].id) != null
    );
  };
  export let loading = true;
  export let selectable = false;
  export let selectedItems: OutfitPackage[] = [];
  export let baseTexture: OutfitLayer = null;

  const onSelect = (item: OutfitPackage) => {
    dispatch("select", { items: [item] });
  };
  const onRemoveFromSelected = (item: OutfitPackage) => {
    selectedItems = selectedItems.filter(
      (i) => i.id !== item.id || i.layers[0].id !== item.layers[0].id
    );
    dispatch("select", { items: selectedItems });
  };
  const onAddToSelected = (item: OutfitPackage) => {
    selectedItems = [...selectedItems, item];
    dispatch("select", { items: selectedItems });
  };
</script>

<div id="outfit-package-picker-list">
  {#if loading}
    {#each Array(pageSize == null || pageSize < 0 ? 10 : pageSize) as _}
      <Placeholder width="100%" height="68px" />
    {/each}
  {:else}
    {#each items as item (item.id + item.layers[0].id)}
      <OutfitPackageSingleLayerListItem
        {selectable}
        {baseTexture}
        selected={selectedItems.find(
          (i) => i.id === item.id && i.layers[0].id == item.layers[0].id
        ) != null && selectable}
        disabled={disableFunction(disableContext, item)}
        {item}
        on:click={() => onSelect(item)}
        on:unselect={() => onRemoveFromSelected(item)}
        on:select={() => onAddToSelected(item)}
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
