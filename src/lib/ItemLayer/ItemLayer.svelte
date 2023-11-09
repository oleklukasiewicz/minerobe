<script lang="ts">
  import { _ } from "svelte-i18n";
  import { cubicOut } from 'svelte/easing';
  import SkinSnapshot from "$lib/render/SkinSnapshot/SkinSnapshot.svelte";
  import type { FileData, OutfitLayer } from "$src/data/common";
  import { createEventDispatcher } from "svelte";

  import UpIcon from "$src/icons/chevron-up.svg?raw";
  import DownIcon from "$src/icons/chevron-down.svg?raw";
  import DeleteIcon from "$src/icons/close.svg?raw";
  import UserPlusIcon from "$src/icons/user-plus.svg?raw";

  export let texture: OutfitLayer = null;
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
  let addVariant = function () {
    dispatch("addvariant", {
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
  function fadeInScale(node, { duration }) {
    return {
      duration,
      easing: cubicOut,
      css: (t) => `opacity: ${t}; transform: scale(${0.9 + t * 0.1})`
    };
  }
</script>

<div class="item-layer" in:fadeInScale={{ duration: 300 }} out:fadeInScale={{ duration: 300 }}>
  <div class="data">
    <div class="render">
      <SkinSnapshot
        texture={texture[modelName].content}
        {model}
        {renderer}
        {modelName}
        type={texture[modelName].type}
      />
    </div>
    <span
      >{texture.name || texture[modelName].fileName}<br /><span class="label common"
        >{texture[modelName].type}</span
      ></span
    >
  </div>
  <div class="actions">
    <button
      class="secondary icon"
      title={$_("newLayerVariant")}
      on:click={addVariant}
    >
      {@html UserPlusIcon}</button
    >
    <div class="separator vertical" />
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
