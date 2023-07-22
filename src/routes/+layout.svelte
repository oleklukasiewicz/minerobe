<script lang="ts">
  import { browser } from "$app/environment";
  import "$locales/locales"; // Import to initialize. Important :)
  import { locale, waitLocale } from "svelte-i18n";

  export const load = async () => {
    if (browser) {
      locale.set(window.navigator.language);
    }
    await waitLocale();
  };
</script>

<div>
  <slot />
</div>

<style lang="scss">
  @import "layout_style.scss";
</style>
