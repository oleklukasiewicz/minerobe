<script lang="ts">
  import {
    appState,
    currentUser,
    defaultRenderer,
    isMobileView,
  } from "$src/data/cache";
  import {
    navigateToCollection,
    navigateToDesign,
    navigateToOutfitPackage,
    navigateToWardrobe,
  } from "$src/helpers/other/navigationHelper";
  import { onMount } from "svelte";
  import PlusIcon from "$icons/plus.svg?raw";
  import AnimationIcon from "$icons/animation.svg?raw";
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import SubscriptionIcon from "$src/icons/subscriptions.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import { GetOutfitIconFromType } from "$src/helpers/image/imageDataHelpers";
  import Search from "$component/base/Search/Search.svelte";
  import OutfitPackageSnapshotList from "$component/outfit/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import { page } from "$app/stores";
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import { _ } from "svelte-i18n";
  import { goto } from "$app/navigation";
  import { APP_STATE, OUTFIT_TYPE, PACKAGE_TYPE } from "$src/data/consts";
  import { writable, type Writable } from "svelte/store";
  import {
    AddCollectionToWardrobe,
    AddPackageToWardrobe,
    GetWadrobeCollections,
    GetWadrobeSummary,
    GetWardrobePackages,
    SetStudioPackage,
  } from "$src/api/wardrobe";
  import { CreateNewOutfitPackage } from "$src/helpers/package/packageHelper";
  import { AddPackage } from "$src/api/pack";
  import { AddCollection } from "$src/api/collection";
  import OutfitPackageCollectionList from "$lib/components/outfit/OutfitPackageCollectionList/OutfitPackageCollectionList.svelte";
  import { FetchSettings } from "$src/api/settings";
  import type { MinerobeUserSettingsSimple } from "$src/model/user";
  import type { PagedResponse } from "$src/model/base";
  import { OutfitPackageCollection } from "$src/model/collection";

  const defaultList = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
  };
  const userSettings: Writable<MinerobeUserSettingsSimple> = writable(null);

  const localWardobeItems: Writable<PagedResponse> = writable(defaultList);
  let currentView: any = {};
  let loaded = false;
  let itemsLoaded = false;
  let menuItems: any[] = [
    // {
    //   label: "Schedule",
    //   value: "schedule",
    //   icon: CalendarIcon,
    // },
    {
      label: "All",
      icon: SubscriptionIcon,
      value: "all",
    },
    {
      label: "Collections",
      icon: ListIcon,
      value: "collection",
    },
    {
      type: "separator",
    },
    {
      label: "Sets",
      icon: AnimationIcon,
      value: PACKAGE_TYPE.OUTFIT_SET,
    },
    {
      label: "Outfits",
      icon: ShoppingBagIcon,
      value: PACKAGE_TYPE.OUTFIT,
    },
  ];
  let filter = {
    phrase: "",
  };
  const mobileMenuItems = Array.from(menuItems);
  onMount(() => {
    currentView = {
      value: $page.params.page || "all",
      params: $page.params.params,
    };
    appState.subscribe(async (state) => {
      if (!(state == APP_STATE.READY)) return;
      if (loaded) return;
      //const ward = await GetUserWardrobe();
      const summary = await GetWadrobeSummary();

      const settings = await FetchSettings();
      userSettings.set(settings);

      const outfitsMenuItems = summary.outfitTypes
        .map((x) => {
          return {
            label: x.outfitType,
            value: PACKAGE_TYPE.OUTFIT,
            icon: GetOutfitIconFromType(x.outfitType),
            params: x.outfitType,
            badge: x.count,
          };
        })
        .filter(
          (x) => x.badge > 0 && x.label?.toLowerCase() != OUTFIT_TYPE.OUTFIT_SET
        );
      menuItems.push({
        type: "separator",
      });
      menuItems.push(...outfitsMenuItems);
      loaded = true;
      if (!loaded) return;
      currentView = {
        value: $page.params?.page || "all",
        params: $page.params?.params,
      };
      await resfreshItems();
    });
  });
  const resfreshItems = async function () {
    localWardobeItems.set(defaultList);
    itemsLoaded = false;
    const type = currentView.value;
    if (
      type == PACKAGE_TYPE.OUTFIT_SET ||
      type == PACKAGE_TYPE.OUTFIT ||
      type == "all" ||
      type == null
    ) {
      const items = await GetWardrobePackages(
        type == "all" ? null : type,
        currentView.params,
        filter.phrase
      );
      localWardobeItems.set(items);
    }
    if (type?.toLowerCase() == "collection") {
      const items = await GetWadrobeCollections(filter.phrase);
      localWardobeItems.set(items);
    }
    itemsLoaded = true;
  };
  const addNewSet = async function () {
    const newOutfit = await CreateNewOutfitPackage(
      "New Set",
      PACKAGE_TYPE.OUTFIT_SET
    );
    newOutfit.outfitType = OUTFIT_TYPE.OUTFIT_SET;
    const response = await AddPackage(newOutfit);
    if (response == null) return;
    const addedTowardrobe = await AddPackageToWardrobe(response.id);
    if (addedTowardrobe == null) return;
    const setStudio = await SetStudioPackage(response.id);
    if (setStudio == null) return;
    navigateToDesign(response);
  };
  const addNewOutfit = async function () {
    const newOutfit = await CreateNewOutfitPackage(
      "New Outfit",
      PACKAGE_TYPE.OUTFIT
    );
    newOutfit.outfitType = OUTFIT_TYPE.DEFAULT;
    const response = await AddPackage(newOutfit);
    if (response == null) return;
    const addedTowardrobe = await AddPackageToWardrobe(response.id);
    if (addedTowardrobe == null) return;
    const setStudio = await SetStudioPackage(response.id);
    if (setStudio == null) return;
    navigateToDesign(response);
  };
  const addNewCollection = async function () {
    const newCollection = new OutfitPackageCollection();
    newCollection.name = "New Collection";
    newCollection.publisherId = $currentUser?.id;
    const response = await AddCollection(newCollection);
    if (response == null) return;
    const addedTowardrobe = await AddCollectionToWardrobe(response.id);
    if (addedTowardrobe == null) return;
    navigateToCollection(response.id);
  };
  const filterOutfits = async function (e) {
    filter.phrase = e.detail;
    await resfreshItems();
  };
  const onItemSelect = async function (e) {
    const item = e.detail.item;
    const resp = await SetStudioPackage(item.id);
    if (resp == null) return;
    if (item.publisher.id != $currentUser?.id) navigateToOutfitPackage(item);
    else navigateToDesign(item);
  };
  const onCollectionSelect = async function (e) {
    const item = e.detail;
    navigateToCollection(item.id);
  };
  const onMenuItemSelect = async function (e) {
    const target = e.detail;
    if (target.value == "schedule") {
      goto("/schedule");
      return;
    }
    currentView = {
      value: target.value || "all",
      params: target.params,
    };
    navigateToWardrobe(target.value, target.params);
    await resfreshItems();
  };
  const compare = (a, b) => {
    return a?.value == b?.value && a?.params == b?.params;
  };
