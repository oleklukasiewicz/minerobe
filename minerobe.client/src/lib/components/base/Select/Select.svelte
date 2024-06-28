<script lang="ts">
  import ChevronUpIcon from "$icons/chevron-up.svg?raw";
  import ChevronDownIcon from "$icons/chevron-down.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import CheckBoxIcon from "$icons/checkbox.svg?raw";
  import CheckBoxOffIcon from "$icons/checkbox-off.svg?raw";
  import { createEventDispatcher } from "svelte";
  import Button from "../Button/Button.svelte";
  import { clickOutside } from "$src/helpers/data/component";

  const dispatch = createEventDispatcher();

  export let items: any[] = [];
  export let multiple: boolean = false;
  export let selectedItem = null;
  export let mobile = false;
  export let clickable = false;
  export let opened = false;
  export let itemText = null;
  export let clearable = false;
  export let sorter = function (a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };

  let menuWidth = 0;
  let menu = null;
  let itemsContainer = null;

  const select = (item) => {
    if (multiple) {
      if (selectedItem == null || Array.isArray(selectedItem) === false) {
        if (selectedItem == null) selectedItem = [];
        else {
          selectedItem = [selectedItem];
        }
      }
      if (selectedItem.includes(item)) {
        selectedItem = selectedItem.filter((i) => i !== item);
      } else {
        selectedItem = [...selectedItem, item];
      }
    } else {
      selectedItem = item;
    }
    opened = false;
    dispatch("select", { item: selectedItem });
  };
  const selectedClick = () => {
    if (clickable) {
      dispatch("selectedClick", { item: selectedItem });
    } else {
      opened = true;
    }
  };
  const clear = () => {
    selectedItem = null;
    dispatch("clear");
  };

  const setMenuWidth = (op) => {
    if (!opened) return;
    if (mobile) {
      menuWidth = window.innerWidth;
    } else {
      menuWidth = menu?.offsetWidth;
    }
    if (itemsContainer) itemsContainer.style.minWidth = `${menuWidth}px`;
  };

  $: setMenuWidth(opened);
</script>

<div
  class="select"
  bind:this={menu}
  use:clickOutside
  on:click_outside={() => (opened = false)}
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="selected-item-container">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="selected-item" on:click={selectedClick}>
      <slot name="selected" {selectedItem} {itemText} {multiple}>
        {#if clickable && selectedItem != null}
          <Button
            textAlign="left"
            size="small"
            type={clickable ? "primary" : "quaternary"}
            >{itemText == null ? selectedItem : selectedItem[itemText]}</Button
          >
        {:else}
          <div class="selected-item-default">
            {#if selectedItem != null}
              {multiple == false
                ? itemText == null
                  ? selectedItem
                  : selectedItem[itemText]
                : itemText == null
                  ? selectedItem
                  : selectedItem.map((i) => i[itemText]).join(", ")}
            {/if}
          </div>
        {/if}
      </slot>
    </div>
    {#if clearable && selectedItem != null}
      <Button
        onlyIcon
        style="padding:1px 3px 4px;"
        icon={CloseIcon}
        type="secondary"
        size="small"
        on:click={clear}
      ></Button>
    {/if}
    <Button
      onlyIcon
      style="padding:1px 3px 4px;"
      icon={opened ? ChevronUpIcon : ChevronDownIcon}
      type="primary"
      size="small"
      on:click={() => (opened = !opened)}
    ></Button>
  </div>
  <div
    class="items"
    class:opened
    class:hidden={!opened}
    bind:this={itemsContainer}
  >
    {#each items.sort(sorter) as item}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="selected item" on:click={() => select(item)}>
        <slot {item} {multiple} {itemText} {selectedItem}>
          <Button
            size="small"
            type={multiple
              ? (multiple && selectedItem?.includes(item)) ||
                selectedItem == item
                ? "primary"
                : "quaternary"
              : selectedItem == item
                ? "primary"
                : "quaternary"}
            icon={multiple
              ? (multiple && selectedItem?.includes(item)) ||
                selectedItem == item
                ? CheckBoxIcon
                : CheckBoxOffIcon
              : null}
            textAlign="left">{itemText == null ? item : item[itemText]}</Button
          >
        </slot>
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  @import "Select.scss";
</style>
