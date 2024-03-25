<script lang="ts">
  import { isMobileView, currentUser } from "$src/data/cache";
  import { _ } from "svelte-i18n";
  import MenuIcon from "$src/icons/menu.svg?raw";
  import SubscriptionIcon from "$src/icons/subscriptions.svg?raw";
  import AvatarIcon from "$src/icons/avatar.svg?raw";
  import NavigationItem from "../NavigationItem/NavigationItem.svelte";
  import { navigateToProfile } from "$src/helpers/other/navigationHelper";
  import { loginUser } from "$src/api/auth";

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
<style lang="scss">
    #nav {
  background-color: var(--color-theme-font);
  color: var(--color-theme);
  font-family: minecraft;
  height: 60px;
  padding: 10px 5px 10px 10px;
  box-sizing: border-box;
  display: flex;
  z-index: 10;
  gap: 8px;
  position: fixed;
  top: 0;
  width: 100%;
  .menu-button {
    display: none;
  }
  @media (max-width: 768px) {
    padding: 10px 10px 10px 10px;
    .menu-button {
      display: block;
      position: absolute;
      z-index: 5;
    }
    #nav-title {
      width: 100%;
      flex:1;
      justify-content: center;
    }
  }
  #nav-title {
    text-align: center;
    font-size: larger;
    display: flex;
    gap: 16px;
    padding: 8px 16px;
    @media (max-width: 768px) {
      padding-left: 64px;
    }
  }
  .nav-filler {
    transition: opacity var(--time) cubic-bezier(0.1, 0.9, 0.2, 1);
  }
  &.opened {
    @media (max-width: 768px) {
      .items {
        transform: translateX(0);
      }
      .nav-filler {
        opacity: 1;
        background-color: rgba($color: #000000, $alpha: 0.5);
        position: absolute;
        width: 100vw;
        height: 100vh;
        top: 0px;
        left: 0px;
        z-index: 2;
      }
    }
  }
  &.closed {
    @media (max-width: 768px) {
      .items {
        transform: translateX(-100%);
      }
      .nav-filler {
        opacity: 0;
        position: absolute;
      }
    }
  }
  .items {
    flex: 1;
    transition: var(--time) cubic-bezier(0.1, 0.9, 0.2, 1);
    background-color: var(--color-theme-font);
    display: flex;
    gap: 8px;
    @media (max-width: 768px) {
      display: flex;
      z-index: 3;
      flex-direction: column;
      position: absolute;
      height: 100vh;
      left: 0px;
      top: 0;
      padding: 64px 8px 8px;
      box-sizing: border-box;
      min-width: calc(min(100vw, 400px));
    }
  }
}
</style>