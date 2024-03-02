<script lang="ts">
  import {
    currentUser,
    wardrobe,
    defaultRenderer,
    isMobileView,
    isReadyForData,
    userSettings,
  } from "$src/data/cache";
  import {
    navigateToCollection,
    navigateToDesign,
    navigateToOutfitPackage,
    navigateToWardrobe,
  } from "$src/helpers/other/navigationHelper";
  import { onMount } from "svelte";
  import PlusIcon from "$icons/plus.svg?raw";
  import CategoryMenu from "$component/other/CategoryMenu/CategoryMenu.svelte";
  import CategoryMenuItem from "$component/other/CategoryMenuItem/CategoryMenuItem.svelte";
  import AnimationIcon from "$icons/animation.svg?raw";
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import { OUTFIT_TYPE } from "$src/data/consts";
  import Placeholder from "$component/base/Placeholder/Placeholder.svelte";
  import {
    GetCategoriesFromList,
    GetOutfitIconFromType,
  } from "$src/helpers/image/imageDataHelpers";
  import Search from "$component/base/Search/Search.svelte";
  import OutfitPackageSnapshotList from "$component/outfit/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import { CreateOutfitCollection } from "$src/api/collection";
  import { setsIntance } from "$src/api/sets";
  import { outfitsInstance } from "$src/api/outfits";
  import OutfitPackageCollectionItem from "$lib/components/outfit/OutfitPackageCollectionItem/OutfitPackageCollectionItem.svelte";
  import { page } from "$app/stores";
  import { writable, type Writable } from "svelte/store";
  import type { WardrobePackage } from "$src/data/common";
  import { ParseWardrobeToLocal } from "$src/api/wardrobe";

  let currentView = "sets";
  let currentViewParams = "";
  let loaded = false;
  let itemsLoaded = false;
  let currentList = [];
  let filteredList = [];
  let outfitsCount = {};
  const localWardrobe:Writable<WardrobePackage> = writable(null);

  onMount(() => {

    isReadyForData.subscribe(async (readyness) => {
      loaded = readyness?.wardrobe != null;
      if (loaded) {
        localWardrobe.set(await ParseWardrobeToLocal($wardrobe));
      }
      page.subscribe((value) => {
        currentView = value.params.page || "sets";
        currentViewParams = value.params.params || "";
        itemsLoaded = false;
        switch (currentView) {
          case "sets":
            currentList = $wardrobe.sets;
            break;
          case "outfits":
            currentList = $wardrobe.outfits.filter((x) => {
              return currentViewParams == ""
                ? true
                : x.outfitType.toLowerCase() == currentViewParams.toLowerCase();
            });
            break;
          case "collection":
            currentList = $wardrobe.collections;
            break;
        }
        filteredList = currentList;
        itemsLoaded = true;
      });
      outfitsCount = GetCategoriesFromList($wardrobe.outfits);
    });
  });
  const addNewSet = async function () {
    const newSet = await setsIntance.create(true);
    navigateToDesign(newSet);
  };
  const addNewOutfit = async function () {
    const newSet = await outfitsInstance.create(true);
    navigateToDesign(newSet);
  };
  const addNewCollection = async function () {
    const newCollection = await CreateOutfitCollection(true);
    navigateToCollection(newCollection.id);
  };
  const filterOutfits = function (e) {
    const value = e.detail;
    filteredList = currentList.filter((x) => {
      return x.name.toLowerCase().includes(value.toLowerCase());
    });
  };
  const onItemSelect = function (e) {
    const item = e.detail.item;
    if (item.publisher.id != $currentUser?.id) navigateToOutfitPackage(item);
    else navigateToDesign(item);
  };
</script>

<div class="wardrobe-view" class:mobile={$isMobileView}>
  {#if !$isMobileView}
    <div class="filler"></div>
  {/if}
  <div class="wardrobe-categories">
    <CategoryMenu
      label={"Wardrobe" +
        ($isMobileView
          ? OUTFIT_TYPE[currentView] != "ALL" &&
            OUTFIT_TYPE[currentView] != null &&
            currentView != "sets"
            ? " - " + OUTFIT_TYPE[currentView]
            : ""
          : "")}
      horizontal={$isMobileView}
    >
      <CategoryMenuItem
        label="Sets"
        minimal={$isMobileView}
        selected={currentView == "sets"}
        icon={AnimationIcon}
        on:click={() => navigateToWardrobe("sets")}
      />
      <CategoryMenuItem
        label="Outfits"
        minimal={$isMobileView}
        selected={currentView == "outfits" && currentViewParams.length == 0}
        icon={ShoppingBagIcon}
        on:click={() => navigateToWardrobe("outfits")}
      />
      <CategoryMenuItem
        label="Collections"
        minimal={$isMobileView}
        selected={currentView == "collection"}
        icon={ListIcon}
        on:click={() => navigateToWardrobe("collection")}
      />
      {#if !$isMobileView}
        <span
          class="separator"
          style="width: calc(100% - 20px);"
          class:horizontal={!$isMobileView}
          class:vertical={$isMobileView}
        />
      {/if}
      {#if $currentUser && !$isMobileView}
        {#each Object.keys(outfitsCount) as item, index}
          {#if outfitsCount[item] > 0}
            <CategoryMenuItem
              label={item}
              minimal={$isMobileView}
              selected={currentView == "outfits" &&
                currentViewParams.toLowerCase() == item}
              icon={GetOutfitIconFromType(item)}
              badge={outfitsCount[item]}
              on:click={() => navigateToWardrobe("outfits", item.toLowerCase())}
            />
          {/if}
        {/each}
      {/if}
    </CategoryMenu>
  </div>
  <div>
    <div class="header">
      {#if !$isMobileView}
        <h1 class="inline" style="margin: 0px;">{currentView}</h1>
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
      {#if loaded && itemsLoaded}
        {#if currentView == "sets"}
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
              maxItemWidth="1fr"
              fillMethod="auto-fill"
              renderer={$defaultRenderer}
              items={filteredList}
              withBaseTexture={$userSettings?.baseTexture != null}
              baseTexture={$userSettings?.baseTexture}
              on:innerselect={onItemSelect}
            />
          </div>
        {/if}
        {#if currentView == "outfits"}
          <Button
            on:click={addNewOutfit}
            fab="dynamic"
            size="large"
            icon={PlusIcon}
            label="New Outfit"
            style="position:fixed"
          />

          <div class="list">
            <OutfitPackageSnapshotList
              dense={false}
              maxItemWidth="1fr"
              fillMethod="auto-fill"
              renderer={$defaultRenderer}
              items={filteredList}
              on:innerselect={onItemSelect}
            />
          </div>
        {/if}
        {#if currentView == "collection"}
          <div class="list collection-list">
            {#each filteredList as item (item.id)}
              <OutfitPackageCollectionItem
                {item}
                on:click={() => navigateToCollection(item.id)}
              />
            {/each}
          </div>
          <Button
            on:click={addNewCollection}
            fab="dynamic"
            size="large"
            icon={PlusIcon}
            label="Create collection"
            style="position:fixed"
          />
        {/if}
      {:else}
        <div class="placeholders">
          {#each new Array(36) as item, index}
            <Placeholder style="min-width:175px;height:268px;" />
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
