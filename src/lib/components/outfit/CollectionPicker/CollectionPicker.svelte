<script lang="ts">
  import type { OutfitPackageCollectionWithPackageContext } from "$src/data/common";
  import { createEventDispatcher } from "svelte";
  import OutfitPackageCollectionSelectionItem from "../OutfitPackageCollectionSelectionItem/OutfitPackageCollectionSelectionItem.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";

  const dispatch = createEventDispatcher();

  export let items: OutfitPackageCollectionWithPackageContext[] = [];
  export let loading: boolean = true;

  const onAdd = function (collection: OutfitPackageCollectionWithPackageContext) {
    dispatch("add", { collection });
  };
  const onRemove = function (collection: OutfitPackageCollectionWithPackageContext) {
    dispatch("remove", { collection });
  };
</script>

<div class="collection-picker">
  {#if loading}
   {#each Array(10) as _}
      <Placeholder style="min-width:100%;aspect-ratio:8/2;min-height:80px" />
    {/each}
  {:else}
    {#each items as item}
      <OutfitPackageCollectionSelectionItem
        {item}
        on:add={() => onAdd(item)}
        on:remove={() => onRemove(item)}
      />
    {/each}
  {/if}
</div>

<style lang="scss">
  .collection-picker {
    display: flex;
    min-width: 300px;
    flex-direction: column;
    gap: 10px;
    max-height: 50vh;
    padding: 8px;
  }
</style>
