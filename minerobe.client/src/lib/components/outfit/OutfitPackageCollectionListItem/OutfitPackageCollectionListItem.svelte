<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import type { OutfitPackageCollectionWithPackageContext } from "$data/models/collection";
  //components
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";

  const dispatch = createEventDispatcher();

  export let item: OutfitPackageCollectionWithPackageContext;
  export let selectable = false;
  export let dense = true;

  const onSelect = () => {
    dispatch("select", item);
  };
  const onUnselect = () => {
    dispatch("unselect", item);
  };
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<a class="outfit-package-collection-list-item" on:click={onSelect} class:dense>
  {#if selectable}
    <div class="items-actions">
      <Checkbox
        on:select={onSelect}
        on:unselect={onUnselect}
        value={item?.isInCollection}
      />
    </div>
  {/if}
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
    &.dense {
      .item-data {
        b {
          margin-bottom: 0px;
        }
      }
    }
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
        margin-bottom: 16px;
      }
      div {
        .items-count {
          font-family: minecraft-simple;
          font-size: var(--size-font-caption);
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
