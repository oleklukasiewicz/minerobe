<script lang="ts">
  //main imports
  import { page } from "$app/state";
  import type { BaseButtonProps } from "$src/data/components";

  interface NavigationItemProps extends BaseButtonProps {
    iconImage?: string;
    viewId?: string;
    onlyIcon?: boolean;
    children?: import("svelte").Snippet;
  }

  let {
    label = "",
    icon = "",
    iconImage = "",
    href = "",
    viewId = "",
    disabled = false,
    onlyIcon = false,
    onclick = null,
    children,
  }: NavigationItemProps = $props();
</script>

<a
  {href}
  class:onlyIcon
  class:selected={viewId?.length > 0
    ? page.route?.id?.startsWith("/" + viewId)
    : page.route?.id == "/"}
  class:disabled
  onclick={(event) => onclick?.(event)}
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
