<script lang="ts">
  import SkinSnapshot from "$lib/render/SkinSnapshot/SkinSnapshot.svelte";
  import type { MinerobeUser, OutfitPackage } from "$src/data/common";
  import { OUTFIT_TYPE } from "$data/consts";
  import { mergeImages } from "$src/helpers/imageMerger";
  import { onMount } from "svelte";
  import { currentUser } from "$src/data/cache";

  import CloudIcon from "$icons/cloud.svg?raw";

  export let outfitPackage: OutfitPackage = null;
  export let model = null;
  export let modelName = "";
  export let renderer = undefined;
  export let label = outfitPackage.name || "New outfit";
  export let publisher: MinerobeUser = null;
  let texture: string = null;
  onMount(async () => {
    await mergeImages(
      [
        ...outfitPackage.layers.map((x) => x[outfitPackage.model].content),
      ].reverse(),
      undefined,
      outfitPackage.model
    ).then((img) => {
      texture = img;
    });
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="item-set-snapshot" on:click>
  <SkinSnapshot
    {texture}
    {model}
    {renderer}
    {modelName}
    type={OUTFIT_TYPE.OUTFIT_SET}
  />
  <div class="item-set-snapshot-data">
    <div class="data">
      <b class="item-set-snapshot-title">{label}</b>
      {#if outfitPackage.isShared}
        <div class="share-icon icon-small">{@html CloudIcon}</div>
      {/if}
    </div>
    {#if publisher.id != $currentUser?.id}
      <span class="label unique">{publisher.name}</span>
    {/if}
  </div>
</div>

<style lang="scss">
  @import "ItemSetSnapshot.scss";
</style>
