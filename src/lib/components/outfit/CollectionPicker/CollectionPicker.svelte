<script lang="ts">
  import type { OutfitPackageCollection } from "$src/data/common";
  import OutfitPackageCollectionItem from "../OutfitPackageCollectionItem/OutfitPackageCollectionItem.svelte";

export let items: OutfitPackageCollection[] = [];
</script>
<div class="collection-picker">
{#each items as item}
    <OutfitPackageCollectionItem {item} />
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