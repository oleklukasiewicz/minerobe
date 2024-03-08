<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import MenuItem from "../MenuItem/MenuItem.svelte";
  import MenuItemHeader from "../MenuItemHeader/MenuItemHeader.svelte";
  import MenuItemSeparator from "../MenuItemSeparator/MenuItemSeparator.svelte";

  const dispatch = createEventDispatcher();

  export let open: boolean = false;
  export let label: string = null;
  export let items: any[] = [];
  export let footerItems: any[] = [];

  const onSelect = (item) => {
   dispatch("select", item);
  };
</script>

<div class="menu">
  <div class="header">
    {#if label && open}
      <span>{label}</span>
    {/if}
  </div>
  <div class="items">
    {#each items as item}
      {#if item.type === "separator"}
        <MenuItemSeparator minimal={!open} />
      {:else if item.type === "header"}
        <MenuItemHeader {...item} minimal={!open} />
      {:else}
        <MenuItem {...item} minimal={!open} on:click={()=> onSelect(item)} />
      {/if}
    {/each}
    <slot />
  </div>
  <div class="footer">
    {#each footerItems as item}
      {#if item.type === "separator"}
        <MenuItemSeparator minimal={!open} />
      {:else if item.type === "header"}
        <MenuItemHeader {...item} minimal={!open} />
      {:else}
        <MenuItem {...item} minimal={!open} on:click={()=> onSelect(item)}/>
      {/if}
    {/each}
    <slot name="footer" />
  </div>
</div>

<style lang="scss">
  @import "Menu.scss";
</style>
