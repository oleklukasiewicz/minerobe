<script lang="ts">
  import { run } from 'svelte/legacy';

  //main imports
    //models
  import { SortOption } from "$src/data/models/base";
  //components
  import Button from "../Button/Button.svelte";
  import Select from "../Select/Select.svelte";
  //icons
  import ArrowUpIcon from "$icons/arrow-up.svg?raw";
  import ArrowDownIcon from "$icons/arrow-down.svg?raw";

  interface Props {
    items?: any[];
    placeholder?: string;
    selectedItem?: any;
    opened?: boolean;
    itemText?: string;
    itemValue?: string;
    clearable?: boolean;
    dropDownStyle?: any;
    disabled?: boolean;
    autocomplete?: boolean;
    isDescending?: boolean;
    onselect?: (event?: any) => void;
    onclear?: (event?: any) => void;
  }

  let {
    items = $bindable([]),
    placeholder = $bindable("Sort by"),
    selectedItem = $bindable(),
    opened = $bindable(false),
    itemText = $bindable("label"),
    itemValue = $bindable("value"),
    clearable = $bindable(false),
    dropDownStyle = $bindable(null),
    disabled = $bindable(false),
    autocomplete = $bindable(false),
    isDescending = $bindable(false),
    onselect = null,
    onclear = null
  }: Props = $props();

  const onSelect= (e) => {
    var sortOption: SortOption = new SortOption();
    sortOption.value = e.detail?.item?.value;
    sortOption.isDesc = isDescending;
    selectedItem = sortOption;
    onselect?.({ detail: { option: sortOption } });
  };
  const onDirectionClick= () => {
    isDescending = !isDescending;
    var sortOption: SortOption = new SortOption();
    sortOption.value = selectedItem?.value;
    sortOption.isDesc = isDescending;
    selectedItem = sortOption;
    onselect?.({ detail: { option: sortOption } });
  };

  const onSelectedUpdate= (v) => {
    isDescending = v?.isDesc;
  };

  run(() => {
    onSelectedUpdate(selectedItem);
  });
</script>

<div class="sort-select">
  <div class="select-container">
    <Select
      onclear={onclear}
      onselect={onSelect}
      {items}
      {placeholder}
      bind:selectedItem
      bind:opened
      {itemText}
      {itemValue}
      {clearable}
      {dropDownStyle}
      {disabled}
      {autocomplete}
      defaultValue={new SortOption()}
    >
      {#snippet actions()}
            <div class="direction" >
          <Button
            disabled={!selectedItem?.value}
            onlyIcon
            size="auto"
            noBorder
            icon={isDescending ? ArrowDownIcon : ArrowUpIcon}
            onclick={onDirectionClick}
          ></Button>
        </div>
          {/snippet}
    </Select>
  </div>
</div>

<style lang="scss">
  .sort-select {
    flex: 1;
    display: flex;
    flex-direction: row;
    .select-container {
      flex: 1;
    }
    .direction {
      border-left: 2px solid var(--color-theme-D6);
      width: 30px;
    }
  }
</style>
