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
  } from "$src/data/common";

  import DownloadIcon from "$src/icons/download.svg?raw";
  import ImportPackageIcon from "$src/icons/upload.svg?raw";
  import DownloadPackageIcon from "$src/icons/flatten.svg?raw";
  import AddIcon from "$src/icons/plus.svg?raw";

  import { TweenAnimation } from "$src/data/animation";

  let itemModelType: Writable<string> = writable("alex");
  let baseLayer;
  let itemName = $_("defaultskinname");
  let itemLayers: Writable<FileData[]> = writable([]);
  let itemModel: Writable<string> = writable("");
  let modelTexture: string = null;
  let alexModel;
  let steveModel;
  let loaded = false;

  let fileInput;
  let file;

  let layersRenderer;

  let updateTexture = function (layers) {};

  itemLayers.subscribe((layers) => {
    updateTexture(layers);
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
      $itemModel = model == "alex" ? alexModel : steveModel;
    });

    updateTexture = async (layers) => {
      if (baseLayer) {
        modelTexture = await mergeImages(
          [...layers.map((x) => x.content), baseLayer].reverse(),
          undefined,
          $itemModelType
        );
      }
    };
    await updateTexture($itemLayers);
    loaded = true;
  });

  let upLayer = async function (e) {
    let index = $itemLayers.indexOf(e.detail.texture);
    if (index > 0) {
      itemLayers.update((layers) => {
        let temp = layers[index - 1];
        layers[index - 1] = layers[index];
        layers[index] = temp;
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
        return layers;
      });
    }
  };
  let removeLayer = async function (e) {
    let index = $itemLayers.indexOf(e.detail.texture);
    itemLayers.update((layers) => {
      layers.splice(index, 1);
      return layers;
    });
  };

  function handleFileChange(event) {
    let base64Data;
    file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      base64Data = event.target.result;
      var context = await GetContextFromBase64(
        base64Data
      );
      var newLayer = new FileData(
        file.name.replace(/\.[^/.]+$/, ""),
        base64Data,
        GetOutfitType(context)
      );
      itemLayers.update((layers) => {
        layers.unshift(newLayer);
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
      [...$itemLayers.map((x) => x.content)].reverse(),
      undefined,
      $itemModelType
    );
    link.download = itemName.toLowerCase() + ".png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addImagesToZip = function () {
    let zip = new JSZip();
    $itemLayers.forEach((layer, index) => {
      zip.file(layer.fileName + ".png", layer.content.split(",")[1], {
        base64: true,
      });
    });
    //generate json with data
    const packageData = {
      name: itemName,
      model: $itemModelType,
      layers: $itemLayers.map((x) => x.fileName),
    }; // replace with your actual data
    zip.file("data.json", JSON.stringify(packageData));

    zip.generateAsync({ type: "base64" }).then((data) => {
      const link = document.createElement("a");
      link.href = "data:application/zip;base64," + data;
      link.download = itemName.toLowerCase() + "_package.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const importImagesFromPackage = async function () {
    const fileInput = document.getElementById("fileInput") as any;
    fileInput.click();
    fileInput.addEventListener("change", async function () {
      const selectedFile = fileInput.files[0];

      fileInput.value = "";

      if (selectedFile) {
        const reader = new FileReader();

        reader.onload = async function (event) {
          const zip = new JSZip();
          zip.loadAsync(event.target.result).then(async function (contents) {
            let promises = Object.keys(contents.files)
              .filter((filename) => filename.endsWith(".png"))
              .map((filename) =>
                contents.files[filename]
                  .async("base64")
                  .then(async (content) => {
                    var context = await GetContextFromBase64(
                      "data:image/png;base64," + content
                    );
                    return new FileData(
                      filename.split(".")[0],
                      "data:image/png;base64," + content,
                      GetOutfitType(context)
                    );
                  })
              );
            let jsonData = null;
            if (contents.files["data.json"]) {
              await contents.files["data.json"]
                .async("string")
                .then(function (data) {
                  jsonData = JSON.parse(data);
                });
            }

            Promise.all(promises).then((layers) => {
              itemLayers.update((old) => {
                if (jsonData) {
                  itemName = jsonData.name;
                  $itemModelType = jsonData.model;
                  let layerstoInsert = jsonData.layers
                    .map((x) => layers.find((y) => y.fileName == x))
                    .filter((x) => x);
                  old.unshift(...layerstoInsert);
                } else {
                  old.unshift(...layers);
                }
                return old;
              });
            });
          });
        };

        reader.readAsArrayBuffer(selectedFile);
      }
    });
  };
</script>

<div class="item-page">
  <div class="render-data">
    <div class="render">
      {#if loaded}
        <SkinRender
          texture={modelTexture}
          model={$itemModel}
          onlyRenderSnapshot={false}
          animation={TweenAnimation}
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
                model={$itemModel}
                renderer={layersRenderer}
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
          <input type="file" id="fileInput" style="display: none;" />
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
