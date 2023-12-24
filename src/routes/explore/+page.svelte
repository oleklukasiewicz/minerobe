<script lang="ts">
  import OutfitPicker from "$lib/OutfitPicker/OutfitPicker.svelte";
  import { appState, wardrobe } from "$src/data/cache";
  import { APP_STATE } from "$src/data/consts";
  import { FetchFullWardrobe } from "$src/helpers/apiHelper";
  import { onMount } from "svelte";
  let outfits = [];
  appState.subscribe(async (state) => {
    if (state == APP_STATE.READY) {
      outfits = (await FetchFullWardrobe()).outfits;
    }
  });
</script>

<h1 id="view-title">Explore new outfits</h1>
{#if $appState == APP_STATE.READY}
  <OutfitPicker {outfits} modelName={$wardrobe.studio.model} />
{/if}

<style lang="scss">
  @import "style.scss";
</style>
