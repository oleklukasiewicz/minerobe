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
  import AnimationIcon from "$icons/animation.svg?raw";
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import { PACKAGE_TYPE } from "$src/data/consts";
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
  import Menu from "$lib/components/other/Menu/Menu.svelte";
  import { _ } from "svelte-i18n";

  let currentView: any = {};
  let loaded = false;
  let itemsLoaded = false;
  let currentList = [];
  let filteredList = [];
  let outfitsCount = {};
  let menuItems: any[] = [
    {
      label: "Sets",
      icon: AnimationIcon,
      value: "sets",
    },
    {
      label: "Outfits",
      icon: ShoppingBagIcon,
      value: "outfits",
    },
    {
      label: "Collections",
      icon: ListIcon,
      value: "collection",
    },
  ];
  const localWardrobe: Writable<WardrobePackage> = writable(null);

  onMount(() => {
    isReadyForData.subscribe(async (readyness) => {
      loaded = readyness?.wardrobe != null;
      if (loaded) {
        localWardrobe.set(await ParseWardrobeToLocal($wardrobe));
        outfitsCount = GetCategoriesFromList($wardrobe.outfits);
        const outfitsMenuItems = Object.keys(outfitsCount)
          .map((x) => {
            return {
              label: x,
              value: "outfits",
              icon: GetOutfitIconFromType(x),
              params: x,
              badge: outfitsCount[x],
            };
          })
          .filter((x) => x.badge > 0);
        if (!$isMobileView) {
          menuItems.push({
            type: "separator",
          });
          menuItems.push(...outfitsMenuItems);
        }
      }
      page.subscribe((value) => {
        currentView = {
          value: value.params.page || "sets",
          params: value.params.params,
        };

        itemsLoaded = false;
        switch (currentView.value) {
          case "sets":
            currentList = $wardrobe.outfits.filter(
              (x) => x.type == PACKAGE_TYPE.OUTFIT_SET
            );
            break;
          case "outfits":
            currentList = $wardrobe.outfits
              .filter((x) => x.type == PACKAGE_TYPE.OUTFIT)
              .filter((x) => {
                return currentView.params == "" || currentView.params == null
                  ? true
                  : x.outfitType?.toLowerCase() ==
                      currentView?.params?.toLowerCase();
              });
            break;
          case "collection":
            currentList = $wardrobe.collections;
            break;
        }
        filteredList = currentList;
        itemsLoaded = true;
      });
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
  const onMenuItemSelect = function (e) {
    const target = e.detail;
    navigateToWardrobe(target.value, target.params);
  };
  const compare = (a, b) => {
    return a?.value == b?.value && a?.params == b?.params;
  };
</script>

<div class="wardrobe-view" class:mobile={$isMobileView}>
  <div class="wardrobe-categories">
    <Menu
      items={menuItems}
      open
      toggleable={!$isMobileView}
      label={$isMobileView ? null : "Wardrobe"}
      value={currentView}
      on:select={onMenuItemSelect}
      comparer={compare}
    />
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
      {#if loaded && itemsLoaded}
        {#if currentView.value == "sets"}
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
              minItemWidth="155px"
              fillMethod="auto-fill"
              renderer={$defaultRenderer}
              items={filteredList}
              withBaseTexture={$userSettings?.baseTexture != null}
              baseTexture={$userSettings?.baseTexture}
              on:innerselect={onItemSelect}
            />
          </div>
        {/if}
        {#if currentView.value == "outfits"}
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
              maxItemWidth="1fr"
              minItemWidth="155px"
              fillMethod="auto-fill"
              renderer={$defaultRenderer}
              items={filteredList}
              on:innerselect={onItemSelect}
            />
          </div>
        {/if}
        {#if currentView.value == "collection"}
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
            <Placeholder style="min-width:135px;height:268px;" />
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
