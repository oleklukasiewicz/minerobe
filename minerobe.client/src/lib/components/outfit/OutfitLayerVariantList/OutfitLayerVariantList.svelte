<script lang="ts">
  import type { OutfitLayer } from "$data/models/package";
  import { createEventDispatcher } from "svelte";
  import OutfitLayerVariantListItem from "../OutfitLayerVariantListItem/OutfitLayerVariantListItem.svelte";
  import type { MODEL_TYPE } from "$src/data/enums/model";

  const dispatch = createEventDispatcher();

  export let items: OutfitLayer[];
  export let model: MODEL_TYPE;
  export let selectedLayerId: string = "";
  export let selectable: boolean = true;

  const onSelect = function (layer: OutfitLayer) {
    if (!selectable) return;
    dispatch("select", { item: layer });
  };
</script>

<div class="outfit-layer-variant-list">
  {#each items as item (item.id)}
    <OutfitLayerVariantListItem
      on:click={() => onSelect(item)}
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
    gap:8px;
  }
</style>
