<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import type { ValueData } from "$data/models/base";

  export let value: ValueData = null;
  export let label: string = null;
  export let selected: boolean = false;

  const dispatch = createEventDispatcher();

  const onSelect = () => {
    if (selected) return;
    selected = true;
    dispatch("select", { value: value });
  };
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<a class:selected class="radio-button" on:click={onSelect}>
  {label}
</a>

<style lang="scss">
  @use "RadioButton.scss";
</style>
