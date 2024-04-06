<script lang="ts">
  import CheckIcon from "$icons/check.svg?raw";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let value: boolean = false;
  export let label: string = null;
  const toggleValue = () => {
    value = !value;
    dispatch("change", { value });
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="checkbox-container">
  <div class="checkbox" on:click={toggleValue} class:selected={value}>
    {#if value}
      {@html CheckIcon}
    {/if}
  </div>
  {#if label}
    <span class="mc-font-simple">{label}</span>
  {/if}
</div>

<style lang="scss">
  @import "./Checkbox.scss";
</style>
