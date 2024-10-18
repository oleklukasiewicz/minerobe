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

      var filter = new OutfitFilter();
      filter.type = PACKAGE_TYPE.OUTFIT_SET;

      var packagesits = await GetWardrobePackages(filter);
      packages = packagesits.items;

      setTimeout(async () => {
        packages = packages.map((x) => {
          x.model = x.model == "steve" ? "alex" : "steve";
          return x;
        });
        isflat = true;
      }, 3000);
      laoded = true;
    });
  });
</script>

<div class="layout">
  <div class="test">
    {#if laoded}
      {#each packages as item}
        <OutfitPackageRender
          source={item}
          isDynamic={false}
          isFlatten={isflat}
          baseTexture={$baseTexture}
        />
      {/each}
    {/if}
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
