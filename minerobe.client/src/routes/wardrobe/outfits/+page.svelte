<script lang="ts">
  //main imports
  import { onDestroy, onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  //api
  import { FetchSettings } from "$src/api/settings";
  import { GetWardrobePackages } from "$src/api/wardrobe";
  //services
  import { navigateToOutfitPackageEdit } from "$src/helpers/other/navigationHelper";
  //consts
  import { APP_STATE } from "$src/data/enums/app";
  import { CURRENT_APP_STATE, IS_MOBILE_VIEW } from "$src/data/static";
  import { PACKAGE_TYPE } from "$src/data/enums/outfit";
  import { OUTFIT_PACKAGE_SORT_OPTIONS } from "$src/data/consts/sort";
  //models
  import {
    PagedModel,
    type PagedResponse,
    type SortOption,
  } from "$src/data/models/base";
  import { OutfitPackage } from "$src/data/models/package";
  import { OutfitFilter } from "$src/data/models/filter";
  import type { MinerobeUserSettings } from "$src/data/models/user";
  //components
  import LazyList from "$lib/components/list/LazyList/LazyList.svelte";
  import OutfitPackageList from "$lib/components/outfit/OutfitPackageList/OutfitPackageList.svelte";
  import Search from "$lib/components/base/Search/Search.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import OutfitFiltersDialog from "$lib/components/dialog/OutfitFiltersDialog.svelte";
  //icons
  import Sliders2Icon from "$icons/sliders-2.svg?raw";

  const pageItems: Writable<PagedResponse<OutfitPackage>[]> = writable([]);

  let userSettings: MinerobeUserSettings = null;
  let loaded = false;
  let itemsLoaded = false;
  let isFilterDialogOpen = false;
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
    const pagedModel = new PagedModel<OutfitFilter>();
    pagedModel.page = options?.options.page || 0;
    pagedModel.pageSize = options?.options.pageSize || 36;
    pagedModel.filter = filter;
    pagedModel.sort = sortOption;
    const pagedItems = await GetWardrobePackages(pagedModel, abortController);
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
        resizeDebounce={500}
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
  <!--Dialogs-->
  <OutfitFiltersDialog
    bind:open={isFilterDialogOpen}
    sortItems={OUTFIT_PACKAGE_SORT_OPTIONS}
    sortOptions={sortOption[0]}
    hideType
    {filter}
    on:filter={updateFilter}
  />
</div>

<style lang="scss">
  @use "style.scss";
</style>
