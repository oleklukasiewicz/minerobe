<script lang="ts">
  import { _ } from "svelte-i18n";
  import * as THREE from "three";
  import { derived, writable, type Writable } from "svelte/store";
  import { propertyStore } from "svelte-writable-derived";
  import { onMount } from "svelte";

  import RatioButton from "$lib/RatioButton/RatioButton.svelte";
  import SkinRender from "$lib/render/SkinRender/SkinRender.svelte";
  import ItemLayer from "$lib/ItemLayer/ItemLayer.svelte";

  import { MODEL_TYPE, OUTFIT_TYPE, PACKAGE_TYPE } from "$data/consts";
  import { FileData, OutfitLayer } from "$data/common";
  import {
    itemPackage,
    alexModel,
    steveModel,
    planksTexture,
    currentUser,
  } from "$data/cache";

  import DownloadIcon from "$icons/download.svg?raw";
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import DownloadPackageIcon from "$icons/flatten.svg?raw";
  import AddIcon from "$icons/plus.svg?raw";
  import HearthIcon from "$icons/heart.svg?raw";
  import CloudIcon from "$icons/cloud.svg?raw";

  import DefaultAnimation from "$animation/default";
  import NewOutfitBottomAnimation from "$animation/bottom";
  import ClapAnimation from "$animation/clap";
  import HandsUpAnimation from "$animation/handsup";
  import WavingAnimation from "$animation/waving";
  import HatAnimation from "$src/animation/hat";

  import {
    ExportImage,
    ExportImagePackageJson,
    ImportImage,
    ImportImagePackageJson,
    ImportImagePackageJsonFromFile,
    ImportLayerFromFile,
  } from "$helpers/imageOperations";
  import { mergeImages } from "$helpers/imageMerger";
  import {
    AddToWardrobe,
    IsItemInWardrobe,
    RemoveFromWardrobe,
  } from "$src/api/wardrobe";
  import { ShareOutfitSet } from "$src/api/sets";

  let itemLayers: Writable<OutfitLayer[]> = propertyStore(
    itemPackage,
    "layers"
  );
  let itemModelType: Writable<string> = propertyStore(itemPackage, "model");
  let itemName: Writable<string> = propertyStore(itemPackage, "name");
  let itemPublisher = propertyStore(itemPackage, "publisher");
  let isItemSet = derived(itemPackage, ($itemPackage) => {
    return $itemPackage.type == PACKAGE_TYPE.OUTFIT_SET;
  });
  let baseLayer;
  let itemModel: any = null;
  let modelTexture: string = null;
  let loaded = false;

  let updatedLayer: OutfitLayer = null;
  let layersRenderer;
  let isDragging = false;
  let selectedLayer: Writable<OutfitLayer> = writable(null);

  let isPackageInWardrobe = false;

  let updateAnimation = function (anim) {};

  onMount(async () => {
    layersRenderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
    });
    baseLayer = $planksTexture;
    loaded = true;
    isPackageInWardrobe = IsItemInWardrobe($itemPackage.id, $itemPackage.type);
    itemModel = $itemModelType == MODEL_TYPE.ALEX ? $alexModel : $steveModel;
    if ($isItemSet) updateTexture($itemLayers.map((x) => x[$itemModelType]));
    else {
      if ($itemLayers.length > 0) {
        $selectedLayer = $itemLayers[0];
      } else {
        updateTexture([]);
      }
    }
  });

  const upLayer = async function (e) {
    let index = $itemLayers.indexOf(e.detail.texture);
    if (index > 0) {
      itemLayers.update((layers) => {
        let temp = layers[index - 1];
        layers[index - 1] = layers[index];
        layers[index] = temp;
        updatedLayer = layers[index - 1];
        return layers;
      });
    }
  };
  const downLayer = async function (e) {
    let index = $itemLayers.indexOf(e.detail.texture);
    if (index < $itemLayers.length - 1) {
      itemLayers.update((layers) => {
        let temp = layers[index + 1];
        layers[index + 1] = layers[index];
        layers[index] = temp;
        updatedLayer = layers[index + 1];
        return layers;
      });
    }
  };
  const removeLayer = async function (e) {
    let index = $itemLayers.indexOf(e.detail.texture);
    if (index != -1 && index != $itemLayers.length - 1) {
      updatedLayer = $itemLayers[index + 1];
    }
    itemLayers.update((layers) => {
      let refresh = false;
      if ($selectedLayer.name == layers[index].name) {
        refresh = true;
      }
      layers.splice(index, 1);
      if (refresh) {
        if ($itemLayers.length > 0) $selectedLayer = layers[0];
        else $selectedLayer = null;
      }
      return layers;
    });
  };

  const importLayer = async function () {
    const newLayer = await ImportImage();
    itemLayers.update((layers) => {
      let newOutfit;
      if ($itemModelType == MODEL_TYPE.ALEX)
        newOutfit = new OutfitLayer(newLayer.fileName, null, newLayer);
      else newOutfit = new OutfitLayer(newLayer.fileName, newLayer, null);
      updatedLayer = newOutfit;
      layers.unshift(newOutfit);

      return layers;
    });
  };

  const downloadImage = async () => {
    await ExportImage($itemLayers, $itemModelType, $itemName);
    await updateAnimation(HandsUpAnimation);
    await updateAnimation(DefaultAnimation);
  };

  const addImageVariant = async function (data) {
    const layer = data.detail.texture;
    const newLayer = await ImportImage();
    itemLayers.update((layers) => {
      const index = layers.indexOf(layer);
      if ($itemModelType == MODEL_TYPE.ALEX) {
        layers[index].alex = newLayer;
      } else {
        layers[index].steve = newLayer;
      }
      return layers;
    });
    updateAnimation(NewOutfitBottomAnimation);
  };

  const importPackage = async function () {
    const newPackage = await ImportImagePackageJson($itemPackage);
    $itemPackage = newPackage;

    const random = Math.random();

    if (random < 0.2) {
      updateAnimation(HandsUpAnimation);
    } else {
      if (random < 0.4) updateAnimation(WavingAnimation);
      else updateAnimation(ClapAnimation);
    }
    updateAnimation(DefaultAnimation);
  };

  const updateTexture = async (layers) => {
    if (baseLayer) {
      modelTexture = await mergeImages(
        [...layers.map((x) => x.content), baseLayer].reverse(),
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
  const sharePackage = async function () {
    const shared = await ShareOutfitSet($itemPackage);
  };
  const handleRenderDrop = async function (event) {
    event.preventDefault();

    if (event.dataTransfer.items) {
      for (var i = 0; i < event.dataTransfer.items.length; i++) {
        if (event.dataTransfer.items[i].kind === "file") {
          var file = event.dataTransfer.items[i].getAsFile();
          if (file.type.startsWith("image/")) {
            let newLayer = await ImportLayerFromFile(file);
            itemLayers.update((layers) => {
              let newOutfit;
              if ($itemModelType == MODEL_TYPE.ALEX)
                newOutfit = new OutfitLayer(newLayer.fileName, null, newLayer);
              else
                newOutfit = new OutfitLayer(newLayer.fileName, newLayer, null);
              updatedLayer = newOutfit;
              layers.unshift(newOutfit);

              return layers;
            });
          } else {
            let newPackage = await ImportImagePackageJsonFromFile(
              file,
              $itemPackage
            );
            $itemPackage = newPackage;
            const random = Math.random();

            if (random < 0.2) {
              updateAnimation(HandsUpAnimation);
            } else {
              if (random < 0.4) updateAnimation(WavingAnimation);
              else updateAnimation(ClapAnimation);
            }
            updateAnimation(DefaultAnimation);
          }
        }
      }
    }
    isDragging = false;
  };
  const handleRenderDragOver = function (event) {
    event.preventDefault();
  };
  const handleRenderDragEnter = function (event) {
    isDragging = true;
  };

  const handleRenderDragLeave = function (event) {
    isDragging = false;
  };

  const addToWardrobe = async function () {
    await AddToWardrobe($itemPackage);
    isPackageInWardrobe = true;
  };

  const removeFromWardrobe = async function () {
    await RemoveFromWardrobe($itemPackage.id);
    isPackageInWardrobe = false;
  };
  itemLayers.subscribe((layers) => {
    if ($isItemSet) updateTexture(layers.map((x) => x[$itemModelType]));
    else {
      if (layers.length > 0 && $selectedLayer == null)
        $selectedLayer = layers[0];
      else
        updateTexture(
          $selectedLayer != null ? [$selectedLayer[$itemModelType]] : []
        );
    }
  });
  itemModelType.subscribe((model) => {
    if ($itemLayers?.length > 0) {
      itemModel = model == MODEL_TYPE.ALEX ? $alexModel : $steveModel;
      if (updatedLayer) {
        updatedLayer = new OutfitLayer(
          "null",
          new FileData("null", null, OUTFIT_TYPE.TOP),
          new FileData("null", null, OUTFIT_TYPE.TOP)
        );
      }
      if ($isItemSet) updateTexture($itemLayers.map((x) => x[model]));
      else updateTexture([$selectedLayer[model]]);
    }
  });
  selectedLayer.subscribe((layer) => {
    if ($isItemSet) return;
    updateTexture(layer != null ? [layer[$itemModelType]] : []);
  });
</script>

<div class="item-page">
  <div class="render-data">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="render"
      class:drop-hover={isDragging}
      on:drop={handleRenderDrop}
      on:dragover={handleRenderDragOver}
      on:dragenter={handleRenderDragEnter}
      on:dragleave={handleRenderDragLeave}
    >
      {#if loaded}
        <SkinRender
          texture={modelTexture}
          model={itemModel}
          modelName={$itemPackage.model}
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
        <input
          id="item-title"
          class="title-input"
          bind:value={$itemPackage.name}
        />
        <span class="label rare"
          >{$itemPackage.type == PACKAGE_TYPE.OUTFIT
            ? $_("outfit")
            : $_("outfit_set")}</span
        >
        {#if $itemPublisher}
          <span class="label unique" style="margin-left:8px"
            >{$itemPublisher.name}</span
          >
        {/if}
        <br />
        <br />
      </div>
      <span class="caption">{$isItemSet ? $_("layers") : $_("variants")}</span>
      <div class="item-layers">
        {#if loaded}
          {#each $itemLayers as item, index (item.id)}
            <div class="item-layer">
              <ItemLayer
                texture={item}
                selectable={!$isItemSet}
                controls={$isItemSet}
                model={itemModel}
                modelName={$itemPackage.model}
                renderer={layersRenderer}
                bind:label={item.name}
                on:addvariant={addImageVariant}
                on:down={downLayer}
                on:up={upLayer}
                on:remove={removeLayer}
                canUp={index != 0}
                canDown={index != $itemLayers.length - 1}
                selected={item?.name == $selectedLayer?.name}
                on:click={() => ($selectedLayer = item)}
              />
            </div>
          {/each}
        {/if}
        <form style="display: flex;">
          <button
            id="add-layer-action"
            type="submit"
            class="secondary"
            on:click={importLayer}
            >{@html AddIcon}
            {$isItemSet
              ? $_("layersOpt.addLayer")
              : $_("layersOpt.addVariant")}</button
          >
          <button
            id="import-package-action"
            title={$_("importPackage")}
            on:click={importPackage}
            class="secondary"
            >{@html ImportPackageIcon} {$_("importPackage")}</button
          >
        </form>
      </div>
      <br />
      <span class="caption">{$_("model")}</span>
      <div class="item-model">
        <RatioButton
          label={$_("modelOpt.steve")}
          value={MODEL_TYPE.STEVE}
          bind:group={$itemPackage.model}
        />
        <RatioButton
          label={$_("modelOpt.alex")}
          value={MODEL_TYPE.ALEX}
          bind:group={$itemPackage.model}
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
        <!-- <button
          id="download-package-action"
          on:click={exportPackage}
          title={$_("downloadPackage")}
          class:disabled={$itemLayers.length == 0}
          class="icon tertiary">{@html DownloadPackageIcon}</button
        > -->
        {#if $itemPublisher.id == $currentUser?.id}
          <button
            id="share-package-action"
            on:click={sharePackage}
            class:disabled={$itemPackage.isShared}
            title={$_("sharePackage")}
            class="icon tertiary">{@html CloudIcon}</button
          >
        {/if}
        {#if isPackageInWardrobe == false}
          <button
            id="add-to-wardrobe"
            on:click={addToWardrobe}
            title="Add to wardrobe"
            class="icon tertiary">{@html HearthIcon}</button
          >
        {:else}
          <button
            on:click={removeFromWardrobe}
            id="add-to-wardrobe"
            title="Already in wardrobe"
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
