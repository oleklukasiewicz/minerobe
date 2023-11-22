<script lang="ts">
  import SkinSnapshot from "$lib/render/SkinSnapshot/SkinSnapshot.svelte";
  import { GetMinerobeUser } from "$src/api/auth";
  import { OUTFIT_TYPE, type OutfitPackage, type OutfitPackageMetadata } from "$src/data/common";
  import { mergeImages } from "$src/helpers/imageMerger";
  import { onMount } from "svelte";

  export let outfitPackage: OutfitPackage = null;
  export let model = null;
  export let modelName = "";
  export let renderer = undefined;
  export let label = outfitPackage.name || "New outfit";
  export let metadata: OutfitPackageMetadata = null;
  let texture: string = null;
  onMount(async () => {
    if (metadata.publisher == null && metadata.publisherId != null) {
      metadata.publisher = await GetMinerobeUser(metadata.publisherId);
    }
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
    <b class="item-set-snapshot-title">{label}</b>
    {#if metadata.publisher}
      <span class="label unique">{metadata.publisher.name}</span>
    {/if}
  </div>
</div>

<style lang="scss">
  @import "ItemSetSnapshot.scss";
</style>
