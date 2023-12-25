<script lang="ts">
  import SkinSnapshot from "$lib/render/SkinSnapshot/SkinSnapshot.svelte";
  import type { OutfitPackage } from "$src/data/common";
  import { onMount } from "svelte";
  import CloudIcon from "$icons/cloud.svg?raw";
  import { currentUser } from "$src/data/cache";
  import { ConvertRGBToHex, FindInColors, GetColorFromFileData } from "$src/helpers/colorHelper";

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
        await GetColorFromFileData(variantTexture[texture.model]),
      ];
    } else {
      dominantColor = await Promise.all(
        texture.layers.slice(0,limit).map(async (x) => {
          return await GetColorFromFileData(x[texture.model]);
        })
      );
      if (texture.layers.length > limit) {
        aboveLimit = texture.layers.length - limit;
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
    <div style="margin: 4px;">
      <SkinSnapshot
        texture={variantTexture[texture.model].content}
        {model}
        {renderer}
        {modelName}
        {refreshRender}
      />
    </div>
  {/if}
  <div class="item-snapshot-data">
    <div class="data">
      <b class="item-snapshot-title">{label}</b>
      {#if texture.isShared}
        <div class="share-icon icon-small">{@html CloudIcon}</div>
      {/if}
    </div>
    {#if texture.publisher}
      {#if texture.publisher.id != $currentUser.id}
        <span class="label unique">{texture.publisher.name}</span>
      {/if}
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
