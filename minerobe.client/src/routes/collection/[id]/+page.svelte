<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import LazyList from "$lib/components/list/LazyList/LazyList.svelte";
  import OutfitPackageList from "$lib/components/outfit/OutfitPackageList/OutfitPackageList.svelte";
  import { GetCollection, GetCollectionsItems } from "$src/api/collection";
  import { FetchSettings } from "$src/api/settings.js";
  import { APP_STATE } from "$src/data/enums/app";
  import { PagedResponse } from "$src/data/models/base.js";
  import type { OutfitPackageCollection } from "$src/data/models/collection";
  import { OutfitPackage } from "$src/data/models/package.js";
  import type { MinerobeUserSettings } from "$src/data/models/user.js";
  import {
    CURRENT_APP_STATE,
    CURRENT_USER,
    IS_MOBILE_VIEW,
  } from "$src/data/static";
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import EditIcon from "$src/icons/edit.svg?raw";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import Label from "$lib/components/base/Label/Label.svelte";
  import {
    navigateToCollection,
    navigateToOutfitPackage,
  } from "$src/helpers/other/navigationHelper.js";
  export let data;

  const itemCollection: Writable<OutfitPackageCollection> = writable(null);
  const collectionItems: Writable<PagedResponse<OutfitPackage>[]> = writable(
    []
  );

  let userSettings: MinerobeUserSettings = null;
  let stateSub = null;
  let itemsLoaded = false;
  let loaded = false;
  let collectionLoaded = false;

  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY && state != APP_STATE.GUEST_READY) return;

      if (state == APP_STATE.READY) userSettings = await FetchSettings();
      if (!collectionLoaded) {
        $itemCollection = await GetCollection(data.id);
        collectionLoaded = true;
      }

      collectionItems.set([]);
      fetchItems(null);
      loaded = true;
    });
  });

  const editCollection = () => {
    navigateToCollection($itemCollection.id, true);
  };

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
  const goToItemPage = (e) => {
    const item = e.detail.item;
    const layer = e.detail.layer;
    navigateToOutfitPackage(item, layer?.id);
  };
</script>

<div id="collection-view" class:mobile={$IS_MOBILE_VIEW}>
  <div id="collection-header">
    <SectionTitle label="Collection" placeholder={!loaded} />
    <Placeholder {loaded}  style="min-height: 46px; max-width:50%;">
      <h1>
        {$itemCollection.name}
        {#if $itemCollection.publisher.id == $CURRENT_USER.id}
          <Button
            label="Edit"
            onlyIcon
            icon={EditIcon}
            type="tertiary"
            size="large"
            on:click={editCollection}
          />
        {/if}
      </h1>
    </Placeholder>
    <div id="collection-info">
      {#if loaded}
        <Label variant={"unique"}>{$itemCollection.publisher.name}</Label>
      {/if}
      {#if $itemCollection?.social?.isShared}
        <Label variant={"rare"}>Shared</Label>
      {/if}
    </div>
    <Placeholder {loaded} style="min-height: 42px;"><p>{$itemCollection.description}</p></Placeholder>
  </div>
  <div id="collection-actions">
    <div></div>
  </div>
  <div id="collection-items">
      <LazyList
        let:items={pagedItems}
        on:loading={fetchItems}
        itemsPages={$collectionItems}
        rootMargin={"100px"}
        loading={!itemsLoaded}
      >
        <OutfitPackageList
          columns={$IS_MOBILE_VIEW ? 3 : 6}
          resizable
          items={pagedItems}
          currentPackageId={userSettings?.currentTexture?.packageId}
          baseTexture={userSettings?.baseTexture.layers[0]}
          on:select={goToItemPage}
        />
        <OutfitPackageList
          loading
          items={[]}
          pageSize={36}
          slot="loading"
          columns={$IS_MOBILE_VIEW ? 3 : 6}
        />
      </LazyList>
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
