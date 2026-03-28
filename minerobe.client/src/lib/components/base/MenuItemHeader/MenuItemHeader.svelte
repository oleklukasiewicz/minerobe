<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  interface $$Events {
    click: MouseEvent;
  }
  interface Props {
    label: string;
    icon?: string;
    href?: string;
    disabled?: boolean;
    badgelabel?: string;
    selected?: boolean;
    opened?: boolean;
  }

  let {
    label,
    icon = null,
    href = null,
    disabled = false,
    badgelabel = null,
    selected = false,
    opened = true
  }: Props = $props();
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<a class="menu-item-header" class:disabled {href} class:selected onclick={bubble('click')}>
  {#if icon}
    <div class="icon b-icon-medium">
      {@html icon}
    </div>
  {/if}
  {#if opened}
    <span class="menu-item-label">{label}</span>
    {#if badgelabel}
      <div class="badge">{badgelabel}</div>
    {/if}
  {/if}
</a>

<style lang="scss">
  .menu-item-header {
    color:var(--color-theme-font);
    user-select: none;
    cursor: pointer;
    display: flex;
    box-sizing: border-box;
    font-size: var(--size-font-base);
    font-family: minecraft;
    box-sizing: border-box;
    padding: 7px 9px 7px 7px;
    gap: 8px;
    &:hover {
      background: var(--color-theme-D2);
    }
    &:active {
      background: var(--color-active-D1);
      color: var(--color-accent-font);
    }
    span {
      margin: 2px 0px;
      flex: 1;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .badge {
      margin: 5px 8px 5px 0px;
    }
    .icon
    {
        height: 24px;
    }
    &.selected {
      background: var(--color-accent);
      color: var(--color-accent-font);
      line-height: var(--size-font-base);
      font-family: minecraft;
      &:hover {
        background: var(--color-accent-D1);
      }
      &:active {
        background: var(--color-active-D1);
      }
    }
  }
</style>
