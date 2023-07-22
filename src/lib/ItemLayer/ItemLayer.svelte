<script lang="ts">
  import { _ } from "svelte-i18n";
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
  <div class="data">
    <div class="render"><SkinSnapshot texture={texture.content} {model} /></div>
    <span>{texture.fileName || "Layer"}</span>
  </div>
  <div class='actions'>
    <button class="secondary" on:click={up} class:disabled={!canUp}>{$_("up")}</button>
    <button class="secondary" on:click={down} class:disabled={!canDown}
      >{$_("down")}</button
    >
    <div class="separator vertical" />
    <button class="secondary" on:click={remove}>{$_("remove")}</button>
  </div>
</div>

<style lang="scss">
  @import "ItemLayer.scss";
</style>
