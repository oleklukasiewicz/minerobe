<script lang="ts">
  import ChevronUpIcon from "$icons/chevron-up.svg?raw";
  import ChevronDownIcon from "$icons/chevron-down.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import CheckBoxIcon from "$icons/checkbox.svg?raw";
  import CheckBoxOffIcon from "$icons/checkbox-off.svg?raw";
  import { createEventDispatcher } from "svelte";
  import Button from "../Button/Button.svelte";
  import { clickOutside } from "$src/helpers/data/component";
  import { isMobileView } from "$src/data/cache";

  const dispatch = createEventDispatcher();

  export let items: any[] = [];
  export let placeholder: string = "Select";
  export let multiple: boolean = false;
  export let selectedItem = null;
  export let clickable = false;
  export let opened = false;
  export let itemText = null;
  export let itemValue = null;
  export let clearable = false;
  export let dropDownStyle = null;
  // export let autocomplete = false;

  export let sorter = function (a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };
  export let comparer = function (selectedItemValue, item, isMultiple = false) {
    if (isMultiple) {
      return selectedItemValue?.includes(item);
    }
    return selectedItemValue == item;
  };
  // export let filter = function (item, value) {
  //   if (itemText) {
  //     return item[itemText].toLowerCase().includes(value.toLowerCase());
  //   }
  //   return item.toLowerCase().includes(value.toLowerCase());
  // };

  let selectedItemValue = null;
  let menuWidth = 0;
  let menu = null;
  let itemsContainer = null;

  const select = (item) => {
    if (multiple) {
      if (Array.isArray(selectedItemValue) === false) {
        if (selectedItemValue == null) selectedItemValue = [];
        selectedItemValue = [selectedItemValue];
      }
      if (selectedItemValue.includes(item)) {
        selectedItemValue = selectedItemValue.filter((i) => i !== item);
      } else {
        selectedItemValue = [...selectedItemValue, item];
      }
    } else {
      selectedItemValue = item;
    }

    if (itemValue) {
      if (multiple) selectedItem = selectedItemValue.map((i) => i[itemValue]);
      else selectedItem = selectedItemValue[itemValue];
    }

    opened = false;
    dispatch("select", { item: selectedItemValue });
  };
  const selectedClick = () => {
    if (clickable) {
      dispatch("selectedClick", { item: selectedItemValue });
    } else {
      opened = true;
    }
  };
  const clear = () => {
    if (multiple) selectedItemValue = [];
    else selectedItemValue = null;

    if (itemValue) {
      selectedItem = selectedItemValue;
    }
    dispatch("clear");
  };
  const setMenuWidth = (op) => {
    if (!opened) return;
    if ($isMobileView) {
      itemsContainer.style.minWidth = null;
      itemsContainer.style.maxWidth = null;
    } else {
      menuWidth = menu?.offsetWidth;
      if (itemsContainer) {
        itemsContainer.style.minWidth = `${menuWidth}px`;
        itemsContainer.style.maxWidth = `${menuWidth}px`;
      }
    }
  };
  let setSelectedItemValue = (value) => {
    if (itemValue) {
      if (multiple)
        selectedItemValue = items.filter((i) => value?.includes(i[itemValue]));
      else selectedItemValue = items.find((i) => i[itemValue] == value);
    }
  };

  $: setSelectedItemValue(selectedItem);
  $: setMenuWidth(opened);
</script>

<div
  class="select"
  class:opened
  class:mobile={$isMobileView}
  bind:this={menu}
  use:clickOutside
  on:click_outside={() => (opened = false)}
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="selected-item-container">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="selected-item" on:click={selectedClick}>
      {#if selectedItemValue != null && (multiple ? selectedItemValue.length > 0 : true)}
        <slot name="selected" {selectedItemValue} {itemText} {multiple}>
          {#if clickable && selectedItemValue != null}
            <Button
              textAlign="left"
              size="small"
              type={clickable ? "primary" : "quaternary"}
              >{itemText == null
                ? selectedItemValue
                : selectedItemValue[itemText]}</Button
            >
          {:else}
            <div class="selected-item-default">
              {#if selectedItemValue != null || selectedItemValue.length > 0}
                {multiple == false
                  ? itemText == null
                    ? selectedItemValue
                    : selectedItemValue[itemText]
                  : itemText == null
                    ? selectedItemValue
                    : selectedItemValue.map((i) => i[itemText]).join(", ")}
              {/if}
            </div>
          {/if}
        </slot>
      {:else}
        <div class="select-placeholder">{placeholder}</div>
      {/if}
    </div>
    {#if clearable && selectedItemValue != null && (multiple ? selectedItemValue.length > 0 : true)}
      <Button
        onlyIcon
        style="height: 32px;"
        icon={CloseIcon}
        type="secondary"
        iconSize="auto"
        noBorder
        on:click={clear}
      ></Button>
    {/if}
    <Button
      onlyIcon
      iconStyle={"transform:translateY(1px);"}
      style="height: 32px;"
      iconSize="auto"
      icon={opened ? ChevronUpIcon : ChevronDownIcon}
      type="primary"
      noBorder
      on:click={() => (opened = !opened)}
    ></Button>
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="select-mobile-bg" on:click={() => (opened = false)}></div>
  <div
    class="items"
    style={dropDownStyle}
    class:opened
    class:hidden={!opened}
    bind:this={itemsContainer}
  >
    {#each items.sort(sorter) as item}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="selected item" on:click={() => select(item)}>
        <slot {item} {multiple} {itemText} {selectedItemValue}>
          <Button
            size="small"
            flat
            noBorder
            type={comparer(selectedItemValue, item, multiple)
              ? "primary"
              : "quaternary"}
            icon={multiple
              ? comparer(selectedItemValue, item, multiple)
                ? CheckBoxIcon
                : CheckBoxOffIcon
              : null}
            label={itemText == null ? item : item[itemText]}
            textAlign="left"
          ></Button>
        </slot>
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  @use "Select.scss";
</style>
