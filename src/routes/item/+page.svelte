<script lang="ts">
  import mergeImages from "merge-images";

  import RatioButton from "$lib/RatioButton/RatioButton.svelte";
  import SkinRender from "$lib/render/SkinRender/SkinRender.svelte";
  import { onMount } from "svelte";
  import ItemLayer from "$lib/ItemLayer/ItemLayer.svelte";
  import { writable } from "svelte/store";

  let itemModelType = "alex";
  let itemLayers = writable(["/texture/base-bomber.png","/texture/test.png"]);
  let itemModel:any = "";
  let itemTexture: string = null;
  let alexModel;
  let steveModel;

  const regex = /\/([\w\s()-]+)\.(png|PNG)$/;

  let updateTexture = function (layers) {};
  
  $: itemModel = itemModelType == "alex" ? alexModel : steveModel;
  itemLayers.subscribe((layers) => {
    updateTexture(layers);
  });

  onMount(async () => {
    alexModel='data:model/gltf+json;base64,'+ btoa(await fetch("src/player/alex.gltf").then((res) => res.text()));
    steveModel='data:model/gltf+json;base64,'+ btoa(await fetch("src/player/steve.gltf").then((res) => res.text()));
   
    updateTexture = async (layers) => {
      itemTexture = await mergeImages([...layers].reverse());
    };
    updateTexture($itemLayers);
  });

  let upLayer=async function (e) {
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
  let downLayer= async function (e) {
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
  let removeLayer= async function (e) {
    let index = $itemLayers.indexOf(e.detail.texture);
      itemLayers.update((layers) => {
        layers.splice(index, 1);
        return layers;
      });
  };
</script>

<div class="item-page">
  <div class="render-data">
    {#if itemTexture}
      <SkinRender texture={itemTexture} model={itemModel} />
    {/if}
  </div>
  <div class="item-data">
    <span class="caption">Layers</span>
    <div class="item-layers">
      {#each $itemLayers as layer,index (layer)}
        <div class="item-layer">
          <ItemLayer texture={layer} model={itemModel} on:down={downLayer} on:up={upLayer} on:remove={removeLayer} canUp={index!=0} canDown={index!=$itemLayers.length-1}/>
        </div>
      {/each}
      <button id="add-layer-action" class="secondary">+ Add layer</button>
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
      <button id="download-action">Download</button>
    </div>
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
