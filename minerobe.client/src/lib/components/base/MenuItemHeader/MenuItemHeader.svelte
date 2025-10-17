<script lang="ts">
  export let label: string;
  export let icon: string = null;
  export let href: string = null;
  export let disabled: boolean = false;
  export let badgelabel: string = null;
  export let selected: boolean = false;
  export let opened = true;
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<a class="menu-item-header" class:disabled {href} class:selected on:click>
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
