<script lang="ts">
  //icons
  import CheckIcon from "$icons/check.svg?raw";
  import type { BaseProps } from "$src/data/components";

  interface CheckBoxProps extends BaseProps {
    style?: string;
    value?: boolean;
    label?: string;
    onchange?: (event?: any) => void;
    onselect?: (event?: any) => void;
    onunselect?: (event?: any) => void;
  }

  let {
    style = "",
    value = $bindable(false),
    label = null,
    disabled = false,
    onchange = null,
    onselect = null,
    onunselect = null,
  }: CheckBoxProps = $props();

  const toggleValue = () => {
    value = !value;
    onchange?.({ value });
    if (value) onselect?.();
    else onunselect?.();
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="checkbox-container" {style} onclick={toggleValue} class:disabled>
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
