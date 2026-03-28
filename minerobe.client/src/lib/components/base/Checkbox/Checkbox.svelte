<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //icons
  import CheckIcon from "$icons/check.svg?raw";

  const dispatch = createEventDispatcher();

  interface Props {
    style?: string;
    value?: boolean;
    label?: string;
  }

  let { style = "", value = $bindable(false), label = null }: Props = $props();
  
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

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="checkbox-container" {style} onclick={toggleValue}>
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
