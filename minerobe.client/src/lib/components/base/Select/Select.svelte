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
  import Flyout from "../Flyout/Flyout.svelte";

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
  export let defaultValue = null;

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

  let selectedItemValue = defaultValue;
  let menuWidth = 0;
  let menu = null;
  let itemsContainer = null;
  let autocompleteInput = null;
  let inputComponent = null;
  let filteredItems = items;
  let focusedIndex = -1;

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
    else selectedItemValue = defaultValue;

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
      else
        selectedItemValue = items.find(
          (i) =>
            i[itemValue] == value ||
            (value ? i[itemValue] == value[itemValue] : false)
        );
    } else selectedItemValue = items.find((i) => i == value);
  };
  const filterByAutocomplete = (value) => {
    if (autocomplete) {
      filteredItems = items.filter((i) => {
        if (value?.length == 0 || value == null) return true;
        if (itemText) {
          return i[itemText]?.toLowerCase().includes(value?.toLowerCase());
        }
        return i?.toLowerCase().includes(value?.toLowerCase());
      });
    }
  };

  const handleKeyDown = (event) => {
    if (!opened) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusedIndex = (focusedIndex + 1) % filteredItems.length;
        scrollToFocusedItem();
        break;
      case "ArrowUp":
        event.preventDefault();
        focusedIndex =
          (focusedIndex - 1 + filteredItems.length) % filteredItems.length;
        scrollToFocusedItem();
        break;
      case "Enter":
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredItems.length) {
          select(filteredItems[focusedIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        opened = false;
        break;
    }
  };
  const scrollToFocusedItem = () => {
    const focusedItem = itemsContainer?.querySelectorAll(".item")[focusedIndex];
    focusedItem?.scrollIntoView({ block: "nearest" });
  };

  $: setSelectedItemValue(selectedItem);
  $: setMenuWidth(opened);

  $: filteredItems = items;
  $: filterByAutocomplete(autocompleteInput);
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="select"
  class:opened
  class:disabled
  class:autocomplete
  class:mobile={$IS_MOBILE_VIEW}
  bind:this={menu}
  use:clickOutside
  tabindex="0"
  on:keydown={handleKeyDown}
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
    {#if autocomplete && (multiple ? true : selectedItemValue == null)}
      <input
        bind:this={inputComponent}
        type="text"
        {placeholder}
        bind:value={autocompleteInput}
        class="autocomplete-input"
        on:input={(e) => (opened = true)}
        on:click={(e) => (opened = true)}
      />
    {:else if autocomplete}
      <div
        class="autocomplete-placeholder"
        on:click={() => (opened = true)}
      ></div>
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
  <Flyout
    bind:opened
    caller={menu}
    preventClickOutsideClose
    resizable
    let:position
  >
    <div
      class:pos-bottom={position == "bottom"}
      class:pos-top={position == "top"}
      class="items"
      style={dropDownStyle}
      class:opened
      class:hidden={!opened}
      bind:this={itemsContainer}
    >
      {#each filteredItems.sort(sorter) as item, index}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="selected item" on:click={() => select(item)}>
          <slot
            {item}
            {multiple}
            {itemText}
            {selectedItemValue}
            {comparer}
            {index}
            {focusedIndex}
          >
            <Button
              size="small"
              flat
              noBorder
              type={comparer(selectedItemValue, item, multiple) ||
              index == focusedIndex
                ? "primary"
                : "quaternary"}
              icon={multiple
                ? comparer(selectedItemValue, item, multiple)
                  ? CheckBoxIcon
                  : CheckBoxOffIcon
                : null}
              focused={index == focusedIndex}
              label={itemText == null ? item : item[itemText]}
              textAlign="left"
            ></Button>
          </slot>
        </div>
      {/each}
    </div>
  </Flyout>
</div>

<style lang="scss">
  @use "Select.scss";
</style>
