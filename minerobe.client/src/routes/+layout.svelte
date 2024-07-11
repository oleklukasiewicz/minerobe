<script lang="ts">
  import { browser } from "$app/environment";
  import "$locales/locales";
  import { locale, waitLocale, isLoading, _ } from "svelte-i18n";

  import { onMount } from "svelte";
  import {
    currentToasts,
    isMobileNavigation,
    preSetup,
    setup,
    snapshotTemporaryNode,
  } from "$src/data/cache";
  import { getCurrentUser } from "$src/api/auth";
  import ToastController from "$lib/components/other/ToastController/ToastController.svelte";
  import Navigation from "$lib/components/other/Navigation/Navigation.svelte";

  export const load = async () => {
    if (browser) {
      locale.set(window.navigator.language);
    }
    await waitLocale();
  };
  onMount(async () => {
    await preSetup();
    await getCurrentUser();
    setup();
  });
</script>

{#if !$isLoading}
  <ToastController items={$currentToasts} />
  <Navigation />
  <div id="view" class:mobile={$isMobileNavigation}>
    <slot />
  </div>
{/if}
<div
  style="min-width: 300px;min-height:300px;max-width:300px; max-height:300px;display:none"
  bind:this={$snapshotTemporaryNode}
></div>

<style lang="scss">
  @import "layout_style.scss";
</style>
