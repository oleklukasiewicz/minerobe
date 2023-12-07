<script lang="ts">
  import ItemSnapshot from "$lib/ItemSnapshot/ItemSnapshot.svelte";
  import { alexModel, steveModel } from "$src/data/cache";
  import type { OutfitPackage } from "$src/data/common";
  import { MODEL_TYPE } from "$src/data/consts";
  import * as THREE from "three";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  export let outfits: OutfitPackage[] = [];
  export let modelName = "";

  let model = null;
  let mappedOutfits: OutfitPackage[] = [];
  let renderer = new THREE.WebGLRenderer({ alpha: true });

  const mapOutfits = function (list: OutfitPackage[]) {
    mappedOutfits = [];
    model = modelName == MODEL_TYPE.ALEX ? $alexModel : $steveModel;
    list.forEach((x) => {
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

  $: mapOutfits(outfits);
</script>

<div class="outfit-picker">
  {#each mappedOutfits as outfit, index}
    <ItemSnapshot
      texture={outfit}
      {model}
      {renderer}
      {modelName}
      on:click={() => selectOutfit(outfit)}
    />
  {/each}
</div>

<style lang="scss">
  @import "OutfitPicker.scss";
</style>
