<script lang="ts">
  import { browser } from "$app/environment";
  import NavigationItem from "$lib/NavigationItem/NavigationItem.svelte";
  import "$locales/locales"; // Import to initialize. Important :)
  import { locale, waitLocale,isLoading,_ } from "svelte-i18n";

  export const load = async () => {
    if (browser) {
      locale.set(window.navigator.language);
    }
    await waitLocale();
  };
</script>
{#if !$isLoading}
<div id="nav">
<NavigationItem label={$_("navigation.appname")} viewId="" />
<NavigationItem label={$_("navigation.explore")} viewId="explore" />
<NavigationItem label={$_("navigation.design")}  viewId="item"/>
</div>
<div>
  <slot />
</div>
{/if}
<style lang="scss">
  @import "layout_style.scss";
</style>
