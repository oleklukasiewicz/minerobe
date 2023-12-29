<script lang="ts">
  import type { OutfitPackage } from "$src/data/common";
  import * as THREE from "three";
  import { createEventDispatcher, onMount } from "svelte";
  import { SplitOutfitPackages } from "$src/helpers/apiHelper";
  import Placeholder from "$lib/Placeholder/Placeholder.svelte";
  import OutfitPackageSnapshotList from "$lib/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import ChevronLeftIcon from "$icons/chevron-left.svg?raw";
  import ChevronRightIcon from "$icons/chevron-right.svg?raw";
  import Search from "$lib/Search/Search.svelte";

  export let outfits: OutfitPackage[] = [];
  export let categories = ["ALL"];
  export let renderer = null;
  export let loading = false;
  export let page = 0;
  export let pagesCount = 0;
  export let itemsPerPage = 24;

  let listReady = true;

  let pagedItems = [];
  let splitedOutfits = [];
  let search = "";

  const dispatch = createEventDispatcher();
  let selectedCategory = "ALL";
  const selectOutfit = function (e) {
    //emity event
    const outfit = e.detail;
    dispatch("select", outfit);
  };

  onMount(async () => {
    loading = true;
    if (renderer == null) {
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.shadowMap.enabled = true;
      renderer.outputEncoding = 1;
    }
    refreshPagination(outfits);
  });

  const selectCategory = function (category) {
    selectedCategory = category;
    page = 0;
    dispatch("category", category);
  };
  const paginate = function (outfits) {
    return outfits.slice(
      page * itemsPerPage,
      page * itemsPerPage + itemsPerPage
    );
  };
  const updatePagination = function (pageEx, itemsPerPage) {
    const filteredOutfits = outfits.filter((outfit) => {
      if (
        search != "" &&
        !outfit.name.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
    splitedOutfits = SplitOutfitPackages(filteredOutfits);
    pagedItems = paginate(splitedOutfits);
    pagesCount = Math.ceil(splitedOutfits.length / itemsPerPage);
  };
  const refreshPagination = function (items) {
    page = 0;
    updatePagination(page, itemsPerPage);
  };

  const onSearch = function (e) {
    search = e.detail;
    refreshPagination(outfits);
  };

  $: updatePagination(page, itemsPerPage);
  $: refreshPagination(outfits);
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
    <div style="margin-top:8px;">
      <Search on:input={onSearch} />
    </div>
  </div>
  <div class="list">
    <div class:hidden={loading}>
      <OutfitPackageSnapshotList
        {renderer}
        bind:ready={listReady}
        items={pagedItems}
        on:select={selectOutfit}
      />
    </div>
    {#if loading}
      <div class="placeholders">
        {#each Array(itemsPerPage != -1 ? itemsPerPage : 64) as _}
          <Placeholder style="height:65px" />
        {/each}
      </div>
    {/if}
  </div>
  {#if itemsPerPage != -1 && pagedItems.length > 0}
    <div style="font-family:minecraft; text-align:right; margin-top:8px;">
      <button
        class="small icon"
        class:disabled={page == 0}
        on:click={() => (page = page - 1)}>{@html ChevronLeftIcon}</button
      >
      &nbsp;
      {page + 1} / {pagesCount}
      &nbsp;
      <button
        class="small icon"
        class:disabled={page >= splitedOutfits.length / itemsPerPage - 1}
        on:click={() => (page = page + 1)}>{@html ChevronRightIcon}</button
      >
    </div>
  {/if}
</div>

<style lang="scss">
  @import "OutfitPicker.scss";
</style>
