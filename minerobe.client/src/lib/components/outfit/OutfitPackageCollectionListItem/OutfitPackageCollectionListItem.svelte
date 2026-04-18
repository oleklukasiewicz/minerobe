<script lang="ts">
  //models
  import type { OutfitPackageCollectionWithPackageContext } from "$data/models/collection";

  //components
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";

  interface OutfitPackageCollectionListItemProps {
    item: OutfitPackageCollectionWithPackageContext;
    selectable?: boolean;
    dense?: boolean;
    onselect?: (event?: any) => void;
    onunselect?: (event?: any) => void;
    onclick?: (event?: any) => void;
  }

  let {
    item,
    selectable = false,
    dense = true,
    onselect = null,
    onunselect = null,
    onclick = null,
  }: OutfitPackageCollectionListItemProps = $props();

  const onSelect = (e?: Event) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    onselect?.({ item });
  };
  const onUnselect = () => onunselect?.({ item });

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectable) return;
    onclick?.({ item });
  };
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<a class="outfit-package-collection-list-item" class:dense onclick={onClick}>
  {#if selectable}
    <div class="items-actions">
      <Checkbox
        onselect={onSelect}
        onunselect={onUnselect}
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
    cursor: pointer;
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
