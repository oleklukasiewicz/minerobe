<script lang="ts">
  import type { OutfitPackageCollection } from "$src/data/common";
  import { createEventDispatcher } from "svelte";
  import OutfitPackageCollectionItem from "../OutfitPackageCollectionItem/OutfitPackageCollectionItem.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";

  export let items: OutfitPackageCollection[] = [];
  export let loading = false;
  export let minItemWidth = "135px";
  export let fillMethod = "auto-fit";
  export let maxItemWidth = "1fr";
  export let dense = true;
  export let placeholderCount = 48;

  const dispatch = createEventDispatcher();

  const onSelect = (item) => {
    dispatch("select", item);
  };
</script>

<div
  class="outfit-package-collection-list"
  class:dense
  style="grid-template-columns: repeat({fillMethod}, minmax({minItemWidth}, {maxItemWidth}));"
>
  {#if !loading}
    {#each items as item (item.id)}
      <OutfitPackageCollectionItem {item} on:click={() => onSelect(item)} />
    {/each}
  {:else}
    {#each Array(placeholderCount) as _}
      <Placeholder style="aspect-ratio:8/5;height:100%" />
    {/each}
  {/if}
</div>
<style lang="scss">
    .outfit-package-collection-list {
      display: grid;
      gap: 4px;
      max-width: 100%;
      &.dense {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }
    }
  </style>