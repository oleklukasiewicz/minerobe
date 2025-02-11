<script lang="ts">
  //main imports
  import { onDestroy, onMount } from "svelte";
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
  import type { PagedResponse, PageOptions, SortOption } from "$src/data/models/base";
  import { MODEL_TYPE } from "$src/data/enums/model";
  import { OutfitPackage } from "$src/data/models/package";
  import { OutfitFilter } from "$src/data/models/filter";
  import type { MinerobeUserSettings } from "$src/data/models/user";
  //components
  import LazyList from "$lib/components/list/LazyList/LazyList.svelte";
  import OutfitPackageList from "$lib/components/outfit/OutfitPackageList/OutfitPackageList.svelte";
  import Search from "$lib/components/base/Search/Search.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import OutfitFiltersDialog from "$lib/components/dialog/OutfitFiltersDialog.svelte";
  import OutfitPackageTypePickerDialog from "$lib/components/dialog/OutfitPackageTypePickerDialog.svelte";
  //icons
  import AddIcon from "$icons/plus.svg?raw";
  import Sliders2Icon from "$icons/sliders-2.svg?raw";
  import { OUTFIT_PACKAGE_SORT_OPTIONS } from "$src/data/consts/sort";

  const pageItems: Writable<PagedResponse<OutfitPackage>[]> = writable([]);

  let userSettings: MinerobeUserSettings = null;
  let loaded = false;
  let itemsLoaded = false;
  let isFilterDialogOpen = false;
  let isTypePickerDialogOpen = false;
  let isCreating = false;
  let stateSub = null;

  let filter: OutfitFilter = new OutfitFilter();
  let sortOption: SortOption[] = [];
  filter.type = PACKAGE_TYPE.OUTFIT;
  let abortController = new AbortController();

  onMount(async () => {
    filter.type = PACKAGE_TYPE.OUTFIT;
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;

      userSettings = await FetchSettings();
      loaded = true;

      await updateFilter({});
    });
  });
  onDestroy(() => {
    if (stateSub) stateSub();
  });

  const goToEdit = function (e) {
    const item = e.detail.item;
    navigateToOutfitPackageEdit(item.id);
  };
  const fetchItems = async (e) => {
    const options: PagedResponse<OutfitPackage> = e?.detail?.options;
    const pagedItems = await GetWardrobePackages(
      filter,
      options?.options.page || 0,
      options?.options.pageSize || 36,
      sortOption,
      abortController
    );
    pageItems.update((items) => [...items, pagedItems]);
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
      const newSort = e?.detail?.sort;
      if (newSort) {
        sortOption = newSort;
      }
      itemsLoaded = false;
      pageItems.set([]);
      await fetchItems(null);
      itemsLoaded = true;
    } catch (e) {}
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

<div id="wardrobe-outfits" class:mobile={$IS_MOBILE_VIEW}>
  <div id="content-header">
    {#if !$IS_MOBILE_VIEW}
      <div></div>
    {/if}
    <div id="content-filters">
      <Button
        onlyIcon={$IS_MOBILE_VIEW}
        label="Sort & Filters"
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
        currentPackageId={userSettings.currentTexture?.packageId}
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
    sortItems={OUTFIT_PACKAGE_SORT_OPTIONS}
    sortOptions={sortOption[0]}
    hideType
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
