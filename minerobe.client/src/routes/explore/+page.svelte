<script lang="ts">
  import { onMount } from "svelte";

  import {
    appState,
    baseTexture,
    defaultRenderer,
    planksTexture,
  } from "$data/cache";
  import { ALEX_MODEL, APP_STATE } from "$src/data/consts";
  import { GetPackage } from "$src/api/pack";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  let laoded = false;
  let loadedPackage: any;
  let model = "alex";
  let isflat = false;
  let laterId = null;
  onMount(async () => {
    appState.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;

      loadedPackage = await GetPackage("7f1f0171-7768-4018-a35e-25937ed40ad4");

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
      <OutfitPackageRender
        source={loadedPackage}
        isDynamic={true}
        layerId={laterId}
        isFlatten={isflat}
        baseTexture={$baseTexture}
        {model}
      />
    {/if}
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
