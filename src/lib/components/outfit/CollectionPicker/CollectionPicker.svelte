<script lang="ts">
  import type { OutfitPackageCollection } from "$src/data/common";
  import { createEventDispatcher } from "svelte";
  import OutfitPackageCollectionItem from "../OutfitPackageCollectionItem/OutfitPackageCollectionItem.svelte";

  const dispatch = createEventDispatcher();

  export let items: OutfitPackageCollection[] = [];

  const onSelect = function (col) {
    dispatch("select", { collection: col });
  };
</script>

<div class="collection-picker">
  {#each items as item}
    <OutfitPackageCollectionItem {item} on:click={() => onSelect(item)} />
  {/each}
</div>

<style lang="scss">
  .collection-picker {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 10px;
    padding: 8px;
  }
</style>
