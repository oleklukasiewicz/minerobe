<script lang="ts">
  import LazyList from "$lib/components/list/LazyList/LazyList.svelte";
  import OutfitPackageList from "$lib/components/outfit/OutfitPackageList/OutfitPackageList.svelte";
  import { GetWadrobePackagesSingleLayer } from "$src/api/wardrobe";
  import { APP_STATE } from "$src/data/enums/app";
  import { CURRENT_APP_STATE } from "$src/data/static";
  import { onDestroy, onMount } from "svelte";

  let pages = [];
  let loaded = false;
  let stateSub=null;
  onMount(() => {
    stateSub= CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      const items = await GetWadrobePackagesSingleLayer(undefined, 0, 10);
      pages.push(items);
      console.log(pages);
      loaded = true;
    });
  });
  onDestroy(() => {
    if (stateSub) stateSub();
  });
  const loadNewpage = async (e) => {
    const lastPage = e.detail.options;
    const items = await GetWadrobePackagesSingleLayer(
      undefined,
      lastPage?.page || 0,
      lastPage?.pageSize || 10
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
