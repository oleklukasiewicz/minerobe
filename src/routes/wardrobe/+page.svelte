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
    navigateToDesign,
    navigateToOutfitPackage,
  } from "$src/helpers/navigationHelper";
  import { onMount } from "svelte";
  import PlusIcon from "$icons/plus.svg?raw";
  import CategoryMenu from "$lib/CategoryMenu/CategoryMenu.svelte";
  import CategoryMenuItem from "$lib/CategoryMenuItem/CategoryMenuItem.svelte";
  import AnimationIcon from "$icons/animation.svg?raw";
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import { OUTFIT_TYPE } from "$src/data/consts";
  import Placeholder from "$lib/Placeholder/Placeholder.svelte";
  import { CreateOutfitSet } from "$src/api/sets";
  import { CreateOutfit } from "$src/api/outfits";
  import {
    GetCategoriesFromList,
    GetOutfitIconFromType,
  } from "$src/helpers/imageDataHelpers";
  import Search from "$lib/Search/Search.svelte";
  import OutfitPackageSnapshotList from "$lib/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";

  let currentView = "sets";
  let loaded = false;
  let outfitList = [];
  let setsList = [];
  let outfitsCount = {};

  onMount(() => {
    isReadyForData.subscribe((readyness) => {
      loaded = readyness?.wardrobe != null;
    });
  });
  const addNewSet = async function () {
    const newSet = await CreateOutfitSet(true);
    navigateToDesign(newSet);
  };
  const addNewOutfit = async function () {
    const newSet = await CreateOutfit(true);
    navigateToDesign(newSet);
  };
  const setOutfitsList = function (view) {
    if (view == "outfit") outfitList = $wardrobe.outfits;
    else
      outfitList = $wardrobe.outfits.filter((x) => {
        if (x.layers.length == 0 || x.layers[0] == null) return false;

        return x.layers[0]["steve"].type == OUTFIT_TYPE[currentView];
      });
  };
  const filterOutfits = function (e) {
    const value = e.detail;
    if (currentView == "sets")
      setsList = $wardrobe.sets.filter((x) => {
        return x.name.toLowerCase().includes(value.toLowerCase());
      });
    else {
      setOutfitsList(currentView);
      outfitList = outfitList.filter((x) => {
        return x.name.toLowerCase().includes(value.toLowerCase());
      });
    }
  };
  const onItemSelect = function (e) {
    const item = e.detail.item;
    if (item.publisher.id != $currentUser.id) navigateToOutfitPackage(item);
    else navigateToDesign(item);
  };

  $: setOutfitsList(currentView);
  wardrobe.subscribe((x) => {
    setsList = x.sets;
    outfitsCount = GetCategoriesFromList(x.outfits);
    setOutfitsList(currentView);
  });
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
        on:click={() => (currentView = "sets")}
      />
      <CategoryMenuItem
        label="Outfits"
        minimal={$isMobileView}
        selected={currentView == "outfit"}
        icon={ShoppingBagIcon}
        on:click={() => (currentView = "outfit")}
      />
      <span
        class="separator"
        class:horizontal={!$isMobileView}
        class:vertical={$isMobileView}
      />
      {#if $currentUser}
        {#each Object.keys(outfitsCount) as item, index}
          {#if outfitsCount[item] > 0}
            <CategoryMenuItem
              label={item}
              minimal={$isMobileView}
              selected={currentView == item}
              icon={GetOutfitIconFromType(item)}
              badge={outfitsCount[item]}
              on:click={() => (currentView = item)}
            />
          {/if}
        {/each}
      {/if}
    </CategoryMenu>
  </div>
  <div class="outfits">
    {#if loaded}
      {#if currentView == "sets"}
        <div style="display: flex;gap:8px;max-width:100vw; flex-wrap:wrap;">
          {#if !$isMobileView}<h1 class="inline" style="margin: 0;">
              Sets
            </h1>{/if}
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
        <button class="fab dynamic" on:click={() => addNewSet()}>
          <div>
            {@html PlusIcon}
            <span>Create set</span>
          </div></button
        >
        <div class="sets-list">
          <OutfitPackageSnapshotList
            dense={false}
            maxItemWidth="1fr"
            fillMethod="auto-fill"
            renderer={$defaultRenderer}
            items={setsList}
            withBaseTexture={$userSettings?.baseTexture != null}
            baseTexture={$userSettings?.baseTexture}
            on:innerselect={onItemSelect}
          />
        </div>
      {/if}
      {#if currentView != "sets"}
        <div style="display: flex;gap:8px; flex-wrap:wrap;max-width:100vw">
          {#if !$isMobileView}<h1 class="inline" style="margin: 0;">
              Outfits {OUTFIT_TYPE[currentView] != "ALL" &&
              OUTFIT_TYPE[currentView] != null &&
              currentView != "sets"
                ? " - " + OUTFIT_TYPE[currentView]
                : ""}
            </h1>{/if}
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
        <button class="fab dynamic" on:click={() => addNewOutfit()}>
          <div>
            {@html PlusIcon}
            <span>New outfit</span>
          </div></button
        >
        <div class="outfits-list">
          <OutfitPackageSnapshotList
            dense={false}
            maxItemWidth="1fr"
            fillMethod="auto-fill"
            renderer={$defaultRenderer}
            items={outfitList}
            on:innerselect={onItemSelect}
          />
        </div>
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

<style lang="scss">
  @import "style.scss";
</style>
