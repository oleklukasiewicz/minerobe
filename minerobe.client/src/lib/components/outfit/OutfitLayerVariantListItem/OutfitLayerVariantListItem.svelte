<script lang="ts">
  //consts
  import { CAMERA_CONFIG } from "$src/data/consts/render";
  import type { MODEL_TYPE } from "$src/data/enums/model";

  //models
  import type { OutfitLayer } from "$data/models/package";

  //components
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";

  interface OutfitLayerVariantListItemProps {
    item: OutfitLayer;
    model: MODEL_TYPE;
    selected?: boolean;
    label?: string;
    onclick?: (event?: any) => void;
  }

  let {
    item,
    model,
    selected = false,
    label = "",
    onclick = null,
  }: OutfitLayerVariantListItemProps = $props();
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<a
  class="outfit-layer-variant-list-item"
  class:selected
  onclick={(event) => onclick?.(event)}
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
