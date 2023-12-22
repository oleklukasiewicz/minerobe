<script lang="ts">
  import ItemSetSnapshot from "$lib/ItemSetSnapshot/ItemSetSnapshot.svelte";
  import ItemSnapshot from "$lib/ItemSnapshot/ItemSnapshot.svelte";
  import {
    alexModel,
    appState,
    currentUser,
    steveModel,
    wardrobe,
    defaultRenderer,
    isMobileView,
  } from "$src/data/cache";
  import { navigateToDesign } from "$src/helpers/navigationHelper";
  import { onMount } from "svelte";
  import * as THREE from "three";
  import PlusIcon from "$icons/plus.svg?raw";
  import CategoryMenu from "$lib/CategoryMenu/CategoryMenu.svelte";
  import CategoryMenuItem from "$lib/CategoryMenuItem/CategoryMenuItem.svelte";
  import AnimationIcon from "$icons/animation.svg?raw";
  import AvatarIcon from "$icons/avatar.svg?raw";
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import { APP_STATE, OUTFIT_TYPE } from "$src/data/consts";
  import Placeholder from "$lib/Placeholder/Placeholder.svelte";
  import { CreateOutfitSet } from "$src/api/sets";
  import { CreateOutfit } from "$src/api/outfits";
  import {
    GetCategoriesFromList,
    GetOutfitIconFromType,
  } from "$src/helpers/imageDataHelpers";

  let currentView = "sets";
  let loaded = false;
  onMount(() => {
    appState.subscribe((x) => {
      loaded = x == APP_STATE.READY;
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
  let outfitList = [];
  let outfitsCount = {};
  const setOutfitsList = function (view) {
    if (view == "outfit") outfitList = $wardrobe.outfits;
    else
      outfitList = $wardrobe.outfits.filter((x) => {
        if (x.layers.length == 0) return false;
        return x.layers[0]["steve"].type == OUTFIT_TYPE[currentView];
      });
  };
  $: setOutfitsList(currentView);
  wardrobe.subscribe((x) => {
    outfitsCount = GetCategoriesFromList(x.outfits);
    setOutfitsList(currentView);
  });
</script>

<div class="wardrobe-view" class:mobile={$isMobileView}>
  <div class="filler"></div>
  <div class="wardrobe-categories">
    <CategoryMenu
      label={"Wardrobe" + (OUTFIT_TYPE[currentView] != "ALL" && OUTFIT_TYPE[currentView]!= null && currentView != "sets"
        ? " - "+OUTFIT_TYPE[currentView]
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
        <div>
          <h1 class="inline">Sets</h1>
          <button
            id="new-outfit"
            class="small icon-small"
            on:click={() => addNewSet()}
          >
            {@html PlusIcon}
            <span>New set</span></button
          >
        </div>
        <div class="sets-list">
          {#each $wardrobe.sets as item (item.id)}
            <ItemSetSnapshot
              renderer={$defaultRenderer}
              outfitPackage={item}
              publisher={item.publisher}
              model={item.model != "alex" ? $steveModel : $alexModel}
              modelName={item.model}
              on:click={() => {
                navigateToDesign(item);
              }}
            />
          {/each}
        </div>
      {/if}
      {#if currentView != "sets"}
        <div>
          <h1 class="inline">Outfits</h1>
          <button
            id="new-set"
            class="small icon-small"
            on:click={() => addNewOutfit()}
          >
            {@html PlusIcon}
            <span>New outfit</span></button
          >
        </div>
        <div class="outfits-list">
          {#each outfitList as item (item.id)}
            <ItemSnapshot
              renderer={$defaultRenderer}
              texture={item}
              extended={true}
              model={item.model != "alex" ? $steveModel : $alexModel}
              modelName={item.model}
              on:click={() => {
                navigateToDesign(item);
              }}
            />
          {/each}
        </div>
      {/if}
    {:else}
      <div class="sets-list">
        {#each new Array(25) as item, index}
          <Placeholder style="width:200px;height:268px;" />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
