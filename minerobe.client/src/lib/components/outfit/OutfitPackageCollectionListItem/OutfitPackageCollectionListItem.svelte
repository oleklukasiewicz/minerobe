<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import type {
    OutfitPackageCollectionWithPackageContext,
  } from "$data/models/collection";
  //components
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";

  const dispatch = createEventDispatcher();

  export let item: OutfitPackageCollectionWithPackageContext;
  export let selectable = false;

  const onSelect = () => {
    dispatch("select", item);
  };
  const onUnselect = () => {
    dispatch("unselect", item);
  };
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y-missing-attribute -->
<a class="outfit-package-collection-list-item">
  <div class="items-actions">
    {#if selectable}
      <Checkbox
        on:select={onSelect}
        on:unselect={onUnselect}
        value={item?.isInCollection}
      />
    {/if}
  </div>
  <div class="item-data">
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
  </div>
</a>

<style lang="scss">
  .outfit-package-collection-list-item {
    padding: 8px 12px;
    box-sizing: border-box;
    background-color: var(--color-theme-D1);
    display: flex;
    gap: 16px;
    .item-data {
      flex: 1;
      display: block;
      overflow: hidden;
      b {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: minecraft;
      }
      div {
        .items-count {
          font-family: minecraft-simple;
          font-size: var(--size-font-base);
        }
      }
    }

    .items-actions {
      margin-top: 5px;
    }
    &:hover {
      background-color: var(--color-theme-D2);
    }
    &:active {
      background-color: var(--color-theme-D3);
    }
  }
</style>
