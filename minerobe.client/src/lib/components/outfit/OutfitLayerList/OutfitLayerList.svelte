<script lang="ts">
  import type { OutfitLayer } from "$src/model/package";
  import { createEventDispatcher } from "svelte";
  import OutfitLayerListItem from "../OutfitLayerListItem/OutfitLayerListItem.svelte";

  const dispatch = createEventDispatcher();

  export let items: OutfitLayer[];
  export let model: "alex" | "steve";
  export let selectedLayerId: string = "";
  export let selectable: boolean = true;

  const onSelect = function (layer: OutfitLayer) {
    if (!selectable) return;
    dispatch("select", layer);
  };
</script>

<div class="outfit-layer-list">
  {#each items as item, index (item.id)}
    <OutfitLayerListItem
      on:click={() => onSelect(item)}
      {item}
      readonly={!selectable}
      selected={item.id == selectedLayerId}
      {model}
      outfitType={item.outfitType}
    />
  {/each}
</div>

<style lang="scss">
  .outfit-layer-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
</style>
