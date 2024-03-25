<script lang="ts">
  import type { OutfitPackage } from "$src/data/common";
  import * as THREE from "three";
  import { createEventDispatcher, onMount } from "svelte";
  import { SplitOutfitPackages } from "$src/helpers/other/apiHelper";
  import Placeholder from "$component/base/Placeholder/Placeholder.svelte";
  import OutfitPackageSnapshotList from "$component/outfit/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import ChevronLeftIcon from "$icons/chevron-left.svg?raw";
  import ChevronRightIcon from "$icons/chevron-right.svg?raw";
  import Search from "$component/base/Search/Search.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";

  export let outfits: OutfitPackage[] = [];
  export let categories = ["ALL"];
  export let renderer = null;
  export let loading = false;
  export let page = 0;
  export let pagesCount = 0;
  export let itemsPerPage = 24;
  export let viewMode: "compact" | "full" = "full";

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
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
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
    if (viewMode == "full") {
      splitedOutfits = SplitOutfitPackages(filteredOutfits);
    } else {
      splitedOutfits = filteredOutfits;
    }
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
        {loading}
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
  {#if itemsPerPage != -1 && pagedItems.length > 0 && pagesCount > 1}
    <div
      style="margin-top:8px; display:flex;justify-content: flex-end;gap:8px;"
    >
      <Button
        type="tertiary"
        onlyIcon
        icon={ChevronLeftIcon}
        on:click={() => (page = page - 1)}
        disabled={page == 0}
      />
      <span
        class="mc-font-simple"
        style="margin:8px 0px;font-size:var(--size-font-caption)"
      >
        {page + 1} / {pagesCount}
      </span>
      <Button
        type="tertiary"
        onlyIcon
        icon={ChevronRightIcon}
        on:click={() => (page = page + 1)}
        disabled={page >= splitedOutfits.length / itemsPerPage - 1}
      />
    </div>
  {/if}
</div>

<style lang="scss">
  @import "OutfitPicker.scss";
</style>
