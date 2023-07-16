<script lang="ts">
  import mergeImages from "merge-images";

  import RatioButton from "$lib/RatioButton/RatioButton.svelte";
  import SkinRender from "$lib/render/SkinRender.svelte";
  import { onMount } from "svelte";

  let itemModelType = "alex";
  let itemLayers = ["/texture/test.png"];
  let itemModel = "/player/alex.gltf";
  let itemTexture: string = null;

  const regex = /\/([\w\s()-]+)\.(png|PNG)$/;

  let updateTexture = function (layers) {};

  $: itemModel = `/player/${itemModelType}.gltf`;
  $: updateTexture(itemLayers);

  onMount(async () => {
    updateTexture = async (layers) => {
      itemTexture = await mergeImages(layers);
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
    <span class="caption">Skin model</span>
    <div class="item-model">
      <RatioButton label="STEVE" value="steve" bind:group={itemModelType} />
      <RatioButton label="ALEX" value="alex" bind:group={itemModelType} />
    </div>
    <br />
    <span class="caption">Skin layers</span>
    <div class="item-layers">
      {#each itemLayers as layer}
        <div class="item-layer">
          {layer.match(regex)[1]}
        </div>
      {/each}
    </div>
    <br />
    <div class="item-actions">
      <button id="download-action">Download</button>
    </div>
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
