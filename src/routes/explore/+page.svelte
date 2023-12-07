<script lang="ts">
  import OutfitPicker from "$lib/OutfitPicker/OutfitPicker.svelte";
  import { appState, wardrobe } from "$src/data/cache";
  import { APP_STATE } from "$src/data/consts";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<h1 id="view-title">Explore new outfits</h1>
{#if $appState == APP_STATE.READY}
  <OutfitPicker
    outfits={$wardrobe.outfits}
    modelName={$wardrobe.studio.model}
  />
{/if}

<style lang="scss">
  @import "style.scss";
</style>
