<script lang="ts">
  //main imports
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  //api
  import { AddPackage } from "$src/api/pack";
  import { FetchSettings } from "$src/api/settings";
  import { AddPackageToWardrobe, GetWardrobePackages } from "$src/api/wardrobe";
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
  import AnimationIcon from "$icons/animation.svg?raw";
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import AddIcon from "$icons/plus.svg?raw";
  import Sliders2Icon from "$icons/sliders-2.svg?raw";

  const pageItems: Writable<PagedResponse<OutfitPackage>[]> = writable([]);
  const pageCollections: Writable<
    PagedResponse<OutfitPackageCollectionWithPackageContext>[]
  > = writable([]);

  let userSettings: MinerobeUserSettingsSimple = null;
  let loaded = false;
  let itemsLoaded = false;
  let menuOpened = true;
  let isFilterDialogOpen = false;
  let isCreating = false;

  let filter: OutfitFilter = new OutfitFilter();

  onMount(async () => {
    CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;

      userSettings = await FetchSettings();
      loaded = true;

      await fetchItems({});
      itemsLoaded = true;
    });
  });

  const goToEdit = function (e) {
    const item = e.detail.item;
    navigateToOutfitPackageEdit(item.id);
  };
  const fetchItems = async (e) => {
    const options = e?.detail?.options;
    const pagedItems = await GetWardrobePackages(
      filter,
      options?.page || 0,
      options?.pageSize || 36
    );
    if (pagedItems.items[0].type != filter.type) return;
    pageItems.update((items) => [...items, pagedItems]);
  };
  const updateFilter = async (e) => {
    isFilterDialogOpen = false;
    const newFilter = e?.detail?.filter;
    if (newFilter) {
      filter = newFilter;
    }
    itemsLoaded = false;
    pageItems.set([]);
    await fetchItems(null);
    itemsLoaded = true;
  };
  const setPage = function (pageType) {
    if (filter.type === pageType) return;
    filter.type = pageType;
    filter.colors = [];
    filter.outfitType = [];
    filter.isShared = null;
    updateFilter({});
  };
  const openFilterDialog = function () {
    isFilterDialogOpen = true;
  };
  const newOutfit = async function () {
    isCreating = true;
    const type = filter.type as PACKAGE_TYPE;
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
      <Menu let:opened opened={menuOpened}>
        <MenuItemHeader
          label="Wardrobe"
          icon={MenuIcon}
          {opened}
          on:click={() => (menuOpened = !menuOpened)}
        />
        <MenuItem
          label="Sets"
          icon={AnimationIcon}
          {opened}
          selected={filter.type === PACKAGE_TYPE.OUTFIT_SET}
          on:click={() => setPage(PACKAGE_TYPE.OUTFIT_SET)}
        />
        <MenuItem
          {opened}
          label="Outfits"
          icon={ShoppingBagIcon}
          selected={filter.type === PACKAGE_TYPE.OUTFIT}
          on:click={() => setPage(PACKAGE_TYPE.OUTFIT)}
        />
        <MenuItem
          {opened}
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
      <Button
        icon={AddIcon}
        label="Create new"
        on:click={newOutfit}
        disabled={isCreating}
      />
      <div></div>
      <div id="content-filters">
        <Button
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
    {#if loaded}
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
          pageSize={18}
          slot="loading"
          columns={$IS_MOBILE_VIEW ? 3 : 6}
        />
      </LazyList>
    {/if}
  </div>
  <!--Dialogs-->
  <OutfitFiltersDialog
    bind:open={isFilterDialogOpen}
    hideType
    hideOutfitType={filter.type !== PACKAGE_TYPE.OUTFIT}
    hideColor={filter.type === PACKAGE_TYPE.OUTFIT_COLLECTION}
    {filter}
    on:filter={updateFilter}
  />
</div>

<style lang="scss">
  @use "style.scss";
</style>
