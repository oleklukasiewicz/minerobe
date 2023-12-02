<script lang="ts">
  import { _ } from "svelte-i18n";
  import { cubicOut } from "svelte/easing";
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
  export let readonly = false;
  export let controls = true;
  export let selected = false;
  export let selectable = false;
  export let label =
    texture?.name || texture[modelName]?.fileName || "New layer";

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
      css: (t) => `opacity: ${t}; transform: scale(${0.9 + t * 0.1})`,
    };
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="item-layer"
  class:selected
  class:selectable
  class:disabled={readonly}
  on:click
  in:fadeInScale={{ duration: 300 }}
  out:fadeInScale={{ duration: 300 }}
>
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
      ><input bind:value={label} />
      <br /><span class="label common">{texture[modelName].type}</span></span
    >
  </div>
  {#if !readonly}
    <div class="actions">
      <button
        class="secondary icon"
        title={$_("newLayerVariant")}
        on:click|stopPropagation={addVariant}
      >
        {@html UserPlusIcon}</button
      >
      {#if controls}
        <div class="separator vertical" />
        <button
          class="tertiary icon"
          title={$_("up")}
          on:click|stopPropagation={up}
          class:disabled={!canUp}
        >
          {@html UpIcon}</button
        >
        <button
          class="tertiary icon"
          title={$_("down")}
          on:click|stopPropagation={down}
          class:disabled={!canDown}>{@html DownIcon}</button
        >
      {/if}
      <div class="separator vertical" />
      <button class="tertiary icon" title={$_("remove")}  on:click|stopPropagation={remove}>
        {@html DeleteIcon}</button
      >
    </div>
  {/if}
</div>

<style lang="scss">
  @import "ItemLayer.scss";
</style>
