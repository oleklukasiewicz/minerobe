<script lang="ts">
  import { browser } from "$app/environment";
  import "$locales/locales";
  import { locale, waitLocale, isLoading, _ } from "svelte-i18n";

  import { onMount } from "svelte";
  import { getCurrentUser } from "$src/api/auth";
  import ToastController from "$lib/components/other/ToastController/ToastController.svelte";
  import Navigation from "$lib/components/other/Navigation/Navigation.svelte";
  import {
    Initialize,
    InitializeLayout,
    IS_MOBILE_VIEW,
  } from "$src/data/static";
  import { TOAST_LIST } from "$src/data/toast";

  export const load = async () => {
    if (browser) {
      locale.set(window.navigator.language);
    }
    await waitLocale();
  };
  onMount(async () => {
    await InitializeLayout();
    await Initialize();
    //dont wait for user to load
    getCurrentUser();
  });
</script>

{#if !$isLoading}
  <ToastController items={$TOAST_LIST} />
  <Navigation />
  <div id="view" class:mobile={$IS_MOBILE_VIEW}>
    <slot />
  </div>
{/if}

<style lang="scss">
  @use "layout_style.scss";
</style>
