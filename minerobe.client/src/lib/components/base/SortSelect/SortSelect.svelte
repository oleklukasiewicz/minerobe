<script lang="ts">
  //models
  import { SortOption } from "$src/data/models/base";

  //icons
  import ArrowUpIcon from "$icons/arrow-up.svg?raw";
  import ArrowDownIcon from "$icons/arrow-down.svg?raw";

  //main imports
    //models
  //components
  import Button from "../Button/Button.svelte";
  import Select from "../Select/Select.svelte";
  import type { BaseSelectProps } from "$src/data/components";
  //icons

  interface SortSelectProps extends BaseSelectProps{
    disabled?: boolean;
    autocomplete?: boolean;
    isDescending?: boolean;
    onselect?: (event?: any) => void;
    onclear?: (event?: any) => void;
  }

  let {
    items = $bindable([]),
    placeholder = $bindable("Sort by"),
    value = $bindable(),
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
  }: SortSelectProps = $props();

  const onSelect= (e) => {
    const selectedValue = e?.item;
    var sortOption: SortOption = new SortOption();
    sortOption.value = selectedValue?.value ?? selectedValue;
    sortOption.isDesc = isDescending;
    value = sortOption;
    onselect?.({ option: sortOption });
  };
  const onDirectionClick= () => {
    isDescending = !isDescending;
    var sortOption: SortOption = new SortOption();
    sortOption.value = value?.value;
    sortOption.isDesc = isDescending;
    value = sortOption;
    onselect?.({ option: sortOption });
  };

  const onSelectedUpdate= (v) => {
    isDescending = v?.isDesc;
  };

  $effect(() => {
    onSelectedUpdate(value);
  });
</script>

<div class="sort-select">
  <div class="select-container">
    <Select
      onclear={onclear}
      onselect={onSelect}
      {items}
      {placeholder}
      bind:value
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
            disabled={!value?.value}
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
