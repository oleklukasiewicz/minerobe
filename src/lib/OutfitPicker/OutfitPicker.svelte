<script lang="ts">
  import ItemSnapshot from "$lib/ItemSnapshot/ItemSnapshot.svelte";
  import { alexModel, steveModel } from "$src/data/cache";
  import type { OutfitPackage } from "$src/data/common";
  import { MODEL_TYPE, OUTFIT_TYPE } from "$src/data/consts";
  import * as THREE from "three";
  import { createEventDispatcher, onMount } from "svelte";
  import { GetCategoriesFromList } from "$src/helpers/imageDataHelpers";

  const dispatch = createEventDispatcher();
  export let outfits: OutfitPackage[] = [];
  export let modelName = "";
  export let renderer = null;
  export const updateRenderer = () => {
    mapOutfits(outfits, selectedCategory);
  };

  let model = null;
  let mappedOutfits: OutfitPackage[] = [];
  let categories = {};
  let selectedCategory = "ALL";

  const mapOutfits = function (list: OutfitPackage[], category: string) {
    mappedOutfits = [];
    categories = GetCategoriesFromList(list);

    model = modelName == MODEL_TYPE.ALEX ? $alexModel : $steveModel;
    let filteredList = list;
    if (selectedCategory != "ALL")
      filteredList = list.filter((x) => {
        if (x.layers.length == 0) return false;
        return x.layers[0]["steve"].type == OUTFIT_TYPE[selectedCategory];
      });
    filteredList.forEach((x) => {
      x.layers.forEach((y) => {
        const tempPackage = { ...x };
        tempPackage.layers = [y];
        mappedOutfits.push(tempPackage);
      });
    });
  };
  const selectOutfit = function (outfit) {
    //emity event
    dispatch("select", outfit);
  };

  onMount(() => {
    if (renderer == null) renderer = new THREE.WebGLRenderer({ alpha: true });
    mapOutfits(outfits, selectedCategory);
  });
  $: mapOutfits(outfits, selectedCategory);
</script>

<div class="outfit-picker">
  <div>
    <button class="small" class:secondary={selectedCategory!="ALL"}   on:click={() => (selectedCategory = "ALL")}
      >ALL</button
    >
    &nbsp;
    {#each Object.keys(categories).filter((x) => categories[x] > 0) as category}
      <button class="small" class:secondary={selectedCategory!=category} style="margin-left:4px" on:click={() => (selectedCategory = category)}
        >{category}</button
      >
    {/each}
  </div>
  <div class="list">
    {#each mappedOutfits as outfit (outfit.id+outfit.layers[0].variantId)}
      <ItemSnapshot
        texture={outfit}
        dense={true}
        {model}
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
