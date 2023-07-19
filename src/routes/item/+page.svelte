<script lang="ts">
  import mergeImages from "merge-images";

  import RatioButton from "$lib/RatioButton/RatioButton.svelte";
  import SkinRender from "$lib/render/SkinRender/SkinRender.svelte";
  import { onMount } from "svelte";
  import ItemLayer from "$lib/ItemLayer/ItemLayer.svelte";
  import { writable, type Writable } from "svelte/store";
  import { FileData } from "$src/data/common";
  import DownloadImage from "$lib/DownloadImage/DownloadImage.svelte";

  let itemModelType = "alex";
  let itemLayers:Writable<FileData[]> = writable([]);
  let itemModel: any = "";
  let itemTexture: string = null;
  let alexModel;
  let steveModel;

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
      btoa(await fetch("/player/alex.gltf").then((res) => res.text()));
    steveModel =
      "data:model/gltf+json;base64," +
      btoa(await fetch("/player/steve.gltf").then((res) => res.text()));

    updateTexture = async (layers) => {
      itemTexture = await mergeImages(layers.map(x=>x.content).reverse());
    };
    updateTexture($itemLayers);
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
          layers.unshift(new FileData(file.name.replace(/\.[^/.]+$/, ""), base64Data));
          return layers;
        });
      };
      reader.readAsDataURL(file)
  }

  const downloadImage = () => {
      const link = document.createElement('a');
      link.href = itemTexture;
      link.download = 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
</script>

<div class="item-page">
  <div class="render-data">
    <div class="render">
       {#if itemTexture && itemModel}
      <SkinRender texture={itemTexture} model={itemModel} />
    {/if}
    </div>
  </div>
  <div class="item-data">
    <span class="caption">Layers</span>
    <div class="item-layers">
      {#if itemTexture && itemModel}
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
        <input type="file" on:change={handleFileChange} style="display:none" bind:this={fileInput}/>
        <button id="add-layer-action" type="submit" class="secondary" on:click={fileInput.click()}>+ Add layer</button>
      </form>
    </div>
    <br />
    <span class="caption">Model</span>
    <div class="item-model">
      <RatioButton label="STEVE" value="steve" bind:group={itemModelType} />
      <RatioButton label="ALEX" value="alex" bind:group={itemModelType} />
    </div>
    <br />
    <br />
    <div class="item-actions">
      <!-- svelte-ignore a11y-img-redundant-alt -->
      <!-- svelte-ignore a11y-missing-attribute -->
      <img src={itemTexture} style="display:none"/>
      <button id="download-action" on:click={downloadImage}>Download</button>
    </div>
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
