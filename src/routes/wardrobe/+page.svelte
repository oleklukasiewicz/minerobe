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

  let layersRenderer: THREE.WebGLRenderer = null;

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
</script>

<div class="wardrobe-view">
  <CategoryMenu label="Wardrobe">
    <CategoryMenuItem label="Sets" selected icon={AnimationIcon} />
    <CategoryMenuItem label="Outfits" icon={ShoppingBagIcon} />
  </CategoryMenu>
  <div class="outfits">
    {#if loaded && $wardrobe != null }
      <div class="outfits-list">
        {#each $wardrobe.outfits as item}
          <ItemSnapshot
            renderer={layersRenderer}
            texture={item.layers[0]}
            model={item.model != "alex" ? $steveModel : $alexModel}
            modelName={item.model}
          />
        {/each}
      </div>
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
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
