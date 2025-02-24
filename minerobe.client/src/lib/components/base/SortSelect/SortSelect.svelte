<script lang="ts">
  import Button from "../Button/Button.svelte";
  import Select from "../Select/Select.svelte";
  import ArrowUpIcon from "$icons/arrow-up.svg?raw";
  import ArrowDownIcon from "$icons/arrow-down.svg?raw";
  import { createEventDispatcher } from "svelte";
  import { SortOption } from "$src/data/models/base";

  const dispatch = createEventDispatcher();

  export let items: any[] = [];
  export let placeholder: string = "Sort by";
  export let selectedItem = null;
  export let opened = false;
  export let itemText = "label";
  export let itemValue = "value";
  export let clearable = false;
  export let dropDownStyle = null;
  export let disabled = false;
  export let autocomplete = false;
  export let isDescending = false;

  const onSelect = (e) => {
    var sortOption: SortOption = new SortOption();
    sortOption.value = e.detail?.item?.value;
    sortOption.isDesc = isDescending;
    selectedItem = sortOption;
    dispatch("select", { option: sortOption });
  };
  const onDirectionClick = () => {
    isDescending = !isDescending;
    var sortOption: SortOption = new SortOption();
    sortOption.value = selectedItem.value;
    sortOption.isDesc = isDescending;
    selectedItem = sortOption;
    dispatch("select", { option: sortOption });
  };

  const onSelectedUpdate = (v) => {
    isDescending = v?.isDesc;
  };

  $: onSelectedUpdate(selectedItem);
</script>

<div class="sort-select">
  <div class="select-container">
    <Select
      on:clear
      on:select={onSelect}
      bind:items
      bind:placeholder
      bind:selectedItem
      bind:opened
      bind:itemText
      bind:itemValue
      bind:clearable
      bind:dropDownStyle
      bind:disabled
      bind:autocomplete
      defaultValue={new SortOption()}
    >
      <div class="direction" slot="actions">
        <Button
          disabled={!selectedItem?.value}
          onlyIcon
          size="auto"
          noBorder
          icon={isDescending ? ArrowDownIcon : ArrowUpIcon}
          on:click={onDirectionClick}
        ></Button>
      </div>
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
      width: 32px;
    }
  }
</style>
