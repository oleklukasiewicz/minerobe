<script lang="ts">
  //models
  import type { OutfitLayer, OutfitPackage } from "$data/models/package";

  //components
  import Label from "$lib/components/base/Label/Label.svelte";
  import ColorBadge from "$lib/components/other/ColorBadge/ColorBadge.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";

  //icons
  import CheckIcon from "$icons/check.svg?raw";

  interface OutfitPackageSingleLayerListItemProps {
    item: OutfitPackage;
    disabled?: boolean;
    selected?: boolean;
    selectable?: boolean;
    baseTexture?: OutfitLayer;
    onselect?: (event?: any) => void;
    onclick?: (event?: any) => void;
    onunselect?: (event?: any) => void;
  }

  let {
    item,
    disabled = false,
    selected = $bindable(false),
    selectable = false,
    baseTexture = null
  ,
    onselect = null,
    onclick = null,
    onunselect = null
  }: OutfitPackageSingleLayerListItemProps = $props();

  const onClick= function (e) {
    if (selectable) {
      onselect?.({ item: item });
      selected = true;
      return;
    }
    onclick?.({ item: item });
  };
  const onUnSelect= function (e) {
    e.stopPropagation();
    e.preventDefault();
    onunselect?.({ item: item });
    selected = false;
  };
</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<a
  class="outfit-package-single-layer-list-item"
  onclick={onClick}
  class:disabled
>
  {#if selectable && selected}
    <div class="item-selected" onclick={onUnSelect}>
      <div>{@html CheckIcon}</div>
    </div>
  {/if}
  <div class="render">
    <OutfitPackageRender source={item} {baseTexture} />
  </div>
  <div class="data">
    <span>{item.name}</span>
    <div>
      <ColorBadge
        color={item.layers[0]?.colorName}
        selectable={false}
        colorName={item.layers[0]?.colorName}
      />
      <Label dense>{item.outfitType}</Label>
    </div>
  </div>
</a>

<style lang="scss">
  @use "OutfitPackageSingleLayerListItem.scss";
</style>
