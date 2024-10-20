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
  import { CAMERA_CONFIG } from "$src/data/consts/render";
  import OutfitPackageListItem from "$lib/components/outfit/OutfitPackageListItem/OutfitPackageListItem.svelte";
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
      filter.type = null;

      var packagesits = await GetWardrobePackages(filter);
      packages = packagesits.items;

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
      {#each packages as item (item.id)}
        <OutfitPackageListItem {item} baseTexture={$planksTexture} />
      {/each}
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
  @import "style.scss";
</style>
