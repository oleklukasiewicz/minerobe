<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  interface $$Events {
    click: MouseEvent;
  }
  //main imports
  import { page } from "$app/stores";

  interface Props {
    label?: string;
    icon?: string;
    iconImage?: string;
    href?: string;
    viewId?: string;
    disabled?: boolean;
    onlyIcon?: boolean;
    onclick?: (event: MouseEvent) => void;
    children?: import('svelte').Snippet;
  }

  let {
    label = "",
    icon = "",
    iconImage = "",
    href = "",
    viewId = "",
    disabled = false,
    onlyIcon= false,
    onclick = null,
    children
  }: Props = $props();
</script>

<a
  {href}
  class:onlyIcon
  class:selected={viewId?.length > 0
    ? $page.route?.id?.startsWith("/" + viewId)
    : $page.route?.id == "/"}
  class:disabled
  onclick={(event) => {
    bubble('click')(event);
    onclick?.(event);
  }}
  title={label}
>
  <!-- svelte-ignore a11y_missing_attribute -->
  {#if iconImage}
    <img src={iconImage} />
  {/if}
  {#if icon}
    <span class="nav-icon icon-small">{@html icon}</span>
  {/if}
  {#if label && !onlyIcon}
    <span class="item-label">{label}</span>
  {/if}
  {@render children?.()}
</a>

<style lang="scss">
  @use "NavigationItem.scss";
</style>
