<script lang="ts">
  //api
  import { FetchSettings } from "$src/api/settings";
  import { GetWadrobeCollections } from "$src/api/wardrobe";

  //services
  import { navigateToCollection } from "$src/helpers/other/navigationHelper";

  //consts
  import { APP_STATE } from "$src/data/enums/app";
  import { CURRENT_APP_STATE, IS_MOBILE_VIEW } from "$src/data/static";
  import { PACKAGE_TYPE } from "$src/data/enums/outfit";

  //models
  import type { PagedResponse } from "$src/data/models/base";
  import type { OutfitPackageCollectionWithPackageContext } from "$src/data/models/collection";
  import { OutfitFilter } from "$src/data/models/filter";
  import type { MinerobeUserSettings } from "$src/data/models/user";

  //components
  import LazyList from "$lib/components/list/LazyList/LazyList.svelte";
  import Search from "$lib/components/base/Search/Search.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import OutfitFiltersDialog from "$lib/components/dialog/OutfitFiltersDialog.svelte";
  import OutfitPackageCollectionList from "$lib/components/outfit/OutfitPackageCollectionList/OutfitPackageCollectionList.svelte";

  //icons
  import Sliders2Icon from "$icons/sliders-2.svg?raw";

  import { onMount, onDestroy } from "svelte";
  import { writable, type Writable } from "svelte/store";
  //api
  //services
  //consts
  //models
  //components
  //icons

  const pageCollections: Writable<
    PagedResponse<OutfitPackageCollectionWithPackageContext>[]
  > = writable([]);

  let userSettings: MinerobeUserSettings = null;
  let loaded = false;
  let itemsLoaded = $state(false);
  let isFilterDialogOpen = $state(false);
  let stateSub = null;

  const createInitialFilter = (): OutfitFilter => ({
    ...new OutfitFilter(),
    type: PACKAGE_TYPE.OUTFIT_COLLECTION,
    phrase: "",
  });
  let filter: OutfitFilter = $state(createInitialFilter());
  let abortController = new AbortController();

  onMount(async () => {
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

  const goToCollection = function (e) {
    navigateToCollection(e.item.id, true);
  };
  const fetchCollections = async (e) => {
    const options = e?.options;
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
      const newFilter = e?.filter;
      if (newFilter) {
        filter = {
          ...newFilter,
          phrase: newFilter.phrase ?? filter.phrase ?? "",
        };
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
</script>

<div id="wardrobe-collections" class:mobile={$IS_MOBILE_VIEW}>
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
        onclick={openFilterDialog}
      />
    </div>
    <Search
      bind:value={filter.phrase}
      onsearch={updateFilter}
      onclear={updateFilter}
    />
  </div>
  <div id="content-list">
    <LazyList
      
      onloading={fetchCollections}
      itemsPages={$pageCollections}
      rootMargin={"100px"}
      loading={!itemsLoaded}
      let:items
    >
      <OutfitPackageCollectionList
        items={items}
        loading={!itemsLoaded}
        onselect={goToCollection}
        onclick={goToCollection}
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
  <!--Dialogs-->
  <OutfitFiltersDialog
    bind:open={isFilterDialogOpen}
    hideType
    hideOutfitType
    hideColor
    bind:filter={filter}
    onfilter={updateFilter}
  />
</div>

<style lang="scss">
  @use "style.scss";
</style>
