<script lang="ts">
  //models
  import type {
    OutfitPackageCollection,
    OutfitPackageCollectionWithPackageContext,
  } from "$src/model/collection";

  export let item:
    | OutfitPackageCollectionWithPackageContext
    | OutfitPackageCollection;
  export let editable = false;
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<a class="outfit-package-collection-list-item">
  <b>{item.name}</b>
  <div>
    <span class="items-count">
      {#if item.itemsCount == 1}
        {item.itemsCount} item
      {:else}
        {item.itemsCount} items
      {/if}</span
    >
  </div>
</a>

<style lang="scss">
  .outfit-package-collection-list-item {
    padding: 8px;
    box-sizing: border-box;
    background-color: var(--color-theme-D1);
    b {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: minecraft;
    }
    div {
      .items-count {
        font-family: minecraft-simple;
        font-size: var(--size-font-caption);
      }
    }
  }
</style>
