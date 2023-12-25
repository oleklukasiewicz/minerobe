<script lang="ts">
  import ItemSnapshot from "$lib/ItemSnapshot/ItemSnapshot.svelte";
  import type { OutfitPackage } from "$src/data/common";
  import * as THREE from "three";
  import { createEventDispatcher, onMount } from "svelte";
  import { MODEL_TYPE } from "$src/data/consts";
  import { alexModel, steveModel } from "$src/data/cache";
  import { SplitOutfitPackages } from "$src/helpers/apiHelper";

  export let outfits: OutfitPackage[] = [];
  export let categories = ["ALL"];
  export let modelName = "";
  export let renderer = null;

  const dispatch = createEventDispatcher();
  let selectedCategory = "ALL";
  const selectOutfit = function (outfit) {
    //emity event
    dispatch("select", outfit);
  };

  onMount(() => {
    if (renderer == null) renderer = new THREE.WebGLRenderer({ alpha: true });
  });

  const selectCategory = function (category) {
    selectedCategory = category;
    dispatch("category", category);
  };
</script>

<div class="outfit-picker">
  <div>
    <button
      class="small"
      class:secondary={selectedCategory != "ALL"}
      on:click={() => selectCategory("ALL")}>ALL</button
    >
    &nbsp;
    {#each categories as category}
      <button
        class="small"
        class:secondary={selectedCategory != category}
        style="margin-left:4px"
        on:click={() => selectCategory(category)}>{category}</button
      >
    {/each}
  </div>
  <div class="list">
    {#each SplitOutfitPackages(outfits) as outfit (outfit.id + outfit.layers[0].variantId)}
      <!-- svelte-ignore missing-declaration -->
      <!-- svelte-ignore missing-declaration -->
      <ItemSnapshot
        texture={outfit}
        dense={true}
        model={modelName == MODEL_TYPE.ALEX ? $alexModel : $steveModel}
        {renderer}
        {modelName}
        on:click={() => selectOutfit(outfit)}
      />
    {/each}
  </div>
</div>

<style lang="scss">
  @import "OutfitPicker.scss";
</style>
