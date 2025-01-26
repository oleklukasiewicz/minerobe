<script lang="ts">
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import MenuItem from "$lib/components/base/MenuItem/MenuItem.svelte";
  import MenuItemHeader from "$lib/components/base/MenuItemHeader/MenuItemHeader.svelte";
  import { IS_MOBILE_VIEW } from "$src/data/static";
  import MenuIcon from "$src/icons/menu.svg?raw";
  import ContactIcon from "$icons/contact.svg?raw";
  import ZapIcon from "$icons/zap.svg?raw";
  import AvatarIcon from "$icons/avatar.svg?raw";
  import LoginIcon from "$icons/login.svg?raw";
  import UsersIcon from "$icons/users.svg?raw";
  import DashboardIcon from "$icons/dashboard.svg?raw";
  import MenuSeparator from "$lib/components/base/MenuSeparator/MenuSeparator.svelte";
  import { page } from "$app/stores";
  import { logoutUser } from "$src/api/auth";
  import { navigateToHome } from "$src/helpers/other/navigationHelper";

  let selectedView = "overview";

  $: selectedView = $page.route.id.split("/")[2] || "overview";

  let menuOpened = true;

  const SignOut = async () => {
    await logoutUser();
    navigateToHome();
  };
</script>

<div id="profile-view">
  <div id="profile-navigation">
    <div>
      <Menu let:opened let:top opened={menuOpened} top={$IS_MOBILE_VIEW}>
        {#if !$IS_MOBILE_VIEW}
          <MenuItemHeader
            label="Profile"
            icon={MenuIcon}
            {opened}
            on:click={() => (menuOpened = !menuOpened)}
          />
        {/if}
        <MenuItem
          label="Overview"
          {opened}
          {top}
          icon={DashboardIcon}
          href="/profile"
          selected={selectedView == "overview"}
        />
        <MenuItem
          label="Profile Data"
          {opened}
          {top}
          icon={ContactIcon}
          selected={selectedView == "info"}
          href="/profile/info"
        />
        <MenuItem
          label="Current Skin"
          {opened}
          {top}
          icon={UsersIcon}
          selected={selectedView == "skin"}
          href="/profile/skin"
        />
        <MenuItem
          label="Base Texture"
          {opened}
          {top}
          icon={AvatarIcon}
          selected={selectedView == "base"}
          href="/profile/base"
        />
        <MenuSeparator />
        <MenuItem
          label="Minecraft Account"
          {opened}
          {top}
          icon={ZapIcon}
          selected={selectedView == "minecraft"}
          href="/profile/minecraft"
        />
        <MenuItem
          slot="footer"
          opened={menuOpened}
          label="Sign Out"
          icon={LoginIcon}
          on:click={SignOut}
        />
      </Menu>
    </div>
  </div>
  <div id="profile-content">
    <slot />
  </div>
</div>

<style lang="scss">
  @use "layout_style.scss";
</style>
