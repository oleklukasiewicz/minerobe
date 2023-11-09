<script lang="ts">
  import { _ } from "svelte-i18n";
  import { mergeImages } from "$src/helpers/imageMerger";
  import JSZip from "jszip";
  import * as THREE from "three";

  import RatioButton from "$lib/RatioButton/RatioButton.svelte";
  import SkinRender from "$lib/render/SkinRender/SkinRender.svelte";
  import { onMount } from "svelte";
  import ItemLayer from "$lib/ItemLayer/ItemLayer.svelte";
  import { writable, type Writable } from "svelte/store";
  import {
    FileData,
    OUTFIT_TYPE,
    GetContextFromBase64,
    GetOutfitType,
    OutfitLayer,
  } from "$src/data/common";

  import DownloadIcon from "$src/icons/download.svg?raw";
  import ImportPackageIcon from "$src/icons/upload.svg?raw";
  import DownloadPackageIcon from "$src/icons/flatten.svg?raw";
  import AddIcon from "$src/icons/plus.svg?raw";

  import {
    DefaultAnimation,
    NewOutfitBottomAnimation,
    NewOutfitShoesAnimation,
    NewOutfitClapAnimation,
    FrendshipAnimation,
    HandsUpAnimation,
  } from "$src/data/animation";
  let itemModelType: Writable<string> = writable("alex");
  let baseLayer;
  let itemName = $_("defaultskinname");
  let itemLayers: Writable<OutfitLayer[]> = writable([]);
  let itemModel: any = null;
  let modelTexture: string = null;
  let alexModel;
  let steveModel;
  let loaded = false;

  let fileInput;
  let file;

  let layersRenderer;
  let updatedLayer: OutfitLayer = null;
  let newVariantData: any = null;

  let updateAnimation = function (anim) {};
  let updateTexture = function (layers) {};

  itemLayers.subscribe((layers) => {
    updateTexture(layers.map((x) => x[$itemModelType]));
  });

  onMount(async () => {
    layersRenderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
    });

    alexModel =
      "data:model/gltf+json;base64," +
      btoa(await fetch("/model/alex.gltf").then((res) => res.text()));
    steveModel =
      "data:model/gltf+json;base64," +
      btoa(await fetch("/model/steve.gltf").then((res) => res.text()));

    await fetchImage("texture/default_planks.png").then((res) => {
      baseLayer = res;
    });

    itemModelType.subscribe((model) => {
      itemModel = (model == "alex") ? alexModel : steveModel;
      updateTexture($itemLayers.map((x) => x[$itemModelType]));
    });

    updateTexture = async (layers) => {
      if (baseLayer) {
        modelTexture = await mergeImages(
          [...layers.map((x) => x.content), baseLayer].reverse(),
          undefined,
          $itemModelType
        );
        if (updatedLayer) {
          if (
            updatedLayer[$itemModelType]?.type == OUTFIT_TYPE.TOP ||
            updatedLayer[$itemModelType]?.type == OUTFIT_TYPE.HOODIE
          ) {
            await updateAnimation(NewOutfitBottomAnimation);
          }
          if (updatedLayer[$itemModelType]?.type == OUTFIT_TYPE.SHOES) {
            await updateAnimation(NewOutfitShoesAnimation);
          }
          await updateAnimation(DefaultAnimation);
        }
      }
    };
    await updateTexture($itemLayers.map((x) => x[$itemModelType]));
    loaded = true;
  });

  let upLayer = async function (e) {
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
  let downLayer = async function (e) {
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
  let removeLayer = async function (e) {
    let index = $itemLayers.indexOf(e.detail.texture);
    if (index != -1 && index != $itemLayers.length - 1) {
      updatedLayer = $itemLayers[index + 1];
    }
    itemLayers.update((layers) => {
      layers.splice(index, 1);
      return layers;
    });
  };

  function handleFileChange(event) {
    let base64Data;
    file = event.target.files[0];
    event.target.value = null;
    const reader = new FileReader();

    reader.onload = async (event) => {
      base64Data = event.target.result;
      var context = await GetContextFromBase64(base64Data);
      const outfitType = GetOutfitType(context);
      var newLayer = new FileData(
        file.name.replace(/\.[^/.]+$/, ""),
        base64Data,
        outfitType
      );
      itemLayers.update((layers) => {
        let newOutfit;
        if ($itemModelType == "alex")
          newOutfit = new OutfitLayer(newLayer.fileName, null, newLayer);
        else newOutfit = new OutfitLayer(newLayer.fileName, newLayer, null);
        updatedLayer = newOutfit;
        layers.unshift(newOutfit);

        return layers;
      });
    };
    reader.readAsDataURL(file);
  }
  function fetchImage(url) {
    return fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.onerror = () => {
            reject("Error occurred while reading the image.");
          };
          reader.readAsDataURL(blob);
        });
      });
  }

  const downloadImage = async () => {
    const link = document.createElement("a");
    link.href = await mergeImages(
      [...$itemLayers.map((x) => x[$itemModelType].content)].reverse(),
      undefined,
      $itemModelType
    );
    link.download = itemName.toLowerCase() + ".png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    await updateAnimation(HandsUpAnimation);
    await updateAnimation(DefaultAnimation);
  };

  const addImagesToZip = function () {
    let zip = new JSZip();
    let layerData: any[] = [];
    $itemLayers.forEach((layer, index) => {
      zip.file(
        "textures/" + index + "/" + layer.steve.fileName,
        layer.steve.content.split(",")[1],
        {
          base64: true,
        }
      );
      zip.file(
        "textures/" + index + "/" + layer.alex.fileName,
        layer.alex.content.split(",")[1],
        {
          base64: true,
        }
      );
      layerData.push({
        name: layer.name,
        folder: index,
        steve: layer.steve.fileName,
        alex: layer.alex.fileName,
      });
    });
    //generate json with data
    const packageData = {
      name: itemName,
      model: $itemModelType,
      layers: layerData,
    }; // replace with your actual data
    zip.file("data.json", JSON.stringify(packageData));

    zip.generateAsync({ type: "base64" }).then((data) => {
      const link = document.createElement("a");
      link.href = "data:application/zip;base64," + data;
      link.download = itemName.toLowerCase() + "_package.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      updateAnimation(NewOutfitClapAnimation);
      updateAnimation(DefaultAnimation);
    });
  };

  const addImageVariant = function (event) {
    const layer = newVariantData.detail.texture;
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = async (event) => {
        let base64Data: string = event.target.result as string;
        var context = await GetContextFromBase64(base64Data);
        var newLayer = new FileData(
          selectedFile.name.replace(/\.[^/.]+$/, ""),
          base64Data,
          GetOutfitType(context)
        );
        itemLayers.update((layers) => {
          const index = layers.indexOf(layer);
          if ($itemModelType == "alex") {
            layers[index].alex = newLayer;
          } else {
            layers[index].steve = newLayer;
          }
          return layers;
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const importPackage = async function (eventE) {
    const selectedFile = eventE.target.files[0];

    eventE.target.value = "";

    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = async function (event) {
        const zip = new JSZip();
        zip.loadAsync(event.target.result).then(async function (contents) {
          let jsonData = null;
          if (contents.files["data.json"]) {
            await contents.files["data.json"]
              .async("string")
              .then(function (data) {
                jsonData = JSON.parse(data);
              });
          } else {
            return;
          }
          itemName = jsonData.name;
          $itemModelType = jsonData.model;
          const texturesFolder = "textures/";
          let layersToLoad = jsonData.layers.map(async (x) => {
            const layerFolder = x.folder + "/";
            //load content of file async with await
            let steve;
            if (x.steve)
              steve = await contents.files[
                texturesFolder + layerFolder + x.steve
              ].async("base64");
            let alex;
            if (x.alex)
              alex = await contents.files[
                texturesFolder + layerFolder + x.alex
              ].async("base64");
            if (steve == null) steve = alex;
            if (alex == null) alex = steve;

            var steveContext = await GetContextFromBase64(
              "data:image/png;base64," + steve
            );
            var alexContext = await GetContextFromBase64(
              "data:image/png;base64," + alex
            );
            const steveFileData = new FileData(
              x.steve,
              "data:image/png;base64," + steve,
              GetOutfitType(steveContext)
            );
            const alexFileData = new FileData(
              x.alex,
              "data:image/png;base64," + alex,
              GetOutfitType(alexContext)
            );
            return new OutfitLayer(x.name, steveFileData, alexFileData);
          });

          let l = await Promise.all(layersToLoad).then((layers) => {
            let newLayers = [];
            jsonData.layers.forEach((x) => {
              const layerToInsert = layers.find((y) => y.name == x.name);
              if (layerToInsert) {
                newLayers.push(layerToInsert);
              }
            });
            itemLayers.update((old) => {
              old.unshift(...newLayers);
              return old;
            });
            const random = Math.random();

            if (random < 0) {
              updateAnimation(HandsUpAnimation);
            } else {
              updateAnimation(NewOutfitClapAnimation);
            }
            updateAnimation(DefaultAnimation);
          });
        });
      };

      reader.readAsArrayBuffer(selectedFile);
    }
  };
  const importImagesFromPackage = async function () {
    const fileInput = document.getElementById("fileInput") as any;
    fileInput.click();
  };
  const addVariant = async function (data) {
    newVariantData = data;
    const fileInput = document.getElementById("fileInputVariant") as any;
    fileInput.click();
  };
</script>

<div class="item-page">
  <div class="render-data">
    <div class="render">
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
        <input id="item-title" class="title-input" bind:value={itemName} />
      </div>
      <span class="caption">{$_("layers")}</span>
      <div class="item-layers">
        {#if loaded}
          {#each $itemLayers as layer, index (layer)}
            <div class="item-layer">
              <ItemLayer
                texture={layer}
                model={itemModel}
                modelName={$itemModelType}
                renderer={layersRenderer}
                on:addvariant={addVariant}
                on:down={downLayer}
                on:up={upLayer}
                on:remove={removeLayer}
                canUp={index != 0}
                canDown={index != $itemLayers.length - 1}
              />
            </div>
          {/each}
        {/if}
        <form style="display:flex">
          <input
            type="file"
            on:change={handleFileChange}
            style="display:none"
            bind:this={fileInput}
          />
          <input
            type="file"
            id="fileInput"
            style="display: none;"
            on:change={importPackage}
          />
          <input
            type="file"
            id="fileInputVariant"
            style="display: none;"
            on:change={addImageVariant}
          />
          <button
            id="add-layer-action"
            type="submit"
            class="secondary"
            on:click={fileInput.click()}
            >{@html AddIcon} {$_("layersOpt.addLayer")}</button
          >
          <button
            id="import-package-action"
            title={$_("importPackage")}
            on:click={importImagesFromPackage}
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
          on:click={addImagesToZip}
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
