<script lang="ts">
  import { browser } from "$app/environment";
  import "$locales/locales";
  import { locale, waitLocale, isLoading, _ } from "svelte-i18n";

  import { onMount } from "svelte";
  import { getCurrentUser } from "$src/api/auth";
  import Navigation from "$lib/components/other/Navigation/Navigation.svelte";
  import {
    Initialize,
    InitializeLayout,
    IS_MOBILE_VIEW,
  } from "$src/data/static";
  import { TOAST_LIST } from "$src/data/toast";

  let ToastController;

  export const load = async () => {
    if (browser) {
      locale.set(window.navigator.language);
    }
    await waitLocale();
  };
  onMount(async () => {
    await Promise.all([InitializeLayout(), Initialize()]);
    //dont wait for user to load
    getCurrentUser();
    // Dynamically import components
    ToastController = (
      await import(
        "$lib/components/other/ToastController/ToastController.svelte"
      )
    ).default;
  });
</script>

{#if !$isLoading}
  {#if ToastController}
    <svelte:component this={ToastController} items={$TOAST_LIST} />
  {/if}
  <Navigation />
  <div id="view" class:mobile={$IS_MOBILE_VIEW}>
    <slot />
  </div>
{/if}

<style lang="scss">
  @use "layout_style.scss";
</style>
