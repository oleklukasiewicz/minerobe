<script lang="ts">
  import { onMount } from "svelte";

  import {
    appState,
    baseTexture,
    defaultRenderer,
    planksTexture,
  } from "$data/cache";
  import {
    ALEX_MODEL,
    APP_STATE,
    OUTFIT_TYPE,
    PACKAGE_TYPE,
  } from "$src/data/consts";
  import { GetLayer, GetLayerSnapshot, GetPackage } from "$src/api/pack";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import { GetWardrobePackages } from "$src/api/wardrobe";
  import { OutfitFilter } from "$src/model/filter";
  import { CAMERA_CONFIG } from "$src/data/consts/render";
  import OutfitPackageListItem from "$lib/components/outfit/OutfitPackageListItem/OutfitPackageListItem.svelte";
  import OutfitLayerListItem from "$lib/components/outfit/OutfitLayerListItem/OutfitLayerListItem.svelte";
  import OutfitLayerList from "$lib/components/outfit/OutfitLayerList/OutfitLayerList.svelte";
  import { writable } from "svelte/store";
  import DefaultAnimation from "$src/animation/default";
  import DragAndDrop from "$lib/components/draganddrop/DragAndDrop/DragAndDrop.svelte";
  import MultiDragAndDrop from "$lib/components/draganddrop/MultiDragAndDrop/MultiDragAndDrop.svelte";
  let laoded = false;
  let loadedPackage: any;
  let model = "alex";
  let isflat = false;
  let selectedLayerId = null;
  var packages = [];
  var rendererNode;
  var singlePackage = writable(null);
  let addAnimationF = (animation) => {
    console.log("Adding animation front");
  };

  const getLayer = async (id, item) => {
    return await GetLayer(id);
  };
  const goUp = async (ev) => {
    const layer = ev.detail.item;
    singlePackage.update((x) => {
      const index = x.layers.findIndex((x) => x.id == layer.id);
      const temp = x.layers[index - 1];
      x.layers[index - 1] = layer;
      x.layers[index] = temp;
      return x;
    });
  };
  const goDown = async (ev) => {
    const layer = ev.detail.item;
    singlePackage.update((x) => {
      const index = x.layers.findIndex((x) => x.id == layer.id);
      const temp = x.layers[index + 1];
      x.layers[index + 1] = layer;
      x.layers[index] = temp;
      return x;
    });
  };

  onMount(async () => {
    appState.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;

      var filter = new OutfitFilter();
      filter.type = PACKAGE_TYPE.OUTFIT_SET;

      var packagesits = await GetWardrobePackages(filter);
      packages = packagesits.items;

      $singlePackage = await GetPackage("7f1f0171-7768-4018-a35e-25937ed40ad4");
      laoded = true;
      setTimeout(async () => {
        // packages = packages.map((x) => {
        //   x.model = x.model == "steve" ? "alex" : "steve";
        //   return x;
        // });
        //isflat = true;
        addAnimationF(DefaultAnimation);
      }, 0);
    });
  });
</script>

<div class="layout">
  <div style="margin:4px;">
    {#if laoded}
      <DragAndDrop on:drop={(e) => console.log(e.detail.items[0])}>
        <OutfitPackageRender
          source={$singlePackage}
          isDynamic={true}
          baseTexture={$baseTexture}
          bind:addAnimation={addAnimationF}
        /></DragAndDrop
      >
    {/if}
  </div>
  <div class="test">
    {#if laoded}
      <OutfitLayerList
        dropable
        on:drop={(e) => console.log(e.detail)}
        on:moveDown={goDown}
        on:moveUp={goUp}
        selectable={true}
        on:select={(ev) => {
          selectedLayerId = ev.detail.item.id;
        }}
        items={$singlePackage.layers}
        model={$singlePackage.model}
        {selectedLayerId}
      />
    {/if}
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
