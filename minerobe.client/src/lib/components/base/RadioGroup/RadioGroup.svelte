<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import type { ValueData } from "$data/models/base";
  //compoennts
  import RadioButton from "../RadioButton/RadioButton.svelte";

  export let options: ValueData[] = [];
  export let selectedValue = null;

  const dispatch = createEventDispatcher();

  const onSelect = (item) => {
    if (selectedValue.value === item.value) return;
    selectedValue = item.value;
    dispatch("select", { value: item });
  };
</script>

<div class="radio-group">
  {#each options as value}
    <RadioButton
      value={value.value}
      label={value.label}
      selected={value.value === selectedValue}
      on:select={() => onSelect(value)}
    />
  {/each}
</div>

<style lang="scss">
  .radio-group {
    display: flex;
    flex-direction: row;
  }
</style>
