<script lang="ts">
  import { _ } from "svelte-i18n";
  import * as THREE from "three";
  import { writable, type Writable } from "svelte/store";
  import { propertyStore } from "svelte-writable-derived";
  import { onMount } from "svelte";

  import RatioButton from "$lib/RatioButton/RatioButton.svelte";
  import SkinRender from "$lib/render/SkinRender/SkinRender.svelte";

  import { FileData, OUTFIT_TYPE, OutfitLayer } from "$data/common";
  import {
    alexModel,
    steveModel,
    planksTexture,
  } from "$data/cache";

  import DownloadIcon from "$icons/download.svg?raw";
  import DownloadPackageIcon from "$icons/flatten.svg?raw";

  import DefaultAnimation from "$animation/default";
  import NewOutfitBottomAnimation from "$animation/bottom";
  import ClapAnimation from "$animation/clap";
  import HandsUpAnimation from "$animation/handsup";
  import WavingAnimation from "$animation/waving";
  import HatAnimation from "$src/animation/hat";

  import {
    ExportImage,
    ExportImagePackageJson,
  } from "$helpers/imageOperations";
  import { mergeImages } from "$helpers/imageMerger";
  import ItemVariant from "$lib/ItemVariant/ItemVariant.svelte";

  let itemLayers: Writable<OutfitLayer[]> = writable([]);
  let itemModelType: Writable<string> = writable("steve");
  let itemName: Writable<string> = writable("new Skin");
  let baseLayer;
  let itemModel: any = null;
  let modelTexture: string = null;
  let loaded = false;

  let updatedLayer: OutfitLayer = null;
  let layersRenderer;
  let isDragging = false;
  let selectedVariant: Writable<OutfitLayer> = writable(null);

  let updateAnimation = function (anim) {};

  onMount(async () => {
    layersRenderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
    });
    baseLayer = $planksTexture;
    if (localStorage != null && $itemLayers.length == 0) {
      console.log("loading from local storage");
      const layersJson = localStorage.getItem("package");
      if (layersJson != null) {
        const localStorageData = JSON.parse(layersJson);
        $itemLayers= localStorageData.layers;
        $itemModelType = localStorageData.model;
        $itemName = localStorageData.name;
      }
    }
    loaded = true;
    itemModel = $itemModelType == "alex" ? $alexModel : $steveModel;
    updateTexture();
  });

  const downloadImage = async () => {
    await ExportImage($itemLayers, $itemModelType, $itemName);
    await updateAnimation(HandsUpAnimation);
    await updateAnimation(DefaultAnimation);
  };

  const exportPackage = async function () {
    await ExportImagePackageJson($itemLayers, $itemModelType, $itemName);
    await updateAnimation(ClapAnimation);
    await updateAnimation(DefaultAnimation);
  };

  const updateTexture = async () => {
    if (baseLayer) {
      let layers = [baseLayer];
      if ($selectedVariant)
        layers.unshift($selectedVariant[$itemModelType].content);
      modelTexture = await mergeImages(
        layers.reverse(),
        undefined,
        $itemModelType
      );
      if (updatedLayer) {
        switch (updatedLayer[$itemModelType]?.type) {
          case OUTFIT_TYPE.HAT:
            await updateAnimation(HatAnimation);
            break;
          case OUTFIT_TYPE.TOP:
          case OUTFIT_TYPE.HOODIE:
            await updateAnimation(NewOutfitBottomAnimation);
            break;
          case OUTFIT_TYPE.SHOES:
            await updateAnimation(WavingAnimation);
            break;
        }
      }
      await updateAnimation(DefaultAnimation);
    }
  };

  itemModelType.subscribe((model) => {
    if ($itemLayers?.length != null) {
      itemModel = model == "alex" ? $alexModel : $steveModel;
      if (updatedLayer) {
        updatedLayer = new OutfitLayer(
          "null",
          new FileData("null", null, OUTFIT_TYPE.TOP),
          new FileData("null", null, OUTFIT_TYPE.TOP)
        );
      }
      updateTexture();
    }
  });
  selectedVariant.subscribe((variant) => {
    updateTexture();
  });
</script>

<div class="item-page">
  <div class="render-data">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="render" class:drop-hover={isDragging}>
      {#if loaded}
        <SkinRender
          texture={modelTexture}
          model={itemModel}
          modelName={$itemModelType}
          onlyRenderSnapshot={false}
          animation={DefaultAnimation}
          bind:changeAnimation={updateAnimation}
        />
      {/if}
    </div>
  </div>
  <div class="item-data">
    <div class="data">
      <div class="item-name">
        <span class="caption inline">{$_("name")}</span><br />
        <div id="item-title" class="title">{$itemName}</div>
      </div>
      <span class="caption">{$_("variant")}</span>
      <div class="item-variants">
        {#if loaded}
          {#each $itemLayers as layer, index}
            <ItemVariant
              texture={layer[$itemModelType]}
              model={itemModel}
              modelName={$itemModelType}
              renderer={layersRenderer}
              on:click={() => ($selectedVariant = layer)}
              selected={$selectedVariant == layer}
            />
          {/each}
        {/if}
      </div>
      <br />
      <span class="caption">{$_("model")}</span>
      <div class="item-model">
        <RatioButton
          label={$_("modelOpt.steve")}
          value="steve"
          bind:group={$itemModelType}
        />
        <RatioButton
          label={$_("modelOpt.alex")}
          value="alex"
          bind:group={$itemModelType}
        />
      </div>
      <br />
      <br />
      <div class="item-actions">
        <button
          id="download-action"
          on:click={downloadImage}
          class:disabled={$itemLayers.length == 0}
          >{@html DownloadIcon}{$_("download")}</button
        >
        <button
          id="download-package-action"
          on:click={exportPackage}
          title={$_("downloadPackage")}
          class:disabled={$itemLayers.length == 0}
          class="icon tertiary">{@html DownloadPackageIcon}</button
        >
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
