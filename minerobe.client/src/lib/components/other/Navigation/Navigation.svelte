<script lang="ts">
  import { isMobileView, currentUser } from "$src/data/cache";
  import { _ } from "svelte-i18n";
  import HomeIcon from "$src/icons/home.svg?raw";
  import SearchIcon from "$src/icons/search.svg?raw";
  import SubscriptionIcon from "$src/icons/subscriptions.svg?raw";
  import AvatarIcon from "$src/icons/avatar.svg?raw";
  import NavigationItem from "../NavigationItem/NavigationItem.svelte";
  import Search from "$lib/components/base/Search/Search.svelte";
  import { navigate, navigateToProfile } from "$src/helpers/other/navigationHelper";
  import { loginUser } from "$src/api/auth";
  import { onMount } from "svelte";

  export let navMobileMode = false;

  const profileAction = async () => {
    if ($currentUser) {
      navigateToProfile();
      isMenuOpened = false;
    } else {
      await loginUser();
      isMenuOpened = false;
    }
  };
  onMount(() => {
    const matcher = window.matchMedia("(max-width: 568px)");
    navMobileMode = matcher.matches;
    matcher.addEventListener("change", (e) => {
      navMobileMode = e.matches;
    });
  });

  let isMenuOpened = false;
</script>

<div
  id="nav"
  class:opened={isMenuOpened}
  class:closed={!isMenuOpened}
  class:mobile={navMobileMode}
>
  {#if !navMobileMode}
    <div class="items">
      <a id="nav-title" href={"/"}>
        <img src="/texture/logo.png" alt="Logo" />
      </a>
      <div style="flex:1;text-align:center">
        <Search
          dense={false}
          dark
          style="width:100%;max-width:400px;"
          placeholder={"Search outfits, sets and collections"}
          on:search={()=>navigate("/explore")}
        />
      </div>
      <div style="display:flex;gap:8px">
        <div style="flex:1;"></div>
        <NavigationItem
          icon={SubscriptionIcon}
          minimal
          viewId="wardrobe"
          disabled={$currentUser?.id == null}
        />
        <NavigationItem
          on:click={profileAction}
          label={$currentUser ? null : $_("navigation.login")}
          iconImage={$currentUser ? $currentUser?.avatar : null}
          icon={$currentUser == null ? AvatarIcon : null}
          viewId={"profile"}
          minimal
          customCall
        />
      </div>
    </div>{:else}
    <div class="items">
      <NavigationItem icon={HomeIcon} minimal viewId="./" />
      <NavigationItem icon={SearchIcon} minimal viewId="explore" />
      <NavigationItem
        icon={SubscriptionIcon}
        minimal
        viewId="wardrobe"
        disabled={$currentUser?.id == null}
      />
      <NavigationItem
        on:click={profileAction}
        iconImage={$currentUser ? $currentUser?.avatar : null}
        icon={$currentUser == null ? AvatarIcon : null}
        viewId={"profile"}
        minimal
        customCall
      />
    </div>
  {/if}
</div>

<style lang="scss">
  #nav {
    background-color: var(--color-theme-font);
    color: var(--color-theme);
    font-family: minecraft;
    height: 60px;
    padding: 10px 16px;
    box-sizing: border-box;
    display: flex;
    position: fixed;
    z-index: 10;
    top: 0;
    width: 100%;
    &.mobile {
      bottom: 0;
      height: 50px;
      padding: 4px;
      top: auto;
      .items {
        grid-template-columns: 1fr 1fr 1fr 1fr;
        place-items: center;
      }
    }
    .items {
      flex: 1;
      transition: var(--time) cubic-bezier(0.1, 0.9, 0.2, 1);
      background-color: var(--color-theme-font);
      display: grid;
      grid-template-columns: 23% 1fr 23%;
      gap: 16px;
    }
    #nav-title {
      display: table;
      padding: 8px 0px;
      box-sizing: border-box;
      img {
        height: 24px;
      }
    }
  }
</style>
