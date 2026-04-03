<script lang="ts">
  //icons
  import ChevronUpIcon from "$icons/chevron-up.svg?raw";
  import ChevronDownIcon from "$icons/chevron-down.svg?raw";

  import Button from "../Button/Button.svelte";
  import { BaseProps } from "$src/data/components";
  //icons

  interface ExpanderProps extends BaseProps {
    icon?: any;
    label?: any;
    group?: any;
    opened?: boolean;
    value?: any;
    children?: import("svelte").Snippet;
  }

  let {
    icon = null,
    label = null,
    group = $bindable(null),
    opened = $bindable(false),
    value = null,
    children,
    disabled = false,
  }: ExpanderProps = $props();

  const toggleExpander = () => {
    if (group == null) opened = !opened;
    else {
      if (group != value) group = value;
      else group = "none";
    }
  };
</script>

<div
  class="expander"
  class:opened={group == null ? opened : group == value}
  class:disabled
>
  <div class="expander-header">
    <div class="expander-header-data">
      {#if icon}
        <span class="icon-small">
          {@html icon}
        </span>
      {/if}
      {#if label}
        <span class="expander-label">{label}</span>
      {/if}
    </div>
    <span class="expander-toggle">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <Button
        type="quaternary"
        onclick={toggleExpander}
        onlyIcon
        icon={(group == null ? opened : group == value)
          ? ChevronUpIcon
          : ChevronDownIcon}
      />
    </span>
  </div>
  <div class="expander-content">
    <div>
      {@render children?.()}
    </div>
  </div>
</div>

<style lang="scss">
  @use "Expander.scss";
</style>
