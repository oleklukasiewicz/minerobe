<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import RadioButton from "../RadioButton/RadioButton.svelte";

  export let values: any[] = [];
  let selectedValue = null;
  const dispatch = createEventDispatcher();

  const onSelect = (item) => {
    if (selectedValue === item) return;
    selectedValue = item;
    dispatch("select", { value: item });
  };
</script>

<div class="radio-group">
  {#each values as value}
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
