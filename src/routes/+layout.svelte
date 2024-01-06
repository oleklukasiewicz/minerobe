<script lang="ts">
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import NavigationItem from "$lib/NavigationItem/NavigationItem.svelte";
  import "$locales/locales";
  import { locale, waitLocale, isLoading, _ } from "svelte-i18n";

  import MenuIcon from "$src/icons/menu.svg?raw";
  import SubscriptionIcon from "$src/icons/subscriptions.svg?raw";
  import AvatarIcon from "$src/icons/avatar.svg?raw";

  import { onMount } from "svelte";
  import { currentUser, isMobileView, setup } from "$src/data/cache";
  import { getCurrentUser, loginUser, logoutUser } from "$src/api/auth";
  import { navigateToProfile } from "$src/helpers/navigationHelper";

  export const load = async () => {
    if (browser) {
      locale.set(window.navigator.language);
    }
    await waitLocale();
  };
  onMount(async () => {
    setup();
    await getCurrentUser();
    if ($currentUser == null) {
      await logoutUser();
    }
  });
  const profileAction = async () => {
    if ($currentUser) {
      navigateToProfile();
      isMenuOpened = false;
    } else {
      await loginUser();
      isMenuOpened = false;
    }
  };
  let isMenuOpened = false;
</script>

{#if !$isLoading}
  <div id="nav" class:opened={isMenuOpened} class:closed={!isMenuOpened}>
    <button
      class="icon menu-button dark"
      on:click={() => (isMenuOpened = !isMenuOpened)}
    >
      {@html MenuIcon}
    </button>
    <a id="nav-title" href={"/"}>
      <img src="/texture/logo.png" alt="Logo" />
    </a>
    <div class="items">
      <NavigationItem
        label={$_("navigation.home")}
        viewId=""
        on:click={() => (isMenuOpened = false)}
      />
      <NavigationItem
        label={$_("navigation.explore")}
        viewId="explore"
        on:click={() => (isMenuOpened = false)}
      />
      <NavigationItem
        label={$_("navigation.design")}
        viewId="design"
        on:click={() => (isMenuOpened = false)}
      />

      {#if $isMobileView}
        <div class="spacer" style="flex:1;" />
        <button class="dark" style="text-align: left;" on:click={profileAction}>
          {#if $currentUser != null}
            <img src={$currentUser.avatar} alt="Avatar" />
            {$currentUser?.name}
          {:else}
            <span class="icon-small"> {@html AvatarIcon}</span>
            <span
              style="vertical-align: top;
            margin-top: 4px;
            display: inline-block;">{$_("navigation.login")}</span
            >
          {/if}
        </button>
      {/if}
    </div>
    {#if !$isMobileView}
      <div class="spacer" style="flex:1;" />
    {/if}
    <a href="/wardrobe" class:disabled={$currentUser == null}>
      <button
        class="icon subscribtion-button dark"
        class:selected={$page.route.id == "/wardrobe"}
      >
        <span class="icon-small"> {@html SubscriptionIcon}</span>
      </button>
    </a>
    {#if !$isMobileView}
      <button class="icon avatar-button dark" on:click={profileAction}>
        {#if $currentUser != null}
          <img src={$currentUser.avatar} alt="Avatar" />
        {:else}
          <span class="icon-small"> {@html AvatarIcon}</span>
        {/if}
      </button>
    {/if}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="nav-filler" on:click={() => (isMenuOpened = false)} />
  </div>
  <div id="view">
    <slot />
  </div>
{/if}

<style lang="scss">
  @import "layout_style.scss";
</style>
