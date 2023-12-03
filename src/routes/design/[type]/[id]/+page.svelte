<script lang="ts">
  import { _ } from "svelte-i18n";
  import * as THREE from "three";
  import { derived, writable, type Writable } from "svelte/store";
  import { propertyStore } from "svelte-writable-derived";
  import { onMount } from "svelte";

  import RatioButton from "$lib/RatioButton/RatioButton.svelte";
  import SkinRender from "$lib/render/SkinRender/SkinRender.svelte";
  import ItemVariant from "$lib/ItemVariant/ItemVariant.svelte";
  import ItemLayer from "$lib/ItemLayer/ItemLayer.svelte";

  import { FileData, OutfitLayer, OutfitPackage } from "$data/common";
  import {
    alexModel,
    steveModel,
    planksTexture,
    currentUser,
    wardrobe,
    appState,
  } from "$data/cache";
  import {
    APP_STATE,
    MODEL_TYPE,
    OUTFIT_TYPE,
    PACKAGE_TYPE,
  } from "$data/consts";

  import DownloadIcon from "$icons/download.svg?raw";
  import DownloadPackageIcon from "$icons/flatten.svg?raw";
  import HearthIcon from "$icons/heart.svg?raw";

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
  import {
    AddToWardrobe,
    IsItemInWardrobe,
    RemoveFromWardrobe,
  } from "$src/api/wardrobe";
  import { GetOutfit } from "$src/api/outfits";
  import Placeholder from "$lib/Placeholder/Placeholder.svelte";

  let localPackage: Writable<OutfitPackage> = writable(
    new OutfitPackage("New skin", MODEL_TYPE.ALEX, [])
  );
  let itemLayers: Writable<OutfitLayer[]> = propertyStore(
    localPackage,
    "layers"
  );
  let itemModelType: Writable<string> = propertyStore(localPackage, "model");
  let itemName: Writable<string> = propertyStore(localPackage, "name");
  let isItemSet = derived(localPackage, ($localPackage) => {
    return $localPackage.type == PACKAGE_TYPE.OUTFIT_SET;
  });
  let baseLayer;
  let itemModel: any = null;
  let modelTexture: string = null;
  let loaded = false;

  let updatedLayer: OutfitLayer = null;
  let layersRenderer;
  let isDragging = false;
  let selectedVariant: Writable<OutfitLayer> = writable(null);
  let isPackageInWardrobe = false;
  let updateAnimation: (animation: any) => void = () => {};

  onMount(async () => {
    layersRenderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
    });
    let type = $page.params.type;
    let id = $page.params.id;
    let outfitPackage;
    appState.subscribe(async (state) => {
      if (loaded || state != APP_STATE.READY) return;
      outfitPackage =
        type == PACKAGE_TYPE.OUTFIT
          ? await GetOutfit(id)
          : await GetOutfitSet(id);
      if (outfitPackage) {
        localPackage.set(outfitPackage);
        itemModel =
          $itemModelType == MODEL_TYPE.ALEX ? $alexModel : $steveModel;
        $selectedVariant = $itemLayers[0];
        isPackageInWardrobe = await IsItemInWardrobe(
          $localPackage.id,
          $localPackage.type
        );
      }
      baseLayer = $planksTexture;
      loaded = true;
      updateTexture();
    });
  });

  const downloadImage = async () => {
    await ExportImage([$selectedVariant], $itemModelType, $itemName);
    await updateAnimation(HandsUpAnimation);
    await updateAnimation(DefaultAnimation);
  };

  const updateTexture = async () => {
    if (baseLayer) {
      if ($isItemSet) {
        let layers = $itemLayers;
        if (layers) {
          modelTexture = await mergeImages(
            [
              ...layers.map((x) => x[$itemModelType].content),
              baseLayer,
            ].reverse(),
            undefined,
            $itemModelType
          );
        }
      } else {
        let layers = [baseLayer];
        if ($selectedVariant)
          layers.unshift($selectedVariant[$itemModelType].content);
        modelTexture = await mergeImages(
          layers.reverse(),
          undefined,
          $itemModelType
        );
      }
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
  const addToWardrobe = async function () {
    await AddToWardrobe($localPackage);
    isPackageInWardrobe = true;
  };
  const removeFromWardrobe = async function () {
    await RemoveFromWardrobe($localPackage.id);
    isPackageInWardrobe = false;
  };
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
      {:else}
        <Placeholder />
      {/if}
    </div>
  </div>
  <div class="item-data">
    <div class="data">
      <div class="item-name">
        <span class="caption inline">
          {#if loaded}
            {$_("name")}
          {:else}
            <Placeholder style="height:16px;width:64px;" />
          {/if}
        </span><br />
        <div id="item-title" class="title">
          {#if loaded}
            {$itemName}
          {:else}
            <Placeholder style="height:48px;margin-bottom:8px;" />
          {/if}
        </div>
        {#if loaded}
          <span class="label rare"
            >{$localPackage.type == PACKAGE_TYPE.OUTFIT
              ? $_("outfit")
              : $_("outfit_set")}</span
          >
          <span class="label unique" style="margin-left:8px"
            >{$localPackage.publisher.name}</span
          >
        {/if}
      </div>

      <br />
      <span class="caption">
        {#if loaded}
          {$isItemSet ? $_("layers") : $_("variants")}
        {:else}
          <Placeholder style="height:16px;width:64px;" />
        {/if}
      </span>

      {#if loaded}
        {#if isItemSet}
          {#each $itemLayers as item, index (item.id)}
            <div class="item-layer">
              <ItemLayer
                texture={item}
                selectable={!$isItemSet}
                controls={$isItemSet}
                model={itemModel}
                modelName={$localPackage.model}
                renderer={layersRenderer}
                bind:label={item.name}
                readonly={true}
              />
            </div>
          {/each}
        {:else}
          <div class="item-variants">
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
          </div>
        {/if}
      {/if}
      <br />
      <span class="caption">
        {#if loaded}
          {$_("model")}
        {:else}
          <Placeholder style="height:16px;width:64px;" />
        {/if}</span
      >
      <div class="item-model">
        <RatioButton
          label={$_("modelOpt.steve")}
          value={MODEL_TYPE.STEVE}
          disabled={!loaded}
          bind:group={$itemModelType}
        />
        <RatioButton
          label={$_("modelOpt.alex")}
          value={MODEL_TYPE.ALEX}
          disabled={!loaded}
          bind:group={$itemModelType}
        />
      </div>
      <br />
      <br />
      <div class="item-actions">
        <button
          id="download-action"
          on:click={downloadImage}
          class:disabled={$selectedVariant == null || !loaded}
          >{@html DownloadIcon}{$_("download")}</button
        >
        <!-- <button
          id="download-package-action"
          on:click={exportPackage}
          title={$_("downloadPackage")}
          class:disabled={$selectedVariant == null}
          class="icon tertiary">{@html DownloadPackageIcon}</button
        > -->
        {#if isPackageInWardrobe == false}
          <button
            id="add-to-wardrobe"
            on:click={addToWardrobe}
            title="Add to wardrobe"
            disabled={!loaded}
            class="icon tertiary">{@html HearthIcon}</button
          >
        {:else}
          <button
            id="remove-from-wardrobe"
            title="Already in wardrobe"
            disabled={!loaded}
            on:click={removeFromWardrobe}
            class="icon">{@html HearthIcon}</button
          >
        {/if}
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
