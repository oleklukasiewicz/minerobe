<script lang="ts">
  //consts
  import { PACKAGE_TYPE } from "$src/data/enums/outfit";

  //models
  import type { OutfitLayer, OutfitPackage } from "$data/models/package";

  //components
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";

  import OutfitPackageSingleLayerListItem from "../OutfitPackageSingleLayerListItem/OutfitPackageSingleLayerListItem.svelte";

  interface Props {
    items: OutfitPackage[];
    pageSize?: number;
    disableContext?: any;
    disableFunction?: any;
    loading?: boolean;
    selectable?: boolean;
    selectedItems?: OutfitPackage[];
    baseTexture?: OutfitLayer;
    onselectClick?: (event?: any) => void;
    onunselect?: (event?: any) => void;
    onselectionUpdate?: (event?: any) => void;
    onselect?: (event?: any) => void;
  }

  let {
    items,
    pageSize = 25,
    disableContext = null,
    disableFunction = function (context, item) {
    return (
      context?.layers.find((layer) => layer.id === item.layers[0]?.id) != null
    );
  },
    loading = true,
    selectable = false,
    selectedItems = $bindable([]),
    baseTexture = null
  ,
    onselectClick = null,
    onunselect = null,
    onselectionUpdate = null,
    onselect = null
  }: Props = $props();

  const onSelect= (item: OutfitPackage) => {
    onselectClick?.({ items: [item] });
  };
  const onRemoveFromSelected= (item: OutfitPackage) => {
    selectedItems = selectedItems.filter(
      (i) => i.id !== item.id || i.layers[0]?.id !== item.layers[0]?.id
    );
    onunselect?.({ items: [item] });
    onselectionUpdate?.({ items: selectedItems });
  };
  const onAddToSelected= (item: OutfitPackage) => {
    selectedItems = [...selectedItems, item];
    onselect?.({ items: [item] });
    onselectionUpdate?.({ items: selectedItems });
  };
</script>

<div id="outfit-package-picker-list">
  {#if loading}
    {#each Array(pageSize == null || pageSize < 0 ? 10 : pageSize) as _}
      <Placeholder width="100%" height="68px" />
    {/each}
  {:else}
    {#each items as item (item.id + item.layers[0]?.id)}
      <OutfitPackageSingleLayerListItem
        {selectable}
        baseTexture={item.type === PACKAGE_TYPE.OUTFIT_SET ? baseTexture : null}
        selected={selectedItems.find(
          (i) => i.id === item.id && i.layers[0]?.id == item.layers[0]?.id
        ) != null && selectable}
        disabled={disableFunction(disableContext, item)}
        {item}
        onclick={() => onSelect(item)}
        onunselect={() => onRemoveFromSelected(item)}
        onselect={() => onAddToSelected(item)}
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
