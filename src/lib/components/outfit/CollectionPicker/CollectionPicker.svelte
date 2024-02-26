<script lang="ts">
  import type { OutfitPackageCollection } from "$src/data/common";
  import { createEventDispatcher } from "svelte";
  import OutfitPackageCollectionSelectionItem from "../OutfitPackageCollectionSelectionItem/OutfitPackageCollectionSelectionItem.svelte";

  const dispatch = createEventDispatcher();

  export let items: OutfitPackageCollection[] = [];
  export let pack: any;

  const onAdd = function (collection: OutfitPackageCollection) {
    dispatch("add", { collection });
  };
  const onRemove = function (collection: OutfitPackageCollection) {
    dispatch("remove", { collection });
  };
</script>

<div class="collection-picker">
  {#each items as item}
    <OutfitPackageCollectionSelectionItem
      {pack}
      {item}
      on:add={() => onAdd(item)}
      on:remove={() => onRemove(item)}
    />
  {/each}
</div>

<style lang="scss">
  .collection-picker {
    display: flex;
    min-width: 300px;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 10px;
    padding: 8px;
  }
</style>
