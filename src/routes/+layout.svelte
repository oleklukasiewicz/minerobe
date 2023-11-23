<script lang="ts">
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import NavigationItem from "$lib/NavigationItem/NavigationItem.svelte";
  import "$locales/locales"; // Import to initialize. Important :)
  import { locale, waitLocale, isLoading, _ } from "svelte-i18n";

  import MenuIcon from "$src/icons/menu.svg?raw";
  import SubscriptionIcon from "$src/icons/subscriptions.svg?raw";
  import AvatarIcon from "$src/icons/avatar.svg?raw";

  import { onMount } from "svelte";
  import { currentUser} from "$src/data/cache";
  import {loginUser, logoutUser } from "$src/api/auth";

  export const load = async () => {
    if (browser) {
      locale.set(window.navigator.language);
    }
    await waitLocale();
  };
  onMount(async () => {
    await loginUser();
  });

  const toggleLogin = async () => {
    if ($currentUser != null) {
      await logoutUser();
    } else {
      await loginUser();
    }
  };
  let isMenuOpened = false;
</script>

{#if !$isLoading}
  <div id="nav" class:opened={isMenuOpened} class:closed={!isMenuOpened}>
    <button
      class="icon menu-button"
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
    </div>
    <div class="spacer" style="flex:1;" />
    <a href="/wardrobe">
      <button
        class="icon subscribtion-button dark"
        class:selected={$page.route.id == "/wardrobe"}
      >
       <span class="icon-small"> {@html SubscriptionIcon}</span>
      </button>
    </a>
    <button class="icon avatar-button dark" on:click={toggleLogin}>
      {#if $currentUser != null}
        <img src={$currentUser.avatar} alt="Avatar" />
      {:else}
      <span class="icon-small"> {@html AvatarIcon}</span>
      {/if}
    </button>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="nav-filler" on:click={() => (isMenuOpened = false)} />
  </div>
  <div id="content">
    <slot />
  </div>
{/if}

<style lang="scss">
  @import "layout_style.scss";
</style>
