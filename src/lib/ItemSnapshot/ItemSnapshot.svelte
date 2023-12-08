<script lang="ts">
  import SkinSnapshot from "$lib/render/SkinSnapshot/SkinSnapshot.svelte";
  import type { OutfitPackage } from "$src/data/common";
  import {
    ConvertRGBToHex,
    FindInColors,
    GetColorFromImage,
  } from "$src/helpers/imageDataHelpers";
  import { onMount } from "svelte";
  import CloudIcon from "$icons/cloud.svg?raw";

  export let texture: OutfitPackage = null;
  export let variant: string = null;
  export let model = null;
  export let modelName = "";
  export let renderer = undefined;
  export let extended = false;
  export let label = texture?.name || "New outfit";
  export let dense = false;
  let dominantColor = [];
  let variantTexture = null;
  const limit = 2;
  let aboveLimit = 0;
  onMount(async () => {
    variantTexture =
      texture.layers.find((x) => x.id == variant) || texture.layers[0];
    if (!variantTexture) return;
    if (!extended) {
      dominantColor = [
        await GetColorFromImage(variantTexture[texture.model].content),
      ];
    } else {
      dominantColor = await Promise.all(
        texture.layers.map(async (x) => {
          return await GetColorFromImage(x[texture.model].content);
        })
      );
      if (dominantColor.length > limit) {
        aboveLimit = dominantColor.length - limit;
        dominantColor = dominantColor.slice(0, limit);
      }
    }
  });
  let refreshRender = function () {};
  const setVariant = function (index) {
    variantTexture = texture.layers[index];
    if (renderer) {
      refreshRender();
    }
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="item-snapshot" on:click class:dense>
  {#if variantTexture}
    <SkinSnapshot
      texture={variantTexture[texture.model].content}
      {model}
      {renderer}
      {modelName}
      {refreshRender}
    />
  {/if}
  <div class="item-snapshot-data">
    <div class="data">
      <b class="item-snapshot-title">{label}</b>
      {#if texture.isShared}
        <div class="share-icon icon-small">{@html CloudIcon}</div>
      {/if}
    </div>
    {#if texture.publisher}
      <span class="label unique">{texture.publisher.name}</span>
      <div class="colors">
        {#each dominantColor as color, index}
          <span
            class="color-viever"
            title={FindInColors(color)}
            style="background-color: {ConvertRGBToHex(color)}; margin-left:4px;"
            on:click|stopPropagation={() => setVariant(index)}
          ></span>
        {/each}
        {#if aboveLimit > 0}
          <span
            style="font-family:minecraft;margin-right:4px;vertical-align:top;"
            >+{aboveLimit}</span
          >
        {/if}
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @import "ItemSnapshot.scss";
</style>
