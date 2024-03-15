<script lang="ts">
  import { browser } from "$app/environment";
  import NavigationItem from "$component/other/NavigationItem/NavigationItem.svelte";
  import "$locales/locales";
  import { locale, waitLocale, isLoading, _ } from "svelte-i18n";

  import MenuIcon from "$src/icons/menu.svg?raw";
  import SubscriptionIcon from "$src/icons/subscriptions.svg?raw";
  import AvatarIcon from "$src/icons/avatar.svg?raw";

  import { onMount } from "svelte";
  import {
    currentToasts,
    currentUser,
    hideToast,
    isMobileView,
    preSetup,
    setup,
    snapshotTemporaryNode,
  } from "$src/data/cache";
  import { getCurrentUser, loginUser } from "$src/api/auth";
  import { navigateToProfile } from "$src/helpers/other/navigationHelper";
  import Toast from "$component/base/Toast/Toast.svelte";
  export const load = async () => {
    if (browser) {
      locale.set(window.navigator.language);
    }
    await waitLocale();
  };
  onMount(async () => {
    await preSetup();
    await getCurrentUser();
    setup();
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
  {#each $currentToasts as toast}
    <Toast
      message={toast.message}
      icon={toast.icon}
      mobile={$isMobileView}
      show={true}
      closeable={toast.closeable}
      type={toast.type}
      on:click={toast.action}
      on:close={() => hideToast(toast)}
    />
  {/each}
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
        on:click={() => {
          isMenuOpened = false;
        }}
      />
      <NavigationItem
        label={$_("navigation.explore")}
        viewId="explore"
        on:click={() => (isMenuOpened = false)}
      />
      <NavigationItem
        disabled={$currentUser == null}
        label={$_("navigation.design")}
        viewId="design"
        on:click={() => (isMenuOpened = false)}
      />

      {#if $isMobileView}
        <div class="spacer" style="flex:1;" />
        <NavigationItem
        on:click={profileAction}
        label={$currentUser ? $currentUser?.name : $_("navigation.login")}
        iconImage={$currentUser ? $currentUser?.avatar : null}
        icon={$currentUser == null ? AvatarIcon : null}
        viewId={"profile"}
        customCall
      />
      {/if}
    </div>
    {#if !$isMobileView}
      <div class="spacer" style="flex:1;" />
    {/if}
    <NavigationItem
      icon={SubscriptionIcon}
      minimal
      viewId="wardrobe"
      disabled={$currentUser?.id == null}
    />
    {#if !$isMobileView}
      <NavigationItem
        on:click={profileAction}
        minimal
        iconImage={$currentUser ? $currentUser?.avatar : null}
        icon={$currentUser == null ? AvatarIcon : null}
        viewId={"profile"}
        customCall
      />
    {/if}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="nav-filler" on:click={() => (isMenuOpened = false)} />
  </div>
  <div id="view">
    <slot />
  </div>
{/if}
<div
  style="min-width: 300px;min-height:300px;max-width:300px; max-height:300px;display:none"
  bind:this={$snapshotTemporaryNode}
></div>

<style lang="scss">
  @import "layout_style.scss";
</style>
