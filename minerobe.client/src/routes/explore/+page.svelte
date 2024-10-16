<script lang="ts">
  import { onMount } from "svelte";

  import {
    appState,
    baseTexture,
    defaultRenderer,
    planksTexture,
  } from "$data/cache";
  import { ALEX_MODEL, APP_STATE, OUTFIT_TYPE, PACKAGE_TYPE } from "$src/data/consts";
  import { GetPackage } from "$src/api/pack";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import { GetWardrobePackages } from "$src/api/wardrobe";
  import { OutfitFilter } from "$src/model/filter";
  let laoded = false;
  let loadedPackage: any;
  let model = "alex";
  let isflat = false;
  let laterId = null;
  var packages = [];
  onMount(async () => {
    appState.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;

      var filter= new OutfitFilter();
      filter.type=PACKAGE_TYPE.OUTFIT_SET;

      var packagesits = await GetWardrobePackages(filter);
      packages = packagesits.items;
      
      setTimeout(async () => {
        model = "steve";
        //isflat = true;
        //laterId = "fc06e7b0-1c46-4c09-897a-6689438070c6";
      }, 3000);
      laoded = true;
    });
  });
</script>

<div class="layout">
  <div style="width: 600px;height:600px">
    {#if laoded}
      {#each packages as item}
        <OutfitPackageRender
          source={item}
          isDynamic={false}
          layerId={laterId}
          isFlatten={isflat}
          baseTexture={$baseTexture}
          model={item.model}
        />
      {/each}
    {/if}
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
