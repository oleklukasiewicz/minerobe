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
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import { CreatedNewOutfitSet } from "$src/api/sets";
  import { CreatedNewOutfit } from "$src/api/outfits";

  let layersRenderer: THREE.WebGLRenderer = null;

  let currentView = "sets";
  let loaded = false;
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
  </CategoryMenu>
  <div class="outfits">
    {#if loaded && $wardrobe != null}
      {#if currentView == "sets"}
        <h1>Sets</h1>
        <div class="sets-list">
          {#each $wardrobe.sets as item}
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
          <button id="new-set" on:click={() => addNewSet()}>
            <span class="icon-big">{@html PlusIcon}</span><br /><br />
            New set</button
          >
        </div>
      {/if}
      {#if currentView == "outfit"}
        <h1>Outfits</h1>
        <div class="outfits-list">
          {#each $wardrobe.outfits as item}
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
          <button id="new-set" on:click={() => addNewOutfit()}>
            <span class="icon-big">{@html PlusIcon}</span><br /><br />
            New outfit</button
          >
        </div>
      {/if}
    {/if}
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
