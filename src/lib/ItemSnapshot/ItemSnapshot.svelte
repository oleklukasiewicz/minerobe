<script lang="ts">
  import SkinSnapshot from "$lib/render/SkinSnapshot/SkinSnapshot.svelte";
  import type { OutfitLayer } from "$src/data/common";

  export let texture: OutfitLayer = null;
  export let model = null;
  export let modelName = "";
  export let renderer = undefined;
  export let label =
    texture?.name || texture[modelName]?.fileName || "New outfit";
    export let metadata = null;
</script>

<div class="item-snapshot">
  <SkinSnapshot
    texture={texture[modelName].content}
    {model}
    {renderer}
    {modelName}
    type={texture[modelName].type}
  />
  <div>
    <b class="item-snapshot-title">{label}</b>
  </div>
</div>

<style lang="scss">
  @import "ItemSnapshot.scss";
</style>
