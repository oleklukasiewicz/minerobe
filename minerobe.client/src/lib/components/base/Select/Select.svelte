<script lang="ts">
  //services
  import { clickOutside } from "$src/helpers/data/componentHelper";

  //consts
  import { IS_MOBILE_VIEW } from "$src/data/static";

  //icons
  import ChevronUpIcon from "$icons/chevron-up.svg?raw";
  import ChevronDownIcon from "$icons/chevron-down.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import CheckBoxIcon from "$icons/checkbox.svg?raw";
  import CheckBoxOffIcon from "$icons/checkbox-off.svg?raw";

  //main imports
  //services
  //components
  import Button from "../Button/Button.svelte";
  //consts
  //icons
  import Flyout from "../Flyout/Flyout.svelte";
  import type { BaseSelectProps } from "$src/data/components";

  interface SelectProps extends BaseSelectProps {
    clickable?: boolean;
    sorter?: any;
    comparer?: any;
    separator?: string;
    multiple?: boolean;
    selected?: import("svelte").Snippet<[any]>;
    actions?: import("svelte").Snippet;
    children?: import("svelte").Snippet<[{
      item: any;
      multiple: boolean;
      itemText: any;
      index: number;
      focusedIndex: number;
      selected: boolean;
    }]>;
    onselectedClick?: (event?: any) => void;
  }

  let {
    items = [],
    value = $bindable(),
    placeholder = "Select",
    multiple = false,
    clickable = false,
    separator = ", ",
    opened = $bindable(false),
    itemText = null,
    itemValue = null,
    clearable = false,
    dropDownStyle = null,
    disabled = false,
    autocomplete = false,
    defaultValue = null,
    sorter = (a, b) => (a < b ? -1 : a > b ? 1 : 0),
    comparer = (selectedValues, item, isMultiple = false) => {
      return isMultiple
        ? selectedValues?.some((selectedItem) =>
            equalsValue(selectedItem, item),
          )
        : equalsValue(selectedValues, item);
    },
    selected,
    actions,
    children,
    onselect = null,
    onselectedClick = null,
    onclear = null,
  }: SelectProps = $props();

  const normalizeValue = (valueToNormalize) => {
    if (!itemValue) return valueToNormalize;

    if (valueToNormalize != null && typeof valueToNormalize === "object")
      return valueToNormalize[itemValue];

    return valueToNormalize;
  };

  const getItemValue = (item) => normalizeValue(item);

  const getItemText = (item) => {
    if (item == null) return "";
    if (itemText == null) return item;
    return item[itemText];
  };

  const equalsValue = (a, b) => normalizeValue(a) === normalizeValue(b);

  let menu = $state(null);
  let itemsContainer = $state(null);
  let inputComponent = $state(null);
  let autocompleteInput = $state(null);
  let filteredItems = $derived.by(() => {
    if (!autocomplete) return items;

    if (autocompleteInput?.length == 0 || autocompleteInput == null)
      return items;

    const normalizedInput = autocompleteInput.toLowerCase();
    return items.filter((i) => {
      return String(getItemText(i)).toLowerCase().includes(normalizedInput);
    });
  });
  const sortedFilteredItems = $derived([...filteredItems].sort(sorter));
  let focusedIndex = $state(-1);

  let selectedItems = $state([]);
  let selectedItemValues = $derived(selectedItems.map((i) => getItemValue(i)));
  let selectedItemsText = $derived(
    selectedItems.map((i) => getItemText(i)).join(separator ?? ", "),
  );
  let selectedItemValue: any | any[] = $derived(
    multiple ? selectedItemValues : selectedItemValues[0],
  );
  let selectedItemText: any | any[] = $derived(selectedItemsText);
  let hasSelection = $derived(
    multiple
      ? Array.isArray(selectedItemValue) && selectedItemValue.length > 0
      : selectedItemValue != null,
  );

  const select = (item) => {
    const alreadySelected = selectedItems.some((i) => equalsValue(i, item));
    let nextSelectedItems = [];

    if (multiple) {
      if (alreadySelected)
        nextSelectedItems = selectedItems.filter((i) => !equalsValue(i, item));
      else nextSelectedItems = [...selectedItems, item];
    } else {
      nextSelectedItems = [item];
      opened = autocomplete;
    }

    selectedItems = nextSelectedItems;

    const nextSelectedValues = nextSelectedItems.map((i) => getItemValue(i));
    const nextValue = multiple
      ? nextSelectedValues
      : (nextSelectedValues[0] ?? null);

    if (autocomplete) {
      autocompleteInput = "";
      requestAnimationFrame(() => {
        inputComponent?.focus();
      });
    }

    value = nextValue;
    onselect?.({ item: nextValue });
  };
  const selectedClick = () => {
    if (clickable) {
      onselectedClick?.({ item: selectedItemValue });
    } else {
      opened = true;
    }
  };
  const clear = () => {
    selectedItems = [];
    const clearedValue = multiple ? [] : null;
    value = clearedValue;
    onclear?.({ item: clearedValue });
  };
  const isSelected = (item) =>
    comparer(multiple ? selectedItems : selectedItems[0], item, multiple);
  let updateSelectedItem = (value) => {
    const values = (Array.isArray(value) ? value : [value]).filter(
      (v) => v != null,
    );

    const nextSelectedItems = items.filter((i) =>
      values.some((v) => equalsValue(i, v)),
    );

    const hasSameSelection =
      selectedItems.length === nextSelectedItems.length &&
      selectedItems.every((selectedItem, index) =>
        equalsValue(selectedItem, nextSelectedItems[index]),
      );

    if (!hasSameSelection) {
      selectedItems = nextSelectedItems;
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

  $effect(() => {
    updateSelectedItem(value ?? defaultValue);
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
      {#if hasSelection}
        {#if selected}{@render selected({
            selectedItemValue,
            itemText,
            multiple,
          })}{:else if clickable && selectedItemValue != null}
          <Button
            textAlign="left"
            size="small"
            type={clickable ? "primary" : "quaternary"}
          >
            {selectedItemText}</Button
          >
        {:else}
          <div class="selected-item-default">
            {#if hasSelection}
              {selectedItemText}
            {/if}
          </div>
        {/if}
      {:else if !autocomplete}
        <div class="select-placeholder">{placeholder}</div>
      {/if}
    </div>
    {#if autocomplete && (multiple ? true : !hasSelection)}
      <input
        bind:this={inputComponent}
        type="text"
        {placeholder}
        bind:value={autocompleteInput}
        class="autocomplete-input"
        oninput={() => (opened = true)}
        onclick={() => (opened = true)}
      />
    {:else if autocomplete}
      <div
        class="autocomplete-placeholder"
        onclick={() => (opened = true)}
      ></div>
    {/if}
    {#if clearable && hasSelection}
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
  <Flyout bind:opened caller={menu} preventClickOutsideClose resizable>
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
        {#each sortedFilteredItems as item, index}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="selected item" onclick={() => select(item)}>
            {#if children}{@render children({
                item,
                multiple,
                itemText,
                index,
                focusedIndex,
                selected: isSelected(item),
              })}{:else}
              <Button
                size="medium"
                flat
                noBorder
                type={isSelected(item) || index == focusedIndex
                  ? "primary"
                  : "quaternary"}
                icon={multiple
                  ? isSelected(item)
                    ? CheckBoxIcon
                    : CheckBoxOffIcon
                  : null}
                focused={index == focusedIndex}
                label={getItemText(item)}
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
