<script lang="ts">
  //models
  import type { ValueData } from "$data/models/base";

  import RadioButton from "../RadioButton/RadioButton.svelte";

  interface Props {
    options?: ValueData[];
    selectedValue?: any;
    onselect?: (event?: any) => void;
  }

  let { options = [], selectedValue = $bindable(null) ,
    onselect = null
  }: Props = $props();

  const onSelect= (item) => {
    if (selectedValue.value === item.value) return;
    selectedValue = item.value;
    onselect?.({ detail: { value: item } });
  };
</script>

<div class="radio-group">
  {#each options as value}
    <RadioButton
      value={value.value}
      label={value.label}
      selected={value.value === selectedValue}
      onselect={() => onSelect(value)}
    />
  {/each}
</div>

<style lang="scss">
  .radio-group {
    display: flex;
    flex-direction: row;
  }
</style>
