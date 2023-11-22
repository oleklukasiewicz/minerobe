<script lang="ts">
  import ItemSetSnapshot from "$lib/ItemSetSnapshot/ItemSetSnapshot.svelte";
  import ItemSnapshot from "$lib/ItemSnapshot/ItemSnapshot.svelte";
  import { alexModel, steveModel, wardrobe } from "$src/data/cache";
  import { navigateToDesign } from "$src/helpers/navigationHelper";
  import { onMount } from "svelte";
  import * as THREE from "three";
  import PlusIcon from "$icons/plus.svg?raw";
  import {
    MODEL_TYPE,
    OutfitPackage,
    OutfitPackageMetadata,
    PACKAGE_TYPE,
  } from "$src/data/common";
  import { GenerateIdForWardrobeItem } from "$src/api/wardrobe";
  import { GenerateIdForCollection } from "$src/data/firebase";
  import { AddToWardrobe } from "$src/helpers/wardrobeHelper";

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
        {@html PlusIcon}<br />
        New set</button
      >
    </div>
  {/if}
</div>

<style lang="scss">
  @import "style.scss";
</style>
