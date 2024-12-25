<script lang="ts">
  //main imports
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  //api
  import { AddPackage } from "$src/api/pack";
  import { FetchSettings } from "$src/api/settings";
  import {
    AddPackageToWardrobe,
    GetWadrobeCollections,
    GetWardrobePackages,
  } from "$src/api/wardrobe";
  //services
  import { ShowToast } from "$src/data/toast";
  import { navigateToOutfitPackageEdit } from "$src/helpers/other/navigationHelper";
  //consts
  import { APP_STATE } from "$src/data/enums/app";
  import {
    CURRENT_APP_STATE,
    CURRENT_USER,
    IS_MOBILE_VIEW,
  } from "$src/data/static";
  import { OUTFIT_TYPE, PACKAGE_TYPE } from "$src/data/enums/outfit";
  //models
  import type { PagedResponse } from "$src/data/models/base";
  import { MODEL_TYPE } from "$src/data/enums/model";
  import { OutfitPackage } from "$src/data/models/package";
  import type { OutfitPackageCollectionWithPackageContext } from "$src/data/models/collection";
  import { OutfitFilter } from "$src/data/models/filter";
  import type { MinerobeUserSettingsSimple } from "$src/data/models/user";
  //components
  import LazyList from "$lib/components/list/LazyList/LazyList.svelte";
  import OutfitPackageList from "$lib/components/outfit/OutfitPackageList/OutfitPackageList.svelte";
  import MenuItem from "$lib/components/base/MenuItem/MenuItem.svelte";
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import MenuItemHeader from "$lib/components/base/MenuItemHeader/MenuItemHeader.svelte";
  import Search from "$lib/components/base/Search/Search.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import OutfitFiltersDialog from "$lib/components/dialog/OutfitFiltersDialog.svelte";
  //icons
  import MenuIcon from "$src/icons/menu.svg?raw";
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import AnimationIcon from "$icons/animation.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import AddIcon from "$icons/plus.svg?raw";
  import Sliders2Icon from "$icons/sliders-2.svg?raw";
  import OutfitPackageCollectionList from "$lib/components/outfit/OutfitPackageCollectionList/OutfitPackageCollectionList.svelte";
  import MenuSeparator from "$lib/components/base/MenuSeparator/MenuSeparator.svelte";
  import OutfitPackageTypePickerDialog from "$lib/components/dialog/OutfitPackageTypePickerDialog.svelte";

  const pageItems: Writable<PagedResponse<OutfitPackage>[]> = writable([]);
  const pageCollections: Writable<
    PagedResponse<OutfitPackageCollectionWithPackageContext>[]
  > = writable([]);

  let userSettings: MinerobeUserSettingsSimple = null;
  let loaded = false;
  let itemsLoaded = false;
  let menuOpened = true;
  let isFilterDialogOpen = false;
  let isTypePickerDialogOpen = false;
  let isCreating = false;

  let filter: OutfitFilter = new OutfitFilter();
  filter.type = PACKAGE_TYPE.OUTFIT_SET;
  let abortController = new AbortController();

  onMount(async () => {
    filter.type = PACKAGE_TYPE.OUTFIT_SET;
    CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;

      userSettings = await FetchSettings();
      loaded = true;

      await updateFilter({});
    });
  });

  const goToEdit = function (e) {
    const item = e.detail.item;
    navigateToOutfitPackageEdit(item.id);
  };
  const goToCollection = function (e) {};
  const fetchItems = async (e) => {
    const options = e?.detail?.options;
    const pagedItems = await GetWardrobePackages(
      filter,
      options?.page || 0,
      options?.pageSize || 36,
      abortController
    );
    pageItems.update((items) => [...items, pagedItems]);
  };
  const fetchCollections = async (e) => {
    const options = e?.detail?.options;
    const pagedCollections = (await GetWadrobeCollections(
      filter.phrase,
      options?.page || 0,
      options?.pageSize || 24,
      abortController
    )) as any;
    pageCollections.update((items) => [...items, pagedCollections]);
  };
  const updateFilter = async (e) => {
    try {
      abortController.abort();
      abortController = new AbortController();
      isFilterDialogOpen = false;
      const newFilter = e?.detail?.filter;
      if (newFilter) {
        filter = newFilter;
      }
      itemsLoaded = false;
      if (filter.type === PACKAGE_TYPE.OUTFIT_COLLECTION) {
        pageCollections.set([]);
        await fetchCollections(null);
      } else {
        pageItems.set([]);
        await fetchItems(null);
      }
      itemsLoaded = true;
    } catch (e) {}
  };
  const setPage = function (pageType) {
    if (filter.type === pageType) return;
    filter.type = pageType;
    filter.colors = [];
    filter.outfitType = [];
    filter.isShared = null;
    window.scrollTo(0, 0);
    updateFilter({});
  };
  const openFilterDialog = function () {
    isFilterDialogOpen = true;
  };
  const openOutfitTypePickerDialog = function () {
    isTypePickerDialogOpen = true;
  };
  const newOutfit = async function (e) {
    const type = e.detail.type;
    isCreating = true;
    isTypePickerDialogOpen = false;
    const name = type == PACKAGE_TYPE.OUTFIT_SET ? "New set" : "New outfit";
    const newPack = new OutfitPackage(name, MODEL_TYPE.ALEX, [], type);
    newPack.publisherId = $CURRENT_USER.id;
    newPack.description = "";
    newPack.outfitType =
      type == PACKAGE_TYPE.OUTFIT
        ? OUTFIT_TYPE.DEFAULT
        : OUTFIT_TYPE.OUTFIT_SET;
    try {
      const resp = await AddPackage(newPack);
      if (resp == null) {
        isCreating = false;
        return;
      }
      await AddPackageToWardrobe(resp.id);
      isCreating = false;
      navigateToOutfitPackageEdit(resp.id);
    } catch (e) {
      isCreating = false;
      ShowToast("Error creating new outfit", "error");
    }
  };
