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
      const items = await GetWadrobePackagesSingleLayer(undefined, 0, 10);
      pages.push(items);
      console.log(pages);
      loaded = true;
    });
  });
  const loadNewpage = async (e) => {
    const lastPage = e.detail.options;
    const items = await GetWadrobePackagesSingleLayer(
      undefined,
      lastPage.page + 1,
      lastPage.pageSize
    );
    pages = [...pages, items];
  };
</script>

<div style="width: 50vw;">
  {#if loaded}
    <LazyList let:items itemsPages={pages} on:loading={loadNewpage}>
      <OutfitPackageList {items} />
    </LazyList>
  {/if}
</div>

<style lang="scss">
  @use "style.scss";
</style>
