<script lang="ts">
  import { _ } from "svelte-i18n";
  import { writable, type Writable } from "svelte/store";
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { GetPackage } from "$src/api/pack";
  import { type OutfitPackage } from "$model/package";
  import { DEFAULT_PACKAGE } from "$src/data/consts/data.js";
  import { APP_STATE } from "$src/data/consts/app.js";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import { PACKAGE_TYPE } from "$src/data/consts.js";
  import {
    BASE_TEXTURE,
    CURRENT_APP_STATE,
    IS_MOBILE_VIEW,
  } from "$src/data/static.js";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";

  export let data;

  const itemPackage: Writable<OutfitPackage> = writable(DEFAULT_PACKAGE);
  let loaded = false;
  let isOutfitSet = false;
  let renderer: any = null;

  onMount(async () => {
    CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      renderer = new THREE.WebGLRenderer({
        alpha: true,
      });
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

      $itemPackage = await GetPackage(data.id);
      isOutfitSet = $itemPackage.type === PACKAGE_TYPE.OUTFIT_SET;
      loaded = true;
    });
  });
</script>

<div id="item-page" class:mobile={$IS_MOBILE_VIEW}>
  <div id="item-render">
    <div id="render">
      <Placeholder {loaded}>
        <OutfitPackageRender
          source={$itemPackage}
          isDynamic
          {renderer}
          resizable
          resizeDebounce={0}
          baseTexture={isOutfitSet ? $BASE_TEXTURE : $BASE_TEXTURE}
        /></Placeholder
      >
    </div>
  </div>
  <div id="item-data"></div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
