<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //services
  import { clickOutside } from "$src/helpers/data/componentHelper";
  //components
  import Button from "../Button/Button.svelte";
  //consts
  import { IS_MOBILE_VIEW } from "$src/data/static";
  //icons
  import ChevronUpIcon from "$icons/chevron-up.svg?raw";
  import ChevronDownIcon from "$icons/chevron-down.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import CheckBoxIcon from "$icons/checkbox.svg?raw";
  import CheckBoxOffIcon from "$icons/checkbox-off.svg?raw";

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
  export let disabled = false;
  export let autocomplete = false;

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
  let autocompleteInput = null;
  let inputComponent = null;
  let filteredItems = items;

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
    if (autocomplete) {
      inputComponent.focus();
    }
    autocompleteInput = null;
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
    autocompleteInput = null;
    filteredItems = items;
    dispatch("clear", { item: selectedItemValue });
  };
  const setMenuWidth = (op) => {
    if (!opened) return;
    if ($IS_MOBILE_VIEW) {
      itemsContainer.style.minWidth = null;
      itemsContainer.style.maxWidth = null;
    } else {
      menuWidth = menu?.offsetWidth - 1;
      const menuCoords = menu?.getBoundingClientRect();
      const menuY = menuCoords?.top;
      const menuHeight = menuCoords?.height;
      if (itemsContainer) {
        if (itemsContainer.style.maxHeight?.length == 0)
          itemsContainer.style.maxHeight = `calc(100vh - ${menuY}px - ${menuHeight}px)`;

        itemsContainer.style.minWidth = `${menuWidth}px`;
        itemsContainer.style.maxWidth = `${menuWidth}px`;
      }
    }
  };
  let setSelectedItemValue = (value) => {
    if (itemValue) {
      if (multiple)
        selectedItemValue = items.filter((i) => value?.includes(i[itemValue]));
      else
        selectedItemValue = items.find(
          (i) =>
            i[itemValue] == value ||
            (value ? i[itemValue] == value[itemValue] : false)
        );
    } else selectedItemValue = items.find((i) => i == value);
  };
  const filterByAutocomplete = (value) => {
    if (autocomplete && autocompleteInput?.length > 0) {
      filteredItems = items.filter((i) => {
        if (itemText) {
          return i[itemText].toLowerCase().includes(value.toLowerCase());
        }
        return i.toLowerCase().includes(value.toLowerCase());
      });
    }
  };

  $: setSelectedItemValue(selectedItem);
  $: setMenuWidth(opened);

  $: filteredItems = items;
  $: filterByAutocomplete(autocompleteInput);
</script>

<div
  class="select"
  class:opened
  class:disabled
  class:autocomplete
  class:mobile={$IS_MOBILE_VIEW}
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
            >
              {itemText == null
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
      {:else if !autocomplete}
        <div class="select-placeholder">{placeholder}</div>
      {/if}
    </div>
    {#if autocomplete}
      <input
        bind:this={inputComponent}
        type="text"
        {placeholder}
        bind:value={autocompleteInput}
        class="autocomplete-input"
        on:input={(e) => (opened = true)}
        on:click={(e) => (opened = true)}
      />
    {/if}
    {#if clearable && selectedItemValue != null && (multiple ? selectedItemValue.length > 0 : true)}
      <Button
        onlyIcon
        style="height: 32px;"
        icon={CloseIcon}
        size="small"
        type="secondary"
        iconSize="auto"
        noBorder
        on:click={clear}
      ></Button>
    {/if}
    <Button
      onlyIcon
      style="height: 32px;width:32px;"
      iconSize="auto"
      size="small"
      icon={opened ? ChevronUpIcon : ChevronDownIcon}
      type="primary"
      noBorder
      on:click={() => (opened = !opened)}
    ></Button>
    <slot name="actions"></slot>
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
    {#each filteredItems.sort(sorter) as item}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="selected item" on:click={() => select(item)}>
        <slot {item} {multiple} {itemText} {selectedItemValue} {comparer}>
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
