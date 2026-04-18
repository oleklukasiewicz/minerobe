<script lang="ts">
  import type { BaseButtonProps } from "$src/data/components";

  interface MenuItemProps extends BaseButtonProps {
    disabled?: boolean;
    badgelabel?: string;
    selected?: boolean;
    opened?: boolean;
    top?: boolean;
  }

  let {
    label,
    icon = null,
    href = null,
    disabled = false,
    badgelabel = null,
    selected = false,
    opened = $bindable(true),
    top = false,
    onclick = null,
  }: MenuItemProps = $props();
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<a
  class="menu-item"
  class:disabled
  {href}
  class:selected
  class:opened
  {onclick}
  class:top
  title={label}
>
  {#if icon}
    <div class="icon b-icon-medium">
      {@html icon}
    </div>
  {/if}
  {#if opened || top}
    <span class="menu-item-label">{label}</span>
    {#if badgelabel}
      <div class="badge">{badgelabel}</div>
    {/if}
  {/if}
</a>

<style lang="scss">
  .menu-item {
    user-select: none;
    text-decoration: none;
    cursor: pointer;
    display: flex;
    box-sizing: border-box;
    font-size: var(--size-font-base);
    font-family: minecraft-simple;
    box-sizing: border-box;
    padding: 8px 8px 6px 8px;
    color: var(--color-theme-font);
    gap: 8px;
    min-height: 38px;
    &.opened {
      padding: 8px 16px 6px 8px;
    }
    &.top {
      flex: 1;
      text-align: center;
      display: block;
      height: 58px;
      padding: 7px 8px;
    }
    &:hover {
      background: var(--color-theme-D2);
    }
    &:active {
      background: var(--color-active-L1);
      color: var(--color-accent-font);
    }
    span {
      margin: 5px 0px;
      flex: 1;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .badge {
      margin: 5px 8px 5px 0px;
    }
    &.selected {
      background: var(--color-accent);
      color: var(--color-accent-font);
      line-height: var(--size-font-base);
      font-family: minecraft;
      span {
        margin: 4px 0px 6px;
      }
      &:hover {
        background: var(--color-accent-D1);
      }
      &:active {
        background: var(--color-active-D1);
      }
    }
  }
</style>