</script>

<div class="wardrobe-view" class:mobile={$isMobileView}>
  <div class="wardrobe-categories">
    {#if $isMobileView}
      <Menu
        items={mobileMenuItems}
        open
        top
        toggleable={!$isMobileView}
        label={$isMobileView ? null : "Wardrobe"}
        value={currentView}
        on:select={onMenuItemSelect}
        comparer={compare}
      />
    {:else}
      <Menu
        items={menuItems}
        open
        toggleable={!$isMobileView}
        label={$isMobileView ? null : "Wardrobe"}
        value={currentView}
        on:select={onMenuItemSelect}
        comparer={compare}
      />
    {/if}
  </div>
  <div>
    <div class="header">
      {#if !$isMobileView}
        <h1 class="inline" style="margin: 0px;">
          {currentView.value || "Wardrobe"}
        </h1>
      {/if}
      <div style="flex:1;">
        <div style="float: right;" class="search-btn">
          <Search
            dense={false}
            on:search={filterOutfits}
            on:input={filterOutfits}
          />
        </div>
      </div>
    </div>
    <div class="outfits">
      {#if currentView.value == "all"}
        <Button
          on:click={addNewSet}
          fab="dynamic"
          size="large"
          icon={PlusIcon}
          label="Create set"
          style="position:fixed"
        />
        <div class="list">
          <OutfitPackageSnapshotList
            dense={false}
            currentSkinId={$userSettings?.currentTexturePackageId}
            loading={!loaded || !itemsLoaded}
            maxItemWidth="1fr"
            minItemWidth="155px"
            fillMethod="auto-fill"
            renderer={$defaultRenderer}
            baseTexture={$userSettings?.baseTexture.layers[0]}
            withBaseTexture={$userSettings?.baseTexture != null}
            items={$localWardobeItems.items}
            on:innerselect={onItemSelect}
          />
        </div>
      {/if}
      {#if currentView.value == PACKAGE_TYPE.OUTFIT_SET}
        <Button
          on:click={addNewSet}
          fab="dynamic"
          size="large"
          icon={PlusIcon}
          label="Create set"
          style="position:fixed"
        />
        <div class="list">
          <OutfitPackageSnapshotList
            dense={false}
            loading={!loaded || !itemsLoaded}
            currentSkinId={$userSettings?.currentTexturePackageId}
            maxItemWidth="1fr"
            minItemWidth="155px"
            fillMethod="auto-fill"
            renderer={$defaultRenderer}
            baseTexture={$userSettings?.baseTexture.layers[0]}
            withBaseTexture={$userSettings?.baseTexture != null}
            items={$localWardobeItems.items}
            on:innerselect={onItemSelect}
          />
        </div>
      {/if}
      {#if currentView.value == PACKAGE_TYPE.OUTFIT}
        <Button
          on:click={addNewOutfit}
          fab="dynamic"
          size="large"
          icon={PlusIcon}
          label="Create Outfit"
          style="position:fixed"
        />

        <div class="list">
          <OutfitPackageSnapshotList
            dense={false}
            loading={!loaded || !itemsLoaded}
            maxItemWidth="1fr"
            minItemWidth="155px"
            fillMethod="auto-fill"
            renderer={$defaultRenderer}
            items={$localWardobeItems.items}
            on:innerselect={onItemSelect}
          />
        </div>
      {/if}
      {#if currentView.value == "collection"}
        <OutfitPackageCollectionList
          minItemWidth="255px"
          maxItemWidth="1fr"
          fillMethod="auto-fill"
          items={$localWardobeItems.items}
          loading={!loaded || !itemsLoaded}
          on:select={onCollectionSelect}
        />
        <Button
          on:click={addNewCollection}
          fab="dynamic"
          size="large"
          icon={PlusIcon}
          label="Create collection"
          style="position:fixed"
        />
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
