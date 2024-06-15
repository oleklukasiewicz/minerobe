<script lang="ts">
  import OutfitLayerRender from "$component/render/OutfitLayerRender.svelte";
  import type { RenderProvider } from "$src/data/render";
  import type { OutfitLayer } from "$src/model/package";

  export let item: OutfitLayer;;
  export let renderProvider: RenderProvider = null;
  export let modelName = null;
  export let selected = false;
  export let label = null;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="item-variant" class:selected on:click title={label}>
   <OutfitLayerRender {item} {modelName} {renderProvider}/>
</div>

<style lang="scss">
  @import "ItemVariant.scss";
</style>
