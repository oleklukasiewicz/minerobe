<script lang="ts">
  //main imports
    //icons
  import CheckIcon from "$icons/check.svg?raw";

  interface Props {
    style?: string;
    value?: boolean;
    label?: string;
    onchange?: (event?: any) => void;
    onselect?: (event?: any) => void;
    onunselect?: (event?: any) => void;
  }

  let { style = "", value = $bindable(false), label = null ,
    onchange = null,
    onselect = null,
    onunselect = null
  }: Props = $props();
  
  const toggleValue = () => {
    value = !value;
    onchange?.({ detail: { value } });
    if (value) {
      onselect?.();
    } else {
      onunselect?.();
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
