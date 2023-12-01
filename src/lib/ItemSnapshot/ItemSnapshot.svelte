<script lang="ts">
  import SkinSnapshot from "$lib/render/SkinSnapshot/SkinSnapshot.svelte";
  import { GetMinerobeUser } from "$src/api/auth";
  import type { OutfitLayer, OutfitPackage } from "$src/data/common";
  import {
    ConvertRGBToHex,
    FindInColors,
    GetColorFromImage,
  } from "$src/helpers/imageDataHelpers";
  import { onMount } from "svelte";

  export let texture: OutfitPackage = null;
  export let variant: string = null;
  export let model = null;
  export let modelName = "";
  export let renderer = undefined;
  export let label =
    texture?.name || "New outfit";
  let dominantColor = null;
  let dominantColorHex = null;
  let dominantColorString = null;
  let variantTexture = null;
  onMount(async () => {
    variantTexture = texture.layers.find((x) => x.id == variant)|| texture.layers[0];
    if(!variantTexture) return;
    dominantColor = await GetColorFromImage(variantTexture[texture.model].content);
    dominantColorString = FindInColors(dominantColor);
    dominantColorHex = ConvertRGBToHex(dominantColor);
    
  });

</script>

<div class="item-snapshot" on:click>
  {#if variantTexture}
  <SkinSnapshot
    texture={variantTexture[texture.model].content}
    {model}
    {renderer}
    {modelName}
    type={texture.type}
  />
  {/if}
  <div class="item-snapshot-data">
    <b class="item-snapshot-title">{label}</b>
    {#if texture.publisher}
      <span class="label unique">{texture.publisher.name}</span>
      <span
        class="color-viever"
        title={dominantColorString}
        style="background-color: {dominantColorHex};"
      ></span>
    {/if}
  </div>
</div>

<style lang="scss">
  @import "ItemSnapshot.scss";
</style>
