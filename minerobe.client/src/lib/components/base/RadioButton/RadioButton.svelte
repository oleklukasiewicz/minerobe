<script lang="ts">
  //models
  import type { ValueData } from "$data/models/base";

  interface Props {
    value?: ValueData;
    label?: string;
    selected?: boolean;
    onselect?: (event?: any) => void;
  }

  let { value = null, label = null, selected = $bindable(false) ,
    onselect = null
  }: Props = $props();

  const onSelect= () => {
    if (selected) return;
    selected = true;
    onselect?.({ detail: { value: value } });
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
