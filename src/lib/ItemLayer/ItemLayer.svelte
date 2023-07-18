<script lang="ts">
  import SkinSnapshot from "$lib/render/SkinSnapshot/SkinSnapshot.svelte";
  import type { FileData } from "$src/data/common";
  import { createEventDispatcher } from "svelte";

  export let texture: FileData = null;
  export let model = null;
  export let canUp = true;
  export let canDown = true;

  let dispatch = createEventDispatcher();

  let up = function () {
    dispatch("up", {
      texture: texture,
      model: model,
    });
  };
  let down = function () {
    dispatch("down", {
      texture: texture,
      model: model,
    });
  };
  let remove = function () {
    dispatch("remove", {
      texture: texture,
      model: model,
    });
  };
</script>

<div class="item-layer">
  <SkinSnapshot texture={texture.content} {model} />
  <span>{ texture.fileName|| "Layer"}</span>
  <button class="secondary" on:click={up} class:disabled={!canUp}>Up</button>
  <button class="secondary" on:click={down} class:disabled={!canDown}>Down</button>
  <div class="separator vertical"></div>
  <button class="secondary" on:click={remove}>Remove</button>
</div>

<style lang="scss">
  @import "ItemLayer.scss";
</style>