</script>

<div id="wardrobe-view" class:mobile={$IS_MOBILE_VIEW}>
  <div id="navigation">
    <div>
      <Menu let:opened let:top opened={menuOpened} top={$IS_MOBILE_VIEW}>
        {#if !$IS_MOBILE_VIEW}
          <MenuItemHeader
            label="Wardrobe"
            icon={MenuIcon}
            {opened}
            on:click={() => (menuOpened = !menuOpened)}
          />
          <div>
            <Button
              icon={AddIcon}
              label={"Create new item"}
              on:click={openOutfitTypePickerDialog}
              onlyIcon={!menuOpened}
              disabled={isCreating}
              size={menuOpened ? "medium" : "auto"}
            />
          </div>
          <MenuSeparator />
        {/if}
        <MenuItem
          label="Sets"
          icon={AnimationIcon}
          {opened}
          {top}
          selected={filter.type === PACKAGE_TYPE.OUTFIT_SET}
          on:click={() => setPage(PACKAGE_TYPE.OUTFIT_SET)}
        />
        <MenuItem
          {opened}
          {top}
          label="Outfits"
          icon={ShoppingBagIcon}
          selected={filter.type === PACKAGE_TYPE.OUTFIT}
          on:click={() => setPage(PACKAGE_TYPE.OUTFIT)}
        />
        <MenuItem
          {opened}
          {top}
          label="Collections"
          icon={ListIcon}
          selected={filter.type === PACKAGE_TYPE.OUTFIT_COLLECTION}
          on:click={() => setPage(PACKAGE_TYPE.OUTFIT_COLLECTION)}
        />
      </Menu>
    </div>
  </div>
  <div id="content">
    <div id="content-header">
      {#if !$IS_MOBILE_VIEW}
        <div></div>
      {/if}
      <div id="content-filters">
        <Button
          onlyIcon={$IS_MOBILE_VIEW}
          label="Filters"
          type="primary"
          icon={Sliders2Icon}
          on:click={openFilterDialog}
        />
      </div>
      <Search
        bind:value={filter.phrase}
        on:search={updateFilter}
        on:clear={updateFilter}
      />
    </div>
    <div id="content-list">
      {#if filter.type !== PACKAGE_TYPE.OUTFIT_COLLECTION}
        <LazyList
          let:items={pagedItems}
          on:loading={fetchItems}
          itemsPages={$pageItems}
          rootMargin={"100px"}
          loading={!itemsLoaded}
        >
          <OutfitPackageList
            resizable
            on:select={goToEdit}
            resizeDebounce={10}
            currentPackageId={userSettings.currentTexturePackageId}
            baseTexture={userSettings?.baseTexture.layers[0]}
            items={pagedItems}
            columns={$IS_MOBILE_VIEW ? 3 : 6}
          />
          <OutfitPackageList
            loading
            items={[]}
            pageSize={36}
            slot="loading"
            columns={$IS_MOBILE_VIEW ? 3 : 6}
          />
        </LazyList>
      {:else}
        <LazyList
          let:items={pagedCollections}
          on:loading={fetchCollections}
          itemsPages={$pageCollections}
          rootMargin={"100px"}
          loading={!itemsLoaded}
        >
          <OutfitPackageCollectionList
            items={pagedCollections}
            loading={!itemsLoaded}
            on:select={goToCollection}
            dense={false}
            columns={$IS_MOBILE_VIEW ? 2 : 4}
          />
          <OutfitPackageCollectionList
            pageSize={36}
            loading
            items={[]}
            slot="loading"
            dense={false}
            columns={$IS_MOBILE_VIEW ? 2 : 4}
          />
        </LazyList>
      {/if}
    </div>
  </div>
  {#if $IS_MOBILE_VIEW}
    <Button
      icon={AddIcon}
      label={"Create new item"}
      on:click={openOutfitTypePickerDialog}
      fab={"dynamic"}
      size={"large"}
    />
  {/if}
  <!--Dialogs-->
  <OutfitFiltersDialog
    bind:open={isFilterDialogOpen}
    hideType
    hideOutfitType={filter.type !== PACKAGE_TYPE.OUTFIT}
    hideColor={filter.type === PACKAGE_TYPE.OUTFIT_COLLECTION}
    {filter}
    on:filter={updateFilter}
  />
  <OutfitPackageTypePickerDialog
    bind:open={isTypePickerDialogOpen}
    on:select={newOutfit}
  />
</div>

<style lang="scss">
  @use "style.scss";
</style>
