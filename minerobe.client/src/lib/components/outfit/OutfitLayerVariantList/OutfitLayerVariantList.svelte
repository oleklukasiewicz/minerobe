<script lang="ts">
  //consts
  import type { MODEL_TYPE } from "$src/data/enums/model";

  //models
  import type { OutfitLayer } from "$data/models/package";

  import OutfitLayerVariantListItem from "../OutfitLayerVariantListItem/OutfitLayerVariantListItem.svelte";

  interface OutfitLayerVariantListProps {
    items: OutfitLayer[];
    model: MODEL_TYPE;
    selectedLayerId?: string;
    selectable?: boolean;
    onselect?: (event?: any) => void;
  }

  let {
    items,
    model,
    selectedLayerId = "",
    selectable = true
  ,
    onselect = null
  }: OutfitLayerVariantListProps = $props();

  const onSelect= function (layer: OutfitLayer) {
    if (!selectable) return;
     onselect?.({ item: layer });
  };
</script>

<div class="outfit-layer-variant-list">
  {#each items as item (item.id)}
    <OutfitLayerVariantListItem
      onclick={() => onSelect(item)}
      {item}
      {model}
      selected={item.id == selectedLayerId}
    />
  {/each}
</div>

<style lang="scss">
  .outfit-layer-variant-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }
</style>
