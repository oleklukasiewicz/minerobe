<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //icons
  import CheckIcon from "$icons/check.svg?raw";

  const dispatch = createEventDispatcher();

  export let style = "";
  export let value: boolean = false;
  export let label: string = null;
  
  const toggleValue = () => {
    value = !value;
    dispatch("change", { value });
    if (value) {
      dispatch("select");
    } else {
      dispatch("unselect");
    }
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="checkbox-container" {style} on:click={toggleValue}>
  <div class="checkbox" class:selected={value}>
    {#if value}
      {@html CheckIcon}
    {/if}
  </div>
  {#if label}
    <span class="mc-font-simple">{label}</span>
  {/if}
</div>

<style lang="scss">
  @use "./Checkbox.scss";
</style>
