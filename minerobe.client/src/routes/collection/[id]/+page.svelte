<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import LazyList from "$lib/components/list/LazyList/LazyList.svelte";
  import OutfitPackageList from "$lib/components/outfit/OutfitPackageList/OutfitPackageList.svelte";
  import {
    GetCollection,
    GetCollectionsItems,
    UpdateCollection,
  } from "$src/api/collection";
  import { FetchSettings } from "$src/api/settings.js";
  import { APP_STATE } from "$src/data/enums/app";
  import { PagedModel, PagedResponse } from "$src/data/models/base.js";
  import type { OutfitPackageCollection } from "$src/data/models/collection";
  import { OutfitPackage } from "$src/data/models/package.js";
  import type { MinerobeUserSettings } from "$src/data/models/user.js";
  import { CURRENT_APP_STATE, IS_MOBILE_VIEW } from "$src/data/static";
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import EditIcon from "$src/icons/edit.svg?raw";
  import EditCollectionDialog from "$lib/components/dialog/EditCollectionDialog.svelte";
  import { SharePackage, UnSharePackage } from "$src/api/social.js";
  import { ShowToast } from "$src/data/toast.js";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import Label from "$lib/components/base/Label/Label.svelte";
  import { navigateToOutfitPackage } from "$src/helpers/other/navigationHelper.js";
  import OutfitPickerDialog from "$lib/components/dialog/OutfitPickerDialog.svelte";
  import type { OutfitFilter } from "$src/data/models/filter";
  import { GetWadrobePackagesSingleLayer, GetWardrobePackages } from "$src/api/wardrobe";
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
  let isEditDialogOpen = false;
  let isEditItemsDialogOpen = false;
  let dialogOutfitsPickerOptions: PagedModel<OutfitFilter> =
    new PagedModel<OutfitFilter>();
  let dialogOutfitPickerItems: PagedResponse<OutfitPackage> =
    new PagedResponse<OutfitPackage>();

  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY && state != APP_STATE.GUEST_READY) return;

      if (!collectionLoaded) {
        $itemCollection = await GetCollection(data.id);
        collectionLoaded = true;
      }
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
  const saveCollection = async (e) => {
    const collection = e.detail.collection;
    itemCollection.set(collection);
    await UpdateCollection(collection);
    if (collection.social.isShared) {
      await SharePackage(collection.social.id);
      ShowToast("Collection shared successfully", "success");
    } else {
      await UnSharePackage(collection.social.id);
      ShowToast("Collection unshared", "info");
    }
  };
  const goToItemPage = (e) => {
    const item = e.detail.item;
    const layer = e.detail.layer;
    navigateToOutfitPackage(item, layer?.id);
  };
  const openOutfitPicker = async (e) => {
    let options = e?.detail?.options;
    if (!options) {
      options = new PagedModel<OutfitFilter>();
      options.filter.type = null;
      options.page = 0;
      options.pageSize = 12;
      options.total = 0;
    }
    dialogOutfitsPickerOptions = options;
    dialogOutfitPickerItems.items = null;
    isEditItemsDialogOpen = true;

    dialogOutfitPickerItems = await GetWardrobePackages(
      dialogOutfitsPickerOptions
    );
  };
</script>

<div id="collection-view">
  <div id="collection-header">
    <SectionTitle label="Collection" placeholder={!loaded} />
    <Placeholder {loaded}
      ><h1>
        {$itemCollection.name}
        <Button
          label="Edit"
          onlyIcon
          icon={EditIcon}
          type="tertiary"
          size="large"
          on:click={() => (isEditDialogOpen = true)}
        />
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
    <Placeholder {loaded}><p>{$itemCollection.description}</p></Placeholder>
  </div>
  <div id="collection-actions">
    <Button label="Edit items" icon={EditIcon} on:click={openOutfitPicker} />
    <div></div>
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
          columns={$IS_MOBILE_VIEW ? 3 : 6}
          resizable
          items={pagedItems}
          currentPackageId={userSettings.currentTexture?.packageId}
          baseTexture={userSettings.baseTexture.layers[0]}
          on:select={goToItemPage}
        /></LazyList
      >
    {/if}
  </div>
  <EditCollectionDialog
    bind:open={isEditDialogOpen}
    collection={$itemCollection}
    on:save={saveCollection}
  />
  <OutfitPickerDialog
    pageSizes={[6, 12, 24]}
    bind:open={isEditItemsDialogOpen}
    items={dialogOutfitPickerItems}
    loading={dialogOutfitPickerItems?.items == null}
    on:optionsChanged={openOutfitPicker}
    on:filter={openOutfitPicker}
  />
</div>

<style lang="scss">
  @use "style.scss";
</style>
