<script lang="ts">
   import { _ } from 'svelte-i18n'
  import mergeImages from "merge-images";

  import RatioButton from "$lib/RatioButton/RatioButton.svelte";
  import SkinRender from "$lib/render/SkinRender/SkinRender.svelte";
  import { onMount } from "svelte";
  import ItemLayer from "$lib/ItemLayer/ItemLayer.svelte";
  import { writable, type Writable } from "svelte/store";
  import { FileData } from "$src/data/common";
  import { dataset_dev } from "svelte/internal";

  let itemModelType = "alex";
  let baseLayer;
  let itemName = $_("defaultskinname");
  let itemLayers: Writable<FileData[]> = writable([]);
  let itemModel: any = "";
  let itemTexture: string = null;
  let alexModel;
  let steveModel;
  let loaded = false;

  let fileInput;
  let file;

  const regex = /\/([\w\s()-]+)\.(png|PNG)$/;

  let updateTexture = function (layers) {};

  $: itemModel = itemModelType == "alex" ? alexModel : steveModel;
  itemLayers.subscribe((layers) => {
    updateTexture(layers);
  });

  onMount(async () => {
    alexModel =
      "data:model/gltf+json;base64," +
      btoa(await fetch("/model/alex.gltf").then((res) => res.text()));
    steveModel =
      "data:model/gltf+json;base64," +
      btoa(await fetch("/model/steve.gltf").then((res) => res.text()));

    await fetchImage("texture/default_planks.png").then((res) => {
      baseLayer = res;
    });

    updateTexture = async (layers) => {
      if (baseLayer)
        itemTexture = await mergeImages(
          [...layers.map((x) => x.content), baseLayer].reverse()
        );
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

    reader.onload = (event) => {
      base64Data = event.target.result;
      itemLayers.update((layers) => {
        layers.unshift(
          new FileData(file.name.replace(/\.[^/.]+$/, ""), base64Data)
        );
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

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = itemTexture;
    link.download = itemName.toLowerCase() + ".png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
</script>

<div class="item-page">
  <div class="render-data">
    <div class="render">
      {#if loaded}
        <SkinRender texture={itemTexture} model={itemModel} />
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
          <button
            id="add-layer-action"
            type="submit"
            class="secondary"
            on:click={fileInput.click()}>+ {$_("layersOpt.addLayer")}</button
          >
        </form>
      </div>
      <br />
      <span class="caption">{$_("model")}</span>
      <div class="item-model">
        <RatioButton
          label={$_("modelOpt.steve")}
          value="steve"
          bind:group={itemModelType}
        />
        <RatioButton
          label={$_("modelOpt.alex")}
          value="alex"
          bind:group={itemModelType}
        />
      </div>
      <br />
      <br />
      <div class="item-actions">
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <!-- svelte-ignore a11y-missing-attribute -->
        <img src={itemTexture} style="display:none" />
        <button id="download-action" on:click={downloadImage}
          >{$_("download")}</button
        >
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>