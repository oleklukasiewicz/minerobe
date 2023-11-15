<script lang="ts">
  import SkinSnapshot from "$lib/render/SkinSnapshot/SkinSnapshot.svelte";
  import type { FileData } from "$src/data/common";

  export let texture: FileData;
  export let modelName = null;
  export let model = null;
  export let renderer = undefined;
  export let selected = false;
  export let label = null;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="item-variant" class:selected on:click>
  <div class="render" title={label}>
    <SkinSnapshot
      texture={texture.content}
      {model}
      {renderer}
      {modelName}
      type={texture.type}
    />
  </div>
</div>

<style lang="scss">
  @import "ItemVariant.scss";
</style>
