<script lang="ts">
  import * as THREE from "three";
  import OutfitPackageSnapshotItem from "$lib/OutfitPackageSnapshotItem/OutfitPackageSnapshotItem.svelte";
  import type { OutfitPackage } from "$src/data/common";
  import { createEventDispatcher, onMount } from "svelte";
  import { PrepareSceneForRender, RenderProvider } from "$src/data/render";
  import { alexModel, steveModel } from "$src/data/cache";
  import { MODEL_TYPE } from "$src/data/consts";

  export let items: OutfitPackage[] = [];
  export let renderer = null;
  export let dense = true;

  const dispatch = createEventDispatcher();

  let steveListProvider = new RenderProvider();
  let alexListProvider = new RenderProvider();

  let ready = false;
  onMount(async () => {
    if (renderer == null) {
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.shadowMap.enabled = true;
      renderer.outputEncoding = 1;
    }

    steveListProvider.renderer = renderer;
    steveListProvider.textureLoader = new THREE.TextureLoader();

    alexListProvider = steveListProvider;

    let steveScene = await PrepareSceneForRender($steveModel);
    let alexScene = await PrepareSceneForRender($alexModel);

    steveListProvider.scene = steveScene.scene;
    steveListProvider.camera = steveScene.camera;

    alexListProvider.scene = alexScene.scene;
    alexListProvider.camera = alexScene.camera;
    ready = true;
  });

  const selectOutfit = function (item) {
   dispatch("select",item);
  };
</script>

<div class="outfit-package-list" class:dense>
  {#if ready}
    {#each items as item (item.id+item.layers[0].variantId)}
      <OutfitPackageSnapshotItem on:click={()=>selectOutfit(item)}
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
    grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
    gap: 4px;
    max-width: 100%;
    &.dense {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }
</style>
