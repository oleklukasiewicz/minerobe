<script lang="ts">
  import Label from "$lib/components/base/Label/Label.svelte";
  import ColorBadge from "$lib/components/other/ColorBadge/ColorBadge.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import type { OutfitPackage } from "$data/models/package";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let item: OutfitPackage;
  export let disabled = false;
  export let selected = false;
  export let selectable = false;

  const onClick = function (e) {
    if (selectable) {
      dispatch("select", { item: item });
      selected = true;
      return;
    }
    dispatch("click", { item: item });
  };
  const onUnSelect = function (e) {
    e.stopPropagation();
    e.preventDefault();
    dispatch("unselect", { item: item });
    selected = false;
  };
</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<a
  class="outfit-package-single-layer-list-item"
  on:click={onClick}
  class:disabled
>
  {#if selectable && selected}
    <div class="item-selected" on:click={onUnSelect}>Selected</div>
  {/if}
  <div class="render">
    <OutfitPackageRender source={item} />
  </div>
  <div class="data">
    <span>{item.name}</span>
    <div>
      <ColorBadge
        color={item.layers[0].colorName}
        selectable={false}
        colorName={item.layers[0].colorName}
      />
      <Label dense>{item.outfitType}</Label>
    </div>
  </div>
</a>

<style lang="scss">
  @use "OutfitPackageSingleLayerListItem.scss";
</style>
