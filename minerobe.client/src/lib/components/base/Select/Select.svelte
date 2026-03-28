<script lang="ts">
  import { run } from 'svelte/legacy';

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


  interface Props {
    items?: any[];
    placeholder?: string;
    multiple?: boolean;
    selectedItem?: any;
    clickable?: boolean;
    opened?: boolean;
    itemText?: any;
    itemValue?: any;
    clearable?: boolean;
    dropDownStyle?: any;
    disabled?: boolean;
    autocomplete?: boolean;
    defaultValue?: any;
    sorter?: any;
    comparer?: any;
    selected?: import('svelte').Snippet<[any]>;
    actions?: import('svelte').Snippet;
    children?: import('svelte').Snippet<[any]>;
  }

  let {
    items = [],
    placeholder = "Select",
    multiple = false,
    selectedItem = $bindable(null),
    clickable = false,
    opened = $bindable(false),
    itemText = null,
    itemValue = null,
    clearable = false,
    dropDownStyle = null,
    disabled = false,
    autocomplete = false,
    defaultValue = null,
    sorter = function (a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  },
    comparer = function (selectedItemValue, item, isMultiple = false) {
    if (isMultiple) {
      return selectedItemValue?.includes(item);
    }
    return selectedItemValue == item;
  },
    selected,
    actions,
    children
  }: Props = $props();

  let selectedItemValue = $state(null);
  let menuWidth = 0;
  let menu = $state(null);
  let itemsContainer = $state(null);
  let autocompleteInput = $state(null);
  let inputComponent = $state(null);
  let filteredItems = $state([]);
  let focusedIndex = $state(-1);

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
    if (!multiple) opened = false;
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
  let setSelectedItemValue = (value) => {
    if (itemValue) {
      if (multiple)
        selectedItemValue = items.filter((i) => value?.includes(i[itemValue]));
      else
        selectedItemValue = items.find(
          (i) =>
            i[itemValue] == value ||
            (value ? i[itemValue] == value[itemValue] : false),
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

  run(() => {
    setSelectedItemValue(selectedItem ?? defaultValue);
  });

  run(() => {
    filteredItems = items;
  });
  run(() => {
    filterByAutocomplete(autocompleteInput);
  });
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
  use:clickOutside={() => (opened = false)}
  tabindex="0"
  onkeydown={handleKeyDown}
>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="selected-item-container">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="selected-item" onclick={selectedClick}>
      {#if selectedItemValue != null && (multiple ? selectedItemValue.length > 0 : true)}
        {#if selected}{@render selected({ selectedItemValue, itemText, multiple, })}{:else}
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
        {/if}
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
        oninput={(e) => (opened = true)}
        onclick={(e) => (opened = true)}
      />
    {:else if autocomplete}
      <div
        class="autocomplete-placeholder"
        onclick={() => (opened = true)}
      ></div>
    {/if}
    {#if clearable && selectedItemValue != null && (multiple ? selectedItemValue.length > 0 : true)}
      <Button
        onlyIcon
        style="height: 30px;"
        icon={CloseIcon}
        size="small"
        type="secondary"
        iconSize="auto"
        noBorder
        onclick={clear}
      ></Button>
    {/if}
    <Button
      onlyIcon
      style="height: 30px;width:30px;"
      iconSize="auto"
      size="small"
      icon={opened ? ChevronUpIcon : ChevronDownIcon}
      type="primary"
      noBorder
      onclick={() => (opened = !opened)}
    ></Button>
    {@render actions?.()}
  </div>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <Flyout
    bind:opened
    caller={menu}
    preventClickOutsideClose
    resizable
    
  >
    {#snippet children({ position })}
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
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="selected item" onclick={() => select(item)}>
            {#if children}{@render children({ item, multiple, itemText, selectedItemValue, comparer, index, focusedIndex, })}{:else}
              <Button
                size="medium"
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
            {/if}
          </div>
        {/each}
      </div>
          {/snippet}
    </Flyout>
</div>

<style lang="scss">
  @use "Select.scss";
</style>
