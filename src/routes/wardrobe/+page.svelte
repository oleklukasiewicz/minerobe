<script lang="ts">
  import ItemSetSnapshot from "$lib/ItemSetSnapshot/ItemSetSnapshot.svelte";
  import ItemSnapshot from "$lib/ItemSnapshot/ItemSnapshot.svelte";
  import { alexModel, steveModel, wardrobe } from "$src/data/cache";
  import { navigateToDesign } from "$src/helpers/navigationHelper";
  import { onMount } from "svelte";
  import * as THREE from "three";
  import PlusIcon from "$icons/plus.svg?raw";
  import { OutfitPackage, OutfitPackageMetadata } from "$src/data/common";
  import { MODEL_TYPE, PACKAGE_TYPE } from "$data/consts";
  import { GenerateIdForWardrobeItem } from "$src/api/wardrobe";
  import { GenerateIdForCollection } from "$src/data/firebase";
  import { AddToWardrobe } from "$src/helpers/wardrobeHelper";
  import CategoryMenu from "$lib/CategoryMenu/CategoryMenu.svelte";
  import CategoryMenuItem from "$lib/CategoryMenuItem/CategoryMenuItem.svelte";
  import AnimationIcon from "$icons/animation.svg?raw";
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";

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
    const newSet = new OutfitPackage(
      "New skin",
      MODEL_TYPE.ALEX,
      [],
      GenerateIdForCollection("dummy"),
      new OutfitPackageMetadata(null, GenerateIdForWardrobeItem(), null),
      PACKAGE_TYPE.OUTFIT_SET
    );
    await AddToWardrobe(newSet);
    navigateToDesign(newSet);
  };
</script>

<div class="wardrobe-view">
  <CategoryMenu label="Wardrobe">
    <CategoryMenuItem label="Sets" selected icon={AnimationIcon} />
    <CategoryMenuItem label="Outfits" icon={ShoppingBagIcon} />
  </CategoryMenu>
  <div class="outfits">
    {#if loaded && $wardrobe != null}
      <div class="outfits-list">
        {#each $wardrobe.outfits as item}
          <ItemSnapshot
            renderer={layersRenderer}
            texture={item.layers[0]}
            model={item.model != "alex" ? $steveModel : $alexModel}
            modelName={item.model}
            metadata={item.metadata}
          />
        {/each}
      </div>
      <h1>Sets</h1>
      <div class="sets-list">
        {#each $wardrobe.sets as item}
          <ItemSetSnapshot
            renderer={layersRenderer}
            outfitPackage={item}
            model={item.model != "alex" ? $steveModel : $alexModel}
            modelName={item.model}
            metadata={item.metadata}
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
