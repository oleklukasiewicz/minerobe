<script lang="ts">
  import Label from "$lib/components/base/Label/Label.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import { CAMERA_CONFIG } from "$src/data/consts/render";
  import type { OutfitLayer } from "$src/model/package";

  export let item: OutfitLayer;
  export let model: "alex" | "steve";
  export let outfitType: string;
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<a class="outfit-layer-list-item">
  <div class="render">
    <OutfitPackageRender
      source={item[model].content}
      {model}
      {outfitType}
      cameraOptions={CAMERA_CONFIG.getForOutfit(outfitType)}
    />
  </div>
  <div class="data">
    <span class="name">{item.name}</span>
    <Label variant="common">{item.outfitType}</Label>
  </div>
  <div class="actions"></div>
</a>

<style lang="scss">
  @use "OutfitlayerListItem.scss";
</style>
