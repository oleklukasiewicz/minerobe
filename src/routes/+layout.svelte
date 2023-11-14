<script lang="ts">
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import NavigationItem from "$lib/NavigationItem/NavigationItem.svelte";
  import "$locales/locales"; // Import to initialize. Important :)
  import { locale, waitLocale, isLoading, _ } from "svelte-i18n";
  import MenuIcon from "$src/icons/menu.svg?raw";

  export const load = async () => {
    if (browser) {
      locale.set(window.navigator.language);
    }
    await waitLocale();
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
