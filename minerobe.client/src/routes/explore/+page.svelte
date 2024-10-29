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
  let laoded = false;
  let loadedPackage: any;
  let model = "alex";
  let isflat = false;
  let selectedLayerId = null;
  var packages = [];
  var singlePackage = null;

  const getLayer = async (id, item) => {
    return await GetLayer(id);
  };

  onMount(async () => {
    appState.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;

      var filter = new OutfitFilter();
      filter.type = PACKAGE_TYPE.OUTFIT_SET;

      var packagesits = await GetWardrobePackages(filter);
      packages = packagesits.items;

      singlePackage = await GetPackage("7f1f0171-7768-4018-a35e-25937ed40ad4");

      setTimeout(async () => {
        // packages = packages.map((x) => {
        //   x.model = x.model == "steve" ? "alex" : "steve";
        //   return x;
        // });
        //isflat = true;
      }, 3000);
      laoded = true;
    });
  });
</script>

<div class="layout">
  <div class="test">
    {#if laoded}
      <OutfitLayerList
      selectable={true}
        on:select={(ev) => {
          selectedLayerId = ev.detail.id;
        }}
        items={singlePackage.layers}
        model={singlePackage.model}
        {selectedLayerId}
      />
    {/if}
  </div>
  <!-- <div class="test">
    {#if laoded}
      {#each packages as item (item.id)}
        <OutfitPackageRender
          source={item}
          layerId={item.type == PACKAGE_TYPE.OUTFIT ? item.layers[0].id : null}
          isDynamic={false}
          isFlatten={isflat}
          baseTexture={item.type == PACKAGE_TYPE.OUTFIT_SET
            ? $baseTexture
            : null}
        />
      {/each}
    {/if}
  </div> -->
</div>

<style lang="scss">
  @use "style.scss";
</style>
