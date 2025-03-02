<script lang="ts">
  //main imports
  import { _ } from "svelte-i18n";
  //api
  import { loginUser } from "$src/api/auth";
  //services
  import {
    navigate,
    navigateToProfile,
  } from "$src/helpers/other/navigationHelper";
  //consts
  import { CURRENT_USER, IS_MOBILE_VIEW } from "$src/data/static";
  //components
  import NavigationItem from "../NavigationItem/NavigationItem.svelte";
  import Search from "$lib/components/base/Search/Search.svelte";
  //icons
  import HomeIcon from "$src/icons/home.svg?raw";
  import SearchIcon from "$src/icons/search.svg?raw";
  import SubscriptionIcon from "$src/icons/subscriptions.svg?raw";
  import AvatarIcon from "$src/icons/avatar.svg?raw";

  const profileAction = async () => {
    if ($CURRENT_USER) {
      navigateToProfile();
      isMenuOpened = false;
    } else {
      await loginUser();
      isMenuOpened = false;
    }
  };

  let isMenuOpened = false;
</script>

<div
  id="nav"
  class:opened={isMenuOpened}
  class:closed={!isMenuOpened}
  class:mobile={$IS_MOBILE_VIEW}
>
  {#if !$IS_MOBILE_VIEW}
    <div class="items">
      <a id="nav-title" href={"/"}>
        <img src="/texture/logo.png" alt="Logo" />
      </a>
      <div style="flex:1;text-align:center">
        <Search
          dense={true}
          style="width:100%;max-width:400px;margin-top:2px;"
          placeholder={"Search outfits, sets and collections"}
          on:search={() => navigate("/explore")}
        />
      </div>
      <div style="display:flex;gap:8px">
        <div style="flex:1;"></div>
        <NavigationItem
          icon={SubscriptionIcon}
          minimal
          viewId="wardrobe"
          disabled={$CURRENT_USER?.id == null}
        />
        <NavigationItem
          on:click={profileAction}
          label={$CURRENT_USER ? null : $_("navigation.login")}
          iconImage={$CURRENT_USER ? $CURRENT_USER?.avatar : null}
          icon={$CURRENT_USER == null ? AvatarIcon : null}
          viewId={"profile"}
          minimal
          customCall
        />
      </div>
    </div>{:else}
    <div class="items">
      <NavigationItem icon={HomeIcon} minimal viewId="" />
      <NavigationItem icon={SearchIcon} minimal viewId="explore" />
      <NavigationItem
        icon={SubscriptionIcon}
        minimal
        viewId="wardrobe"
        disabled={$CURRENT_USER?.id == null}
      />
      <NavigationItem
        on:click={profileAction}
        iconImage={$CURRENT_USER ? $CURRENT_USER?.avatar : null}
        icon={$CURRENT_USER == null ? AvatarIcon : null}
        viewId={"profile"}
        minimal
        customCall
      />
    </div>
  {/if}
</div>

<style lang="scss">
  #nav {
    backdrop-filter: blur(60px) saturate(150%);
    background-color: rgba(226, 226, 226, 0.8);
    color: var(--color-theme);
    font-family: minecraft;
    height: 60px;
    padding: 10px 0px;
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
      display: grid;
      grid-template-columns: 23% 1fr 23%;
      gap: 16px;
      max-width: 1300px;
      padding: 0px 16px;
      box-sizing: border-box;
      margin: auto;
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
