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
    await InitializeLayout();

    Initialize().then(() => {
      getCurrentUser();
    });

    import("$lib/components/other/ToastController/ToastController.svelte").then(
      (module) => {
        ToastController = module.default;
      }
    );
  });
</script>

<div id="app">
  {#if ToastController}
    <svelte:component this={ToastController} items={$TOAST_LIST} />
  {/if}
  <Navigation />
  <div id="view" class:mobile={$IS_MOBILE_VIEW}>
    <slot />
  </div>
</div>

<style lang="scss">
  @use "layout_style.scss";
</style>
