<script lang="ts">
  import { _ } from "svelte-i18n";
  import * as THREE from "three";
  import type { Writable } from "svelte/store";
  import writableDerived, { propertyStore } from "svelte-writable-derived";
  import { onDestroy, onMount } from "svelte";

  import RatioButton from "$lib/RatioButton/RatioButton.svelte";
  import SkinRender from "$lib/render/SkinRender/SkinRender.svelte";
  import ItemLayer from "$lib/ItemLayer/ItemLayer.svelte";

  import {
    FileData,
    MODEL_TYPE,
    OUTFIT_TYPE,
    OutfitLayer,
  } from "$data/common";
  import { itemPackage,alexModel,steveModel, planksTexture } from "$data/cache";

  import DownloadIcon from "$icons/download.svg?raw";
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import DownloadPackageIcon from "$icons/flatten.svg?raw";
  import AddIcon from "$icons/plus.svg?raw";

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

  let itemLayers: Writable<OutfitLayer[]> = propertyStore(
    itemPackage,
    "layers"
  );
  let itemModelType: Writable<string> = propertyStore(itemPackage, "model");
  let itemName: Writable<string> = propertyStore(itemPackage, "name");
  let baseLayer;
  let itemModel: any = null;
  let modelTexture: string = null;
  let loaded = false;

  let updatedLayer: OutfitLayer = null;
  let layersRenderer;
  let isDragging = false;

  let updateAnimation = function (anim) {};

  onMount(async () => {
    layersRenderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
    });
    baseLayer=$planksTexture;
    if (localStorage != null && $itemLayers.length == 0) {
      console.log("loading from local storage");
      const layersJson = localStorage.getItem("package");
      if (layersJson != null) {
        const localStorageData = JSON.parse(layersJson);
       $itemPackage =localStorageData;
      }
    }
    loaded = true;
    itemModel = $itemModelType == MODEL_TYPE.ALEX ? $alexModel : $steveModel;
    updateTexture($itemLayers.map((x) => x[$itemModelType]));
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
      layers.splice(index, 1);
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

  const exportPackage = async function () {
    await ExportImagePackageJson($itemLayers, $itemModelType, $itemName);
    await updateAnimation(ClapAnimation);
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
    const newPackage = await ImportImagePackageJson();
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
            let newPackage = await ImportImagePackageJsonFromFile(file);
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

  itemLayers.subscribe((layers) => {
    updateTexture(layers.map((x) => x[$itemModelType]));
  });
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
      updateTexture($itemLayers.map((x) => x[$itemModelType]));
    }
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
      </div>
      <span class="caption">{$_("layers")}</span>
      <div class="item-layers">
        {#if loaded}
       {#each $itemLayers as item, index}
            <div class="item-layer">
              <ItemLayer
                texture={item}
                model={itemModel}
                modelName={$itemPackage.model}
                renderer={layersRenderer}
                label={item.name}
                on:addvariant={addImageVariant}
                on:down={downLayer}
                on:up={upLayer}
                on:remove={removeLayer}
                canUp={index != 0}
                canDown={index != $itemLayers.length - 1}
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
            >{@html AddIcon} {$_("layersOpt.addLayer")}</button
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
