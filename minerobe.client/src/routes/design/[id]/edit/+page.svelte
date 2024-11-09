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
  import DragAndDrop from "$lib/components/draganddrop/DragAndDrop/DragAndDrop.svelte";
  import ModelRadioGroup from "$lib/components/outfit/ModelRadioGroup/ModelRadioGroup.svelte";
  import { OutfitPackageRenderConfig } from "$src/model/render";
  import Button from "$lib/components/base/Button/Button.svelte";
  import TrashIcon from "$icons/trash.svg?raw";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import AddIcon from "$icons/plus.svg?raw";

  export let data;

  const itemPackage: Writable<OutfitPackage> = writable(DEFAULT_PACKAGE);
  const renderConfiguration: Writable<OutfitPackageRenderConfig> = writable(
    new OutfitPackageRenderConfig()
  );
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
      itemPackage.subscribe((item) => {
        renderConfiguration.update((config) => {
          config.model = item.model === MODEL_TYPE.ALEX ? "alex" : "steve";
          config.item = item;
          config.baseTexture = isOutfitSet ? $BASE_TEXTURE : $BASE_TEXTURE;
          config.selectedLayerId = null;
          return config;
        });
      });
    });
  });
</script>

<div id="item-page" class:mobile={$IS_MOBILE_VIEW}>
  <div id="item-render">
    <div id="render">
      <Placeholder {loaded}>
        <div id="render-node">
          <DragAndDrop>
            <OutfitPackageRender
              bind:addAnimation
              source={$renderConfiguration.item}
              isDynamic
              layerId={$renderConfiguration.selectedLayerId}
              isFlatten={$renderConfiguration.isFlatten}
              resizable
              {renderer}
              resizeDebounce={0}
              baseTexture={$renderConfiguration.baseTexture}
            />
          </DragAndDrop>
        </div>
      </Placeholder>
    </div>
  </div>
  <div id="item-data">
    <SectionTitle label="Name" placeholder={!loaded} />
    <Placeholder {loaded} height="40px">
      <div id="item-data-title">
        <input class="title-input" bind:value={$itemPackage.name} />
        <Button onlyIcon icon={TrashIcon} label={"Delete"} type={"tertiary"} />
      </div>
    </Placeholder>
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
      <div id="item-data-layers-options">
        <Placeholder {loaded} height="40px">
          {#if isOutfitSet}
            <Button label={"Add outfit"} icon={AddIcon} type={"tertiary"} />
          {:else}
            <Button label={"Add variant"} icon={AddIcon} type={"tertiary"} />
          {/if}
        </Placeholder>
        <Placeholder {loaded} height="40px">
          <Button
            label={"Import image"}
            icon={ImportPackageIcon}
            type={"tertiary"}
          />
        </Placeholder>
      </div>
    </div>
    <div id="item-data-integration"></div>
    <div id="item-data-description">
      <SectionTitle label="Description" placeholder={!loaded} />
      <Placeholder height="40px" {loaded}>
        <textarea id="description-input" bind:value={$itemPackage.description}
        ></textarea>
      </Placeholder>
    </div>
    <div id="item-data-model">
      <SectionTitle label="Model" placeholder={!loaded} />
      <Placeholder height="40px" {loaded}>
        <ModelRadioGroup bind:selectedValue={$itemPackage.model} />
      </Placeholder>
    </div>
    <div id="item-data-minimal">
      <Placeholder width="150px" height="30px" {loaded}>
        <Checkbox
          label="Minimal format"
          bind:value={$renderConfiguration.isFlatten}
        />
      </Placeholder>
    </div>
    <div id="item-data-action"></div>
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
