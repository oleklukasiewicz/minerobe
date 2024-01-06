<script lang="ts">
  import { _ } from "svelte-i18n";
  import { cubicOut } from "svelte/easing";
  import type { OutfitLayer } from "$src/data/common";
  import { createEventDispatcher } from "svelte";

  import UpIcon from "$src/icons/chevron-up.svg?raw";
  import DownIcon from "$src/icons/chevron-down.svg?raw";
  import DeleteIcon from "$src/icons/close.svg?raw";
  import UserPlusIcon from "$src/icons/user-plus.svg?raw";
  import ExternalLinkIcon from "$src/icons/external-link.svg?raw";
  import { LAYER_TYPE } from "$src/data/consts";
  import OutfitLayerRender from "$lib/render/OutfitLayerRender.svelte";
  import { RenderProvider } from "$src/data/render";
  import Label from "$lib/Label/Label.svelte";

  export let item: OutfitLayer;
  export let renderProvider: RenderProvider = new RenderProvider();
  export let modelName = "";
  export let canUp = true;
  export let canDown = true;
  export let readonly = false;
  export let controls = true;
  export let selected = false;
  export let selectable = false;
  export let multiVariant = true;
  export let showLabels = true;
  export let link = null;
  export let label = item?.name || item[modelName]?.fileName || "New layer";

  let dispatch = createEventDispatcher();

  let isDragging = false;
  let up = function () {
    dispatch("up", {
      texture: item,
    });
  };
  let addVariant = function () {
    dispatch("addvariant", {
      texture: item,
    });
  };
  let handleDrop = function (event) {
    event.preventDefault();
    if (multiVariant && item.type != LAYER_TYPE.REMOTE) {
      const files = event.dataTransfer.files;
      isDragging = false;
      dispatch("dropvariant", {
        files: files,
        texture: item,
      });
    }
  };
  const handleRenderDragOver = function (event) {
    event.preventDefault();
    isDragging = true;
  };
  const handleRenderDragEnter = function (event) {
    isDragging = true;
  };
  const handleRenderDragLeave = function (event) {
    isDragging = false;
  };
  let down = function () {
    dispatch("down", {
      texture: item,
    });
  };
  let remove = function () {
    dispatch("remove", {
      texture: item,
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
  class:drop-hover={isDragging &&
    multiVariant &&
    item.type != LAYER_TYPE.REMOTE}
  on:click
  in:fadeInScale={{ duration: 300 }}
  out:fadeInScale={{ duration: 300 }}
  on:drop={handleDrop}
  on:dragenter={handleRenderDragEnter}
  on:dragleave={handleRenderDragLeave}
  on:dragover={handleRenderDragOver}
>
  <div class="data">
    <div class="render">
      <OutfitLayerRender {item} {renderProvider} {modelName} />
    </div>
    <span
      ><input
        bind:value={label}
        class:disabled={item.type == LAYER_TYPE.REMOTE || readonly}
      />
      <br /><Label variant="common">{item[modelName].type}</Label>
      {#if showLabels}
        {#if item.type == LAYER_TYPE.REMOTE}
          <Label variant="rare" style="margin-left:8px;"
            >{$_("layerType.remote")}</Label
          >
        {/if}
      {/if}
    </span>
  </div>
  {#if link}
    <a href={link} target="_blank">
      <button
      style="margin: 10px;"
        class="secondary icon icon-small"
        title={"Go to outfit page"}
      >
        {@html ExternalLinkIcon}</button
      >
    </a>
  {/if}
  {#if !readonly}
    <div class="actions" >
      {#if multiVariant && item.type != LAYER_TYPE.REMOTE}
        <button
          class="secondary icon icon-small"
          title={$_("newLayerVariant")}
          on:click|stopPropagation={addVariant}
        >
          {@html UserPlusIcon}</button
        >
      {/if}
      {#if controls && multiVariant && item.type != LAYER_TYPE.REMOTE}
        <div class="separator vertical" />
      {/if}
      {#if controls}
        <button
          class="tertiary icon icon-small"
          title={$_("up")}
          on:click|stopPropagation={up}
          class:disabled={!canUp}
        >
          {@html UpIcon}</button
        >
        <button
          class="tertiary icon icon-small"
          title={$_("down")}
          on:click|stopPropagation={down}
          class:disabled={!canDown}>{@html DownIcon}</button
        >
      {/if}
      <div class="separator vertical" />
      <button
        class="tertiary icon icon-small"
        title={$_("remove")}
        on:click|stopPropagation={remove}
      >
        {@html DeleteIcon}</button
      >
    </div>
  {/if}
</div>

<style lang="scss">
  @import "ItemLayer.scss";
</style>
