<script lang="ts">
  import { _ } from "svelte-i18n";
  import SkinSnapshot from "$lib/render/SkinSnapshot/SkinSnapshot.svelte";
  import type { FileData } from "$src/data/common";
  import { createEventDispatcher } from "svelte";

  import UpIcon from "$src/icons/chevron-up.svg?raw";
  import DownIcon from "$src/icons/chevron-down.svg?raw";
  import DeleteIcon from "$src/icons/close.svg?raw";
  import { text } from "@sveltejs/kit";

  export let texture: FileData = null;
  export let model = null;
  export let modelName = "";
  export let canUp = true;
  export let canDown = true;
  export let renderer = undefined;
  export let refreshRender = undefined;

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
    <div class="render">
      <SkinSnapshot
        texture={texture.content}
        {model}
        {renderer}
        {modelName}
        type={texture.type}
      />
    </div>
    <span
      >{texture.fileName || "Layer"}<br /><span class="label common"
        >{texture.type}</span
      ></span
    >
  </div>
  <div class="actions">
    <button
      class="tertiary icon"
      title={$_("up")}
      on:click={up}
      class:disabled={!canUp}
    >
      {@html UpIcon}</button
    >
    <button
      class="tertiary icon"
      title={$_("down")}
      on:click={down}
      class:disabled={!canDown}>{@html DownIcon}</button
    >
    <div class="separator vertical" />
    <button class="tertiary icon" title={$_("remove")} on:click={remove}>
      {@html DeleteIcon}</button
    >
  </div>
</div>

<style lang="scss">
  @import "ItemLayer.scss";
</style>
