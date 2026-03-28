<script lang="ts">
  //main imports
    //model
  import type { OutfitLayer } from "$data/models/package";
  import type { MODEL_TYPE } from "$src/data/enums/model";
  //components
  import OutfitLayerVariantListItem from "../OutfitLayerVariantListItem/OutfitLayerVariantListItem.svelte";

  interface Props {
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
  }: Props = $props();

  const onSelect= function (layer: OutfitLayer) {
    if (!selectable) return;
    onselect?.({ detail: { item: layer } });
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
