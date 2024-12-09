<script lang="ts">
  import LazyList from "$lib/components/base/LazyList/LazyList.svelte";
  import OutfitPackageList from "$lib/components/outfit/OutfitPackageList/OutfitPackageList.svelte";
  import { GetWadrobePackagesSingleLayer } from "$src/api/wardrobe";
  import { APP_STATE } from "$src/data/enums/app";
  import { CURRENT_APP_STATE } from "$src/data/static";
  import { onMount } from "svelte";

  let pages = [];
  let loaded = false;
  onMount(() => {
    CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      const items = await GetWadrobePackagesSingleLayer(undefined, 0, 5);
      pages.push(items);
      console.log(pages);
      loaded = true;
    });
  });
</script>

<div style="width: 100vw;">
  {#if loaded}
    <LazyList let:items itemsPages={pages}>
      <OutfitPackageList {items} />
    </LazyList>
  {/if}
</div>

<style lang="scss">
  @use "style.scss";
</style>
