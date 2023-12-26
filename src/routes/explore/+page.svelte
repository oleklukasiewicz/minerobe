<script lang="ts">
  import OutfitPicker from "$lib/OutfitPicker/OutfitPicker.svelte";
  import { appState, wardrobe } from "$src/data/cache";
  import { APP_STATE } from "$src/data/consts";
  import { FetchWardrobeOutfitsByCategory } from "$src/helpers/apiHelper";
  import { GetCategoriesFromList } from "$src/helpers/imageDataHelpers";
  let outfits = [];
  let categories = ["ALL"];
  let isPickerLoading = true;
  appState.subscribe(async (state) => {
    if (state == APP_STATE.READY) {
      const categoryCounts = GetCategoriesFromList($wardrobe.outfits);
      categories = Object.keys(categoryCounts).filter(
        (x) => categoryCounts[x] > 0
      );
      outfits = await FetchWardrobeOutfitsByCategory("ALL");
      isPickerLoading = false;
    }
  });
  const fetchByCategory = async function (e) {
    isPickerLoading = true;
    outfits = await FetchWardrobeOutfitsByCategory(e.detail);
    isPickerLoading = false;
  };
</script>

<h1 id="view-title">Explore new outfits</h1>
{#if $appState == APP_STATE.READY}
  <OutfitPicker
    bind:loading={isPickerLoading}
    {outfits}
    modelName={$wardrobe.studio.model}
    {categories}
    on:category={fetchByCategory}
  />
{/if}

<style lang="scss">
  @import "style.scss";
</style>
