<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import type { ValueData } from "$data/models/base";

  interface Props {
    value?: ValueData;
    label?: string;
    selected?: boolean;
  }

  let { value = null, label = null, selected = $bindable(false) }: Props = $props();

  const dispatch = createEventDispatcher();

  const onSelect= () => {
    if (selected) return;
    selected = true;
    dispatch("select", { value: value });
  };
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
