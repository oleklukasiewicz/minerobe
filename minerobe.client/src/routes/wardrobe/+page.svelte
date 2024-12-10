<script lang="ts">
  import LazyList from "$lib/components/list/LazyList/LazyList.svelte";
  import OutfitPackageList from "$lib/components/outfit/OutfitPackageList/OutfitPackageList.svelte";
  import { GetWardrobePackages } from "$src/api/wardrobe";
  import { APP_STATE } from "$src/data/enums/app";
  import type { PagedResponse } from "$src/data/models/base";
  import type { OutfitPackageCollection } from "$src/data/models/collection";
  import type { OutfitPackage } from "$src/data/models/package";
  import { CURRENT_APP_STATE } from "$src/data/static";
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";

  const pageItems: Writable<PagedResponse<OutfitPackage>[]> = writable([]);
  const pageCollections: Writable<PagedResponse<OutfitPackageCollection>[]> =
    writable([]);

  let loaded = false;

  onMount(async () => {
    CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      await fetchItems({});
      loaded = true;
    });
  });

  const fetchItems = async (e) => {
    const options = e?.detail?.options;
    const pagedItems = await GetWardrobePackages(
      undefined,
      options?.page || 0,
      options?.pageSize || 24
    );
    console.log(pagedItems);
    pageItems.update((items) => [...items, pagedItems]);
  };
</script>

<div class="wardrobe-view">
  <div class="navigation"></div>
  <div class="content">
    {#if loaded}
      <LazyList let:items={pagedItems} on:loading={fetchItems} itemsPages={$pageItems}>
        <OutfitPackageList items={pagedItems} />
      </LazyList>
    {/if}
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
