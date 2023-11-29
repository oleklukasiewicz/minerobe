<script lang="ts">
  import { _ } from "svelte-i18n";
  import * as THREE from "three";
  import { writable, type Writable } from "svelte/store";
  import { propertyStore } from "svelte-writable-derived";
  import { onMount } from "svelte";

  import RatioButton from "$lib/RatioButton/RatioButton.svelte";
  import SkinRender from "$lib/render/SkinRender/SkinRender.svelte";
  import ItemVariant from "$lib/ItemVariant/ItemVariant.svelte";

  import { FileData, OutfitLayer, OutfitPackage } from "$data/common";
  import {
    alexModel,
    steveModel,
    planksTexture,
  } from "$data/cache";
  import { MODEL_TYPE, OUTFIT_TYPE } from "$data/consts";

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
  import { GetOutfitSet } from "$src/api/sets";
  import { page } from "$app/stores";

  let localPackage:Writable<OutfitPackage> = writable(new OutfitPackage("New skin", MODEL_TYPE.ALEX, []));
  let itemLayers: Writable<OutfitLayer[]> = propertyStore(localPackage, "layers");
  let itemModelType: Writable<string> = propertyStore(localPackage, "model");
  let itemName: Writable<string> = propertyStore(localPackage, "name");
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
    let outfitPackage=await GetOutfitSet($page.params.slug);
    if (outfitPackage) {
      localPackage.set(outfitPackage);
    }
    baseLayer = $planksTexture;
    loaded = true;
    itemModel = $itemModelType == MODEL_TYPE.ALEX ? $alexModel : $steveModel;
    updateTexture();
  });

  const downloadImage = async () => {
    await ExportImage([$selectedVariant], $itemModelType, $itemName);
    await updateAnimation(HandsUpAnimation);
    await updateAnimation(DefaultAnimation);
  };

  const exportPackage = async function () {
    await ExportImagePackageJson($localPackage);
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
      itemModel = model == MODEL_TYPE.ALEX ? $alexModel : $steveModel;
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
        <span class="label unique">Test</span>
      </div>
      <br/>
      <span class="caption">{$_("variant")}</span>
      <div class="item-variants">
        {#if loaded}
          {#each $itemLayers as layer, index}
            <ItemVariant
              texture={layer[$itemModelType]}
              model={itemModel}
              modelName={$itemModelType}
              renderer={layersRenderer}
              label={layer.name}
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
          value={MODEL_TYPE.STEVE}
          bind:group={$itemModelType}
        />
        <RatioButton
          label={$_("modelOpt.alex")}
          value={MODEL_TYPE.ALEX}
          bind:group={$itemModelType}
        />
      </div>
      <br />
      <br />
      <div class="item-actions">
        <button
          id="download-action"
          on:click={downloadImage}
          class:disabled={$selectedVariant == null}
          >{@html DownloadIcon}{$_("download")}</button
        >
        <button
          id="download-package-action"
          on:click={exportPackage}
          title={$_("downloadPackage")}
          class:disabled={$selectedVariant == null}
          class="icon tertiary">{@html DownloadPackageIcon}</button
        >
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
