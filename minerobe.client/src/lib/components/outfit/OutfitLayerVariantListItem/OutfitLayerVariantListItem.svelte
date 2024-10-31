<script lang="ts">
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import { CAMERA_CONFIG } from "$src/data/consts/render";
  import type { OutfitLayer } from "$src/model/package";

  export let item: OutfitLayer;
  export let model: "alex" | "steve";
  export let selected = false;
  export let label: string = "";
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<a
  class="outfit-layer-variant-list-item"
  class:selected
  on:click
  title={label || item.name}
>
  <OutfitPackageRender
    source={item[model].content}
    {model}
    outfitType={item.outfitType}
    cameraOptions={CAMERA_CONFIG.getForOutfit(item.outfitType)}
  />
</a>

<style lang="scss">
  @use "OutfitLayerVariantListItem.scss";
</style>
