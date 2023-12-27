<script lang="ts">
  import type { OutfitPackage } from "$src/data/common";
  import * as THREE from "three";
  import { createEventDispatcher, onMount } from "svelte";
  import { SplitOutfitPackages } from "$src/helpers/apiHelper";
  import Placeholder from "$lib/Placeholder/Placeholder.svelte";
  import OutfitPackageSnapshotList from "$lib/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";

  export let outfits: OutfitPackage[] = [];
  export let categories = ["ALL"];
  export let modelName = "";
  export let renderer = null;
  export let loading = false;

  const dispatch = createEventDispatcher();
  let selectedCategory = "ALL";
  const selectOutfit = function (e) {
    //emity event
    const outfit = e.detail;
    dispatch("select", outfit);
  };

  onMount(async () => {
    loading = true;
    if (renderer == null) renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = 1;
    loading = false;
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
    {#if !loading}
      <OutfitPackageSnapshotList
        {renderer}
        items={SplitOutfitPackages(outfits)}
        on:select={selectOutfit}
      />
    {/if}
    {#if loading}
      <div class="placeholders">
        {#each Array(64) as _}
          <Placeholder style="height:85px" />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @import "OutfitPicker.scss";
</style>
