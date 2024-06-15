<script lang="ts">
  import * as THREE from "three";
  import { createEventDispatcher, onMount } from "svelte";
  import Placeholder from "$component/base/Placeholder/Placeholder.svelte";
  import OutfitPackageSnapshotList from "$component/outfit/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import ChevronLeftIcon from "$icons/chevron-left.svg?raw";
  import ChevronRightIcon from "$icons/chevron-right.svg?raw";
  import Search from "$component/base/Search/Search.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import type { OutfitPackage } from "$src/model/package";

  export let outfits: OutfitPackage[] = [];
  export let totalItemsCount = 0;
  export let categories = [];
  export let renderer = null;
  export let loading = false;
  export let itemsPerPage = 1;
  //export let viewMode: "compact" | "full" = "full";

  let options = {
    itemsPerPage: itemsPerPage,
    page: 0,
    filters: {
      category: "",
      search: "",
    },
  };
  $:paginate(options);

  const dispatch = createEventDispatcher();
  const selectOutfit = function (e) {
    //emity event
    const outfit = e.detail;
    dispatch("select", outfit);
  };

  onMount(async () => {
    loading = true;
    if (renderer == null) {
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    }
  });

  const selectCategory = function (category) {
    options.filters.category = category;
   options.page = 0;
  };
  const paginate = function (opt) {
    dispatch("optionsChanged", options);
  };
  const onSearch = function (e) {
    options.filters.search = e.detail;
  };
</script>

<div class="outfit-picker">
  <div>
    <button
      class="small"
      style="padding-bottom:4px;"
      class:secondary={options.filters.category != "" && options.filters.category != null}
      on:click={() => selectCategory("")}>ALL</button
    >
    &nbsp;
    {#each categories as category}
      <button
        class="small"
        class:secondary={options.filters.category  != category}
        style="margin-left:4px;padding-bottom:4px;"
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
        minItemWidth="200px"
        {renderer}
        {loading}
        items={outfits}
        on:select={selectOutfit}
      />
    </div>
    {#if loading}
      <div class="placeholders">
        {#each Array(options.itemsPerPage != -1 ? options.itemsPerPage : 64) as _}
          <Placeholder style="height:65px" />
        {/each}
      </div>
    {/if}
  </div>
  {#if options.itemsPerPage != -1 && totalItemsCount > 0 && Math.ceil(totalItemsCount / options.itemsPerPage) > 1}
    <div
      style="margin-top:8px; display:flex;justify-content: flex-end;gap:8px;"
    >
      <Button
        type="tertiary"
        onlyIcon
        icon={ChevronLeftIcon}
        on:click={() => (options.page = options.page - 1)}
        disabled={options.page == 0}
      />
      <span
        class="mc-font-simple"
        style="margin:8px 0px;font-size:var(--size-font-caption)"
      >
        {options.page + 1} / { Math.ceil(totalItemsCount/ options.itemsPerPage)}
      </span>
      <Button
        type="tertiary"
        onlyIcon
        icon={ChevronRightIcon}
        on:click={() => (options.page = options.page + 1)}
        disabled={options.page >= totalItemsCount / options.itemsPerPage - 1}
      />
    </div>
  {/if}
</div>

<style lang="scss">
  @import "OutfitPicker.scss";
</style>
