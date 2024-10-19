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
      var outfit = await GetPackage("198fc000-5982-4d63-beb2-fcf28a23a9a0");
      var outfit2 = await GetPackage("44fc8e9b-bced-4204-a8d0-86cf7d268a5b");
      var outfit3 = await GetPackage("b4a96641-ee20-487f-a2c2-4f5ad882af95");
      var outfit4 = await GetPackage("96ba5d80-c9a1-4c3d-8494-c71fa8c69b65");
      var outfit5 = await GetPackage("1e80b42d-d9df-4d0d-8b4a-0248de9464c3");
      var outfit6 = await GetPackage("2755a66a-5dc9-4657-8dfb-a071410e3dcf");
      packages = packagesits.items;
      packages.push(outfit);
      packages.push(outfit2);
      packages.push(outfit3);
      packages.push(outfit4);
      packages.push(outfit5);
      packages.push(outfit6);

      setTimeout(async () => {
        packages = packages.map((x) => {
          x.model = x.model == "steve" ? "alex" : "steve";
          return x;
        });
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
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
