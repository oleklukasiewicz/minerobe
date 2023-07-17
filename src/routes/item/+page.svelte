<script lang="ts">
  import mergeImages from "merge-images";

  import RatioButton from "$lib/RatioButton/RatioButton.svelte";
  import SkinRender from "$lib/render/SkinRender/SkinRender.svelte";
  import { onMount } from "svelte";
  import ItemLayer from "$lib/ItemLayer/ItemLayer.svelte";

  let itemModelType = "alex";
  let itemLayers = ["/texture/base-bomber.png","/texture/test.png"];
  let itemModel = "/player/alex.gltf";
  let itemTexture: string = null;

  const regex = /\/([\w\s()-]+)\.(png|PNG)$/;

  let updateTexture = function (layers) {};

  $: itemModel = `/player/${itemModelType}.gltf`;
  $: updateTexture(itemLayers);

  onMount(async () => {
    updateTexture = async (layers) => {
      itemTexture = await mergeImages(layers.reverse());
    };
  });
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
      {#each itemLayers as layer}
        <div class="item-layer">
          <ItemLayer texture={layer} model={itemModel} />
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
