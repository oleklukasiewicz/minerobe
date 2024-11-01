<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import RadioButton from "../RadioButton/RadioButton.svelte";
  import type { ValueData } from "$src/model/base";

  export let options: ValueData[] = [];
  let selectedValue = null;
  const dispatch = createEventDispatcher();

  const onSelect = (item) => {
    if (selectedValue === item) return;
    selectedValue = item;
    dispatch("select", { value: item });
  };
</script>

<div class="radio-group">
  {#each options as value}
    <RadioButton
      value={value.value}
      label={value.label}
      selected={value === selectedValue}
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
