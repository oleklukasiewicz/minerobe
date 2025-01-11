<script lang="ts">
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import MenuItem from "$lib/components/base/MenuItem/MenuItem.svelte";
  import MenuItemHeader from "$lib/components/base/MenuItemHeader/MenuItemHeader.svelte";
  import { IS_MOBILE_VIEW } from "$src/data/static";
  import MenuIcon from "$src/icons/menu.svg?raw";
  import ContactIcon from "$icons/contact.svg?raw";
  import ZapIcon from "$icons/zap.svg?raw";
  import DashboardIcon from "$icons/dashboard.svg?raw";
  import MenuSeparator from "$lib/components/base/MenuSeparator/MenuSeparator.svelte";

  let menuOpened = false;
</script>

<div id="profile-view">
  <div id="profile-navigation">
    <Menu let:opened let:top opened={menuOpened} top={$IS_MOBILE_VIEW}>
      {#if !$IS_MOBILE_VIEW}
        <MenuItemHeader
          label="Profile"
          icon={MenuIcon}
          {opened}
          on:click={() => (menuOpened = !menuOpened)}
        />
      {/if}
      <MenuItem label="Overview" {opened} {top} icon={DashboardIcon} />
      <MenuItem label="Your Data" {opened} {top} icon={ContactIcon} />
      <MenuSeparator/>
      <MenuItem label="Minecraft Account" {opened} {top} icon={ZapIcon} />
    </Menu>
  </div>
  <div id="profile-content"></div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
