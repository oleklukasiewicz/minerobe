<script lang="ts">
  import { _ } from "svelte-i18n";
  import { writable, type Writable } from "svelte/store";
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { GetPackage } from "$src/api/pack";
  import { OutfitLayer, type OutfitPackage } from "$model/package";
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
  import HumanHandsUpIcon from "$icons/human-handsup.svg?raw";
  import DownloadIcon from "$icons/download.svg?raw";
  import CloudIcon from "$icons/cloud.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import MoreHorizontalIcon from "$icons/more-horizontal.svg?raw";
  import { FetchSettings } from "$src/api/settings";
  import { MinerobeUserSettingsSimple } from "$src/model/user";
  import { ImportImages, ImportImagesFromFiles } from "$src/helpers/import.js";
  import { ExportImage } from "$src/helpers/export.js";
  import HandsUpAnimation from "$src/animation/handsup";
  import NewOutfitBottomAnimation from "$src/animation/bottom.js";
  import NewOutfitBottomAltAnimation from "$src/animation/bottomAlt.js";
  import { GetAccount } from "$src/api/integration/minecraft.js";
  import type { MinecraftIntegrationSettings } from "$src/model/integration/minecraft";
  import CapeList from "$lib/components/outfit/CapeList/CapeList.svelte";
  import { propertyStore } from "svelte-writable-derived";
  import { MODEL_TYPE } from "$src/data/consts/model.js";

  export let data;

  const itemPackage: Writable<OutfitPackage> = writable(DEFAULT_PACKAGE);
  const itemPackageLayers: Writable<OutfitLayer[]> = propertyStore(
    itemPackage,
    "layers"
  );
  const renderConfiguration: Writable<OutfitPackageRenderConfig> = writable(
    new OutfitPackageRenderConfig()
  );
  let loaded = false;
  let isOutfitSet = false;
  let isMinecraftIntegrated = false;
  let userSettings: MinerobeUserSettingsSimple = null;
  let integrationSettings: MinecraftIntegrationSettings = null;
  let renderer: any = null;

  let __addAnimation = function (
    animation: RenderAnimation,
    force: boolean = false
  ) {};
  let getCurrentTexture = function (): string {
    return "";
  };

  onMount(async () => {
    CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      renderer = new THREE.WebGLRenderer({
        alpha: true,
      });
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

      $itemPackage = await GetPackage(data.id);
      isOutfitSet = $itemPackage.type === PACKAGE_TYPE.OUTFIT_SET;
      $renderConfiguration.modelName = $itemPackage.model as MODEL_TYPE;
      $renderConfiguration.item = $itemPackage;
      if (!isOutfitSet)
        $renderConfiguration.selectedLayerId = $itemPackage.layers[0].id;

      userSettings = await FetchSettings();
      if (isOutfitSet)
        $renderConfiguration.baseTexture = userSettings.baseTexture.layers[0];
      else $renderConfiguration.baseTexture = $BASE_TEXTURE;

      isMinecraftIntegrated = userSettings?.integrations.includes("minecraft");
      if (isMinecraftIntegrated) {
        integrationSettings = await GetAccount();
        $renderConfiguration.capeId = integrationSettings.currentCapeId;
      }

      loaded = true;
      setTimeout(() => addAnimation(null), 0);
    });
  });

  //layers
  const setSelectedLayer = (e) => {
    const layerId = e.detail.item.id;
    renderConfiguration.update((config) => {
      config.selectedLayerId = layerId;
      return config;
    });
  };
  const moveLayerDown = (e) => {
    const layer = e.detail.item;
    const index = e.detail.index;
    itemPackage.update((item) => {
      item.layers.splice(index, 1);
      item.layers.splice(index - 1, 0, layer);
      return item;
    });
    addAnimation(NewOutfitBottomAltAnimation);
  };
  const moveLayerUp = (e) => {
    const layer = e.detail.item;
    const index = e.detail.index;
    itemPackage.update((item) => {
      item.layers.splice(index, 1);
      item.layers.splice(index + 1, 0, layer);
      return item;
    });
    addAnimation(NewOutfitBottomAnimation);
  };
  const removeLayer = (e) => {
    const layer = e.detail.item;
    itemPackage.update((item) => {
      item.layers = item.layers.filter((l) => l.id !== layer.id);
      return item;
    });
  };
  //imports
  const importImage = async () => {
    const layers = await ImportImages();
    itemPackage.update((item) => {
      item.layers.push(...layers);
      return item;
    });
  };
  const importLayerFromDrop = async (e) => {
    const files = e.detail.items;
    const layers = await ImportImagesFromFiles(files);
    itemPackage.update((item) => {
      item.layers.push(...layers);
      return item;
    });
  };
  //export
  const exportPackage = async () => {
    await ExportImage(getCurrentTexture(), $itemPackage.name);
    addAnimation(HandsUpAnimation);
  };
  //animations
  const addAnimation = (animation: RenderAnimation) => {
    if (animation) __addAnimation(animation, false);
    __addAnimation(DefaultAnimation, true);
  };
