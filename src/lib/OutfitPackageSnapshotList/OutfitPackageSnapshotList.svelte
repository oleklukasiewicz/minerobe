<script lang="ts">
  import * as THREE from "three";
  import OutfitPackageSnapshotItem from "$lib/OutfitPackageSnapshotItem/OutfitPackageSnapshotItem.svelte";
  import type { OutfitPackage } from "$src/data/common";
  import { createEventDispatcher, onMount } from "svelte";
  import {
    CreateDefaultRenderProvider,
  } from "$src/data/render";
  import { MODEL_TYPE } from "$src/data/consts";

  export let items: OutfitPackage[] = [];
  export let renderer = null;
  export let dense = true;
  export let ready = false;

  const dispatch = createEventDispatcher();

  let steveListProvider =null;
  let alexListProvider = null;

  onMount(async () => {
    if (renderer == null) {
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.shadowMap.enabled = true;
      renderer.outputEncoding = 1;
    }

    const providers = await CreateDefaultRenderProvider(renderer);
    steveListProvider = providers.steve;
    alexListProvider = providers.alex;

    ready = true;
  });

  const selectOutfit = function (item) {
    dispatch("select", item);
  };
</script>

<div class="outfit-package-list" class:dense>
  {#if ready}
    {#each items as item (item.id + item.layers[0]?.variantId)}
      <OutfitPackageSnapshotItem
        on:click={() => selectOutfit(item)}
        {item}
        {dense}
        renderProvider={item.model == MODEL_TYPE.STEVE
          ? steveListProvider
          : alexListProvider}
      />
    {/each}
  {/if}
</div>

<style lang="scss">
  .outfit-package-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 4px;
    max-width: 100%;
    &.dense {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }
</style>
