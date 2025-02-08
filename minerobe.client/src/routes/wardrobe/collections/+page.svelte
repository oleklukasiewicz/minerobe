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
  import type { MinerobeUserSettings } from "$src/data/models/user";
  //components
  import LazyList from "$lib/components/list/LazyList/LazyList.svelte";
  import Search from "$lib/components/base/Search/Search.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import OutfitFiltersDialog from "$lib/components/dialog/OutfitFiltersDialog.svelte";
  import OutfitPackageCollectionList from "$lib/components/outfit/OutfitPackageCollectionList/OutfitPackageCollectionList.svelte";
  import OutfitPackageTypePickerDialog from "$lib/components/dialog/OutfitPackageTypePickerDialog.svelte";
  //icons
  import AddIcon from "$icons/plus.svg?raw";
  import Sliders2Icon from "$icons/sliders-2.svg?raw";

  const pageCollections: Writable<
    PagedResponse<OutfitPackageCollectionWithPackageContext>[]
  > = writable([]);

  let userSettings: MinerobeUserSettings = null;
  let loaded = false;
  let itemsLoaded = false;
  let isFilterDialogOpen = false;
  let isTypePickerDialogOpen = false;
  let isCreating = false;

  let filter: OutfitFilter = new OutfitFilter();
  filter.type = PACKAGE_TYPE.OUTFIT_COLLECTION;
  let abortController = new AbortController();

  onMount(async () => {
    filter.type = PACKAGE_TYPE.OUTFIT_COLLECTION;
    CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;

      userSettings = await FetchSettings();
      loaded = true;

      await updateFilter({});
    });
  });

  const goToCollection = function (e) {};
  const fetchCollections = async (e) => {
    const options = e?.detail?.options;
    const pagedCollections = (await GetWadrobeCollections(
      filter.phrase,
      options?.page || 0,
      options?.pageSize || 36,
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

      pageCollections.set([]);
      await fetchCollections(null);

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

<div id="wardrobe-collections" class:mobile={$IS_MOBILE_VIEW}>
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
        pageSize={48}
        loading
        items={[]}
        slot="loading"
        dense={false}
        columns={$IS_MOBILE_VIEW ? 2 : 4}
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
    hideType
    hideOutfitType
    hideColor
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
