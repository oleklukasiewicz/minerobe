<script lang="ts">
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import LazyList from "$lib/components/list/LazyList/LazyList.svelte";
  import OutfitPackageList from "$lib/components/outfit/OutfitPackageList/OutfitPackageList.svelte";
  import { GetCollection, GetCollectionsItems } from "$src/api/collection";
  import { FetchSettings } from "$src/api/settings.js";
  import { APP_STATE } from "$src/data/enums/app";
  import type { PagedResponse } from "$src/data/models/base.js";
  import type { OutfitPackageCollection } from "$src/data/models/collection";
  import { OutfitPackage } from "$src/data/models/package.js";
  import type { MinerobeUserSettings } from "$src/data/models/user.js";
  import { CURRENT_APP_STATE } from "$src/data/static";
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";

  export let data;

  const itemCollection: Writable<OutfitPackageCollection> = writable(null);
  const collectionItems: Writable<PagedResponse<OutfitPackage>[]> = writable(
    []
  );

  let userSettings: MinerobeUserSettings = null;
  let stateSub = null;
  let itemsLoaded = false;
  let loaded = false;
  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY && state != APP_STATE.GUEST_READY) return;

      $itemCollection = await GetCollection(data.id);
      userSettings = await FetchSettings();

      fetchItems(null);
      loaded = true;
    });
  });

  const fetchItems = async (e) => {
    itemsLoaded = false;
    const options: PagedResponse<OutfitPackage> = e?.detail?.options;
    const pagedItems = await GetCollectionsItems(
      $itemCollection.id,
      null,
      options?.options.page || 0,
      options?.options.pageSize || 36,
      null
    );
    collectionItems.update((items) => [...items, pagedItems]);
    itemsLoaded = true;
  };
</script>

<div id="collection-view">
  <div id="collection-header">
    <Placeholder {loaded}><h1>{$itemCollection.name}</h1></Placeholder>
    <Placeholder {loaded}><p>{$itemCollection.description}</p></Placeholder>
  </div>
  <div id="collection-items">
    {#if loaded}
      <LazyList
        let:items={pagedItems}
        on:loading={fetchItems}
        itemsPages={$collectionItems}
        rootMargin={"100px"}
        loading={!itemsLoaded}
      >
        <OutfitPackageList
          columns={6}
          resizable
          items={pagedItems}
          currentPackageId={userSettings.currentTexture?.packageId}
          baseTexture={userSettings.baseTexture.layers[0]}
        /></LazyList
      >
    {/if}
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
