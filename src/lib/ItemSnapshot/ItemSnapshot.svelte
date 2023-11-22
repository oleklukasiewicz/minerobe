<script lang="ts">
  import SkinSnapshot from "$lib/render/SkinSnapshot/SkinSnapshot.svelte";
  import { GetMinerobeUser } from "$src/api/auth";
  import type { OutfitLayer, OutfitPackageMetadata } from "$src/data/common";
  import { ConvertRGBToHex, FindInColors, GetColorFromImage } from "$src/helpers/imageDataHelpers";
  import { onMount } from "svelte";

  export let texture: OutfitLayer = null;
  export let model = null;
  export let modelName = "";
  export let renderer = undefined;
  export let label =
    texture?.name || texture[modelName]?.fileName || "New outfit";
  export let metadata: OutfitPackageMetadata = null;
  let dominantColor = null;
  let dominantColorHex = null;
  let dominantColorString = null;
  onMount(async () => {
    if (metadata.publisher == null) {
      metadata.publisher = await GetMinerobeUser(metadata.publisherId);
    }
    dominantColor= await GetColorFromImage(texture[modelName].content);
    dominantColorString = FindInColors(dominantColor);
    dominantColorHex = ConvertRGBToHex(dominantColor);
  });
</script>

<div class="item-snapshot">
  <SkinSnapshot
    texture={texture[modelName].content}
    {model}
    {renderer}
    {modelName}
    type={texture[modelName].type}
  />
  <div class="item-snapshot-data">
    <b class="item-snapshot-title">{label}</b>
    {#if metadata.publisher}
      <span class="label unique">{metadata.publisher.name}</span>
      <span class="color-viever" title="{dominantColorString}" style="background-color: {dominantColorHex};"></span>
    {/if}
  </div>
</div>

<style lang="scss">
  @import "ItemSnapshot.scss";
</style>
