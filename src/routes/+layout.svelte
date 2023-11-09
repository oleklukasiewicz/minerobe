<script lang="ts">
  import { browser } from "$app/environment";
  import NavigationItem from "$lib/NavigationItem/NavigationItem.svelte";
  import "$locales/locales"; // Import to initialize. Important :)
  import { locale, waitLocale, isLoading, _ } from "svelte-i18n";
  import HomeIcon from "$src/icons/home.svg?raw";

  export const load = async () => {
    if (browser) {
      locale.set(window.navigator.language);
    }
    await waitLocale();
  };
</script>

{#if !$isLoading}
  <div id="nav">
    <div id="nav-title">{$_("navigation.appname")}</div>
    <NavigationItem label={$_("navigation.home")} viewId="" />
    <NavigationItem label={$_("navigation.explore")} viewId="explore" />
    <NavigationItem label={$_("navigation.design")} viewId="design" />
  </div>
  <div id="content">
    <slot />
  </div>
{/if}

<style lang="scss">
  @import "layout_style.scss";
</style>
