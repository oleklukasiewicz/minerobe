<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import MenuItem from "../MenuItem/MenuItem.svelte";
  import MenuItemHeader from "../MenuItemHeader/MenuItemHeader.svelte";
  import MenuItemSeparator from "../MenuItemSeparator/MenuItemSeparator.svelte";
  import MenuIcon from "$src/icons/menu.svg?raw";

  const dispatch = createEventDispatcher();

  export let open: boolean = false;
  export let label: string = null;
  export let items: any[] = [];
  export let footerItems: any[] = [];
  export let value: any = null;
  export let top: boolean = false;
  export let toggleable: boolean = true;
  export let comparer: (a: any, b: any) => boolean = (a, b) => a == b;

  const onSelect = (item) => {
    dispatch("select", item);
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="menu" on:click class:top class:open>
  <div class="header">
    {#if toggleable}
      <MenuItem minimal icon={MenuIcon} on:click={() => (open = !open)} {top}>
        {#if label && open}
          <span>{label}</span>
        {/if}
      </MenuItem>
    {/if}
    {#if label && open && !toggleable}
      <span>{label}</span>
    {/if}
  </div>
  <div class="items">
    {#each items as item}
      {#if item.type === "separator"}
        <MenuItemSeparator minimal={!open} />
      {:else if item.type === "header"}
        <MenuItemHeader label={item.label} minimal={!open} />
      {:else}
        <MenuItem
          {top}
          icon={item.icon}
          label={item.label}
          badge={item.badge}
          minimal={!open}
          on:click={() => onSelect(item)}
          selected={comparer(item, value)}
        />
      {/if}
    {/each}
    <slot />
  </div>
  <div class="footer">
    {#each footerItems as item}
      {#if item.type === "separator"}
        <MenuItemSeparator minimal={!open} />
      {:else if item.type === "header"}
        <MenuItemHeader label={item?.label} minimal={!open} />
      {:else}
        <MenuItem
          icon={item?.icon}
          label={item?.label}
          badge={item?.badge}
          minimal={!open}
          on:click={() => onSelect(item)}
          selected={comparer(item, value)}
        />
      {/if}
    {/each}
    <slot name="footer" />
  </div>
</div>

<style lang="scss">
  @use "Menu.scss";
</style>
