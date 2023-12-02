<script lang="ts">
  import ItemSetSnapshot from "$lib/ItemSetSnapshot/ItemSetSnapshot.svelte";
  import ItemSnapshot from "$lib/ItemSnapshot/ItemSnapshot.svelte";
  import { alexModel, steveModel, wardrobe } from "$src/data/cache";
  import { navigateToDesign } from "$src/helpers/navigationHelper";
  import { onMount } from "svelte";
  import * as THREE from "three";
  import PlusIcon from "$icons/plus.svg?raw";
  import CategoryMenu from "$lib/CategoryMenu/CategoryMenu.svelte";
  import CategoryMenuItem from "$lib/CategoryMenuItem/CategoryMenuItem.svelte";
  import AnimationIcon from "$icons/animation.svg?raw";
  import AvatarIcon from "$icons/avatar.svg?raw";
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import { CreatedNewOutfitSet } from "$src/api/sets";
  import { CreatedNewOutfit } from "$src/api/outfits";
  import { OUTFIT_TYPE } from "$src/data/consts";

  let layersRenderer: THREE.WebGLRenderer = null;

  let currentView = "sets";
  let loaded = false;
  let categories = Object.keys(OUTFIT_TYPE).filter(
    (x) =>
      OUTFIT_TYPE[x] != OUTFIT_TYPE.DEFAULT &&
      OUTFIT_TYPE[x] != OUTFIT_TYPE.OUTFIT_SET
  );
  onMount(() => {
    layersRenderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
    });
    loaded = true;
  });
  const addNewSet = async function () {
    const newSet = await CreatedNewOutfitSet();
    navigateToDesign(newSet);
  };
  const addNewOutfit = async function () {
    const newSet = await CreatedNewOutfit();
    navigateToDesign(newSet);
  };
  let outfitList = [];
  let outfitsCount = [];
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
    categories.forEach((category) => {
      outfitsCount[category] = x.outfits.filter((outfit) => {
        if (outfit.layers.length == 0) return false;
        return outfit.layers[0]["steve"].type == OUTFIT_TYPE[category];
      }).length;
    });
    setOutfitsList(currentView);
  });
</script>

<div class="wardrobe-view">
  <CategoryMenu label="Wardrobe">
    <CategoryMenuItem
      label="Sets"
      selected={currentView == "sets"}
      icon={AnimationIcon}
      on:click={() => (currentView = "sets")}
    />
    <CategoryMenuItem
      label="Outfits"
      selected={currentView == "outfit"}
      icon={ShoppingBagIcon}
      on:click={() => (currentView = "outfit")}
    />
    <span class="separator horizontal" />
    {#each categories as item, index}
      {#if outfitsCount[item] > 0}
        <CategoryMenuItem
          label={item}
          selected={currentView == item}
          icon={AvatarIcon}
          badge={outfitsCount[item]}
          on:click={() => (currentView = item)}
        />
      {/if}
    {/each}
  </CategoryMenu>
  <div class="outfits">
    {#if loaded && $wardrobe != null}
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
              renderer={layersRenderer}
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
              renderer={layersRenderer}
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
    {/if}
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
