<script lang="ts">
  //models
  import type { ValueData } from "$data/models/base";
  import type { BaseSelectableProps } from "$src/data/components";
  import { on } from "svelte/events";

  interface RadioButtonProps extends BaseSelectableProps {
    value?: ValueData;
    label?: string;
  }

  let {
    value = null,
    label = null,
    selected = $bindable(false),
    onselect = null,
    onunselect = null,
    onchange = null,
  }: RadioButtonProps = $props();

  const onSelect = () => {
    onchange?.({ value });
    selected = true;
    onselect?.({ value });
  };

  $effect(() => {
    if (!selected) onunselect?.({ value });
  });
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<a class:selected class="radio-button" onclick={onSelect}>
  {label}
</a>

<style lang="scss">
  @use "RadioButton.scss";
</style>