</script>

<div id="item-page" class:mobile={$IS_MOBILE_VIEW}>
  <div id="item-render">
    <div id="render">
      <Placeholder {loaded}>
        <div id="render-node">
          <DragAndDrop on:drop={importLayerFromDrop}>
            <OutfitPackageRender
              bind:getCurrentTexture
              bind:addAnimation={__addAnimation}
              source={$renderConfiguration.item}
              model={$renderConfiguration.modelName}
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
    <div id="item-data-type">
      <Placeholder {loaded} height="24px" width="120px">
        <Label>{isOutfitSet ? "Outfit set" : "Outfit"}</Label>
      </Placeholder>
      <Placeholder {loaded} height="24px" width="120px">
        {#if $itemPackage?.social?.isShared}
          <Label variant="rare">Shared</Label>
        {/if}
      </Placeholder>
    </div>
    <div id="item-data-layers">
      <SectionTitle
        label={isOutfitSet ? "Outfits" : "Variants"}
        placeholder={!loaded}
      />
      {#if loaded}
        <OutfitLayerList
          items={$itemPackage.layers}
          selectable={!isOutfitSet}
          selectedLayerId={$renderConfiguration.selectedLayerId}
          movable={isOutfitSet}
          on:moveUp={moveLayerUp}
          on:moveDown={moveLayerDown}
          on:select={setSelectedLayer}
          on:delete={removeLayer}
          model={$itemPackage.model === MODEL_TYPE.ALEX ? "alex" : "steve"}
        ></OutfitLayerList>
      {/if}
      <div id="item-data-layers-options">
        <Placeholder {loaded} height="40px" loadedStyle={"flex:1"}>
          {#if isOutfitSet}
            <Button label={"Add outfit"} icon={AddIcon} type={"tertiary"} />
          {:else}
            <Button label={"Add variant"} icon={AddIcon} type={"tertiary"} />
          {/if}
        </Placeholder>
        {#if isOutfitSet && loaded}
          <Button
            label={"Import image"}
            icon={ImportPackageIcon}
            type={"tertiary"}
            on:click={importImage}
          />
        {/if}
      </div>
    </div>
    {#if isMinecraftIntegrated && loaded && isOutfitSet}
      <div id="item-data-integration">
        <SectionTitle label="Capes" />
        <CapeList
          items={integrationSettings.capes}
          bind:selectedCapeId={$renderConfiguration.capeId}
        />
      </div>
    {/if}
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
        <ModelRadioGroup bind:selectedValue={$renderConfiguration.modelName} />
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
    <div id="item-data-action">
      {#if loaded}
        {#if isMinecraftIntegrated && isOutfitSet}
          <Button
            label="Set my skin"
            type="primary"
            icon={HumanHandsUpIcon}
            size="large"
          />
        {/if}
        <Button
          on:click={exportPackage}
          label="Download"
          type="primary"
          size="large"
          onlyIcon={isMinecraftIntegrated && !$IS_MOBILE_VIEW && isOutfitSet}
          icon={DownloadIcon}
        />
        <Button
          label="Manage collections"
          type="tertiary"
          size="large"
          onlyIcon={!$IS_MOBILE_VIEW}
          icon={ListIcon}
        />
        {#if !$itemPackage?.social?.isShared}
          <Button
            label="Share"
            icon={CloudIcon}
            onlyIcon={!$IS_MOBILE_VIEW}
            size={"large"}
            type={"tertiary"}
          />
        {:else}
          <Button
            label="Social data"
            icon={MoreHorizontalIcon}
            onlyIcon={!$IS_MOBILE_VIEW}
            size={"large"}
            type={"tertiary"}
          />
        {/if}
      {:else}
        <Placeholder height="46px" />
        <Placeholder height="46px" />
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
