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
  import { MODEL_TYPE, PACKAGE_TYPE } from "$src/data/consts.js";
  import {
    BASE_TEXTURE,
    CURRENT_APP_STATE,
    IS_MOBILE_VIEW,
  } from "$src/data/static.js";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import DefaultAnimation from "$src/animation/default.js";
  import type { RenderAnimation } from "$src/data/animation.js";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import Label from "$lib/components/base/Label/Label.svelte";
  import OutfitLayerList from "$lib/components/outfit/OutfitLayerList/OutfitLayerList.svelte";
  import RadioGroup from "$lib/components/base/RadioGroup/RadioGroup.svelte";
  import { ValueData } from "$src/model/base";

  export let data;

  const itemPackage: Writable<OutfitPackage> = writable(DEFAULT_PACKAGE);
  let loaded = false;
  let isOutfitSet = false;
  let renderer: any = null;

  let addAnimation = function (animation: RenderAnimation) {};

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
      setTimeout(() => {
        addAnimation(DefaultAnimation);
      }, 0);
    });
  });
</script>

<div id="item-page" class:mobile={$IS_MOBILE_VIEW}>
  <div id="item-render">
    <div id="render">
      <Placeholder {loaded}>
        <OutfitPackageRender
          bind:addAnimation
          source={$itemPackage}
          isDynamic
          resizable
          {renderer}
          resizeDebounce={0}
          baseTexture={isOutfitSet ? $BASE_TEXTURE : $BASE_TEXTURE}
        />
      </Placeholder>
    </div>
  </div>
  <div id="item-data">
    <SectionTitle label="Name" placeholder={!loaded} />
    <div id="item-data-title">
      <Placeholder {loaded} height="40px">
        <input class="title-input" bind:value={$itemPackage.name} />
      </Placeholder>
    </div>
    <Placeholder {loaded} height="24px" width="120px">
      <Label>{isOutfitSet ? "Outfit set" : "Outfit"}</Label>
    </Placeholder>
    <div id="item-data-layers">
      <SectionTitle
        label={isOutfitSet ? "Outfits" : "Variants"}
        placeholder={!loaded}
      />
      {#if loaded}
        <OutfitLayerList
          items={$itemPackage.layers}
          model={$itemPackage.model === MODEL_TYPE.ALEX ? "alex" : "steve"}
        ></OutfitLayerList>
      {/if}
    </div>
    <div id="item-data-integration"></div>
    <div id="item-data-model">
      <SectionTitle label="Model" placeholder={!loaded} />
      <Placeholder height="40px" {loaded}>
        <RadioGroup
          bind:selectedValue={$itemPackage.model}
          options={[
            new ValueData(MODEL_TYPE.STEVE, "Classic"),
            new ValueData(MODEL_TYPE.ALEX, "Slim"),
          ]}
        /></Placeholder
      >
    </div>
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
