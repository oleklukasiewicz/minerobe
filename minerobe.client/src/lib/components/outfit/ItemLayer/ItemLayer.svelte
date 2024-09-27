<script lang="ts">
  import { _ } from "svelte-i18n";
  import { cubicOut } from "svelte/easing";
  import { createEventDispatcher } from "svelte";

  import UpIcon from "$src/icons/chevron-up.svg?raw";
  import DownIcon from "$src/icons/chevron-down.svg?raw";
  import DeleteIcon from "$src/icons/close.svg?raw";
  import EditIcon from "$src/icons/edit.svg?raw";
  import ExternalLinkIcon from "$src/icons/external-link.svg?raw";
  import { LAYER_TYPE, MODEL_TYPE } from "$src/data/consts";
  import OutfitLayerRender from "$component/render/OutfitLayerRender.svelte";
  import { RenderProvider } from "$src/data/render";
  import Label from "$component/base/Label/Label.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import type { OutfitLayer } from "$src/model/package";

  export let item: OutfitLayer;
  export let renderProvider: RenderProvider = new RenderProvider();
  export let modelName = "";
  export let canUp = true;
  export let canDown = true;
  export let readonly = false;
  export let controls = true;
  export let selected = false;
  export let multiVariant = true;
  export let showLabels = true;
  export let link = null;
  export let label = item?.name || item[modelName]?.fileName || "New layer";

  let dispatch = createEventDispatcher();

  let isDragging = false;
  let isAlexDragging = false;
  let isSteveDragging = false;

  let up = function () {
    dispatch("up", {
      texture: item,
    });
  };
  let handleDrop = function (event, model = MODEL_TYPE.ALEX) {
    event.preventDefault();
    if (multiVariant && item.type != LAYER_TYPE.REMOTE) {
      const files = event.dataTransfer.files;
      isDragging = false;
      dispatch("dropvariant", {
        files: files,
        texture: item,
        model: model,
      });
    }
  };
  //all
  const handleRenderDragOver = function (event) {
    event.preventDefault();
    isDragging = true;
  };
  const handleRenderDragEnd = function (event) {
    if (isSteveDragging || isAlexDragging) return;
    isDragging = false;
  };

  const handleDragEnter = function (event) {
    event.preventDefault();
  };

  //alex
  const handleAlexDrop = function (event) {
    handleDrop(event, MODEL_TYPE.ALEX);
  };
  const handleRenderAlexDragOver = function (event) {
    isAlexDragging = true;
    isSteveDragging = false;
  };
  const handleRenderAlexDragEnd = function (event) {
    event.preventDefault();
    isAlexDragging = false;
  };

  //steve
  const handleSteveDrop = function (event) {
    handleDrop(event, MODEL_TYPE.STEVE);
  };
  const handleRenderSteveDragOver = function (event) {
    isSteveDragging = true;
    isAlexDragging = false;
  };
  const handleRenderSteveDragEnd = function (event) {
    event.preventDefault();
    isSteveDragging = false;
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
  let edit = function (it) {
    dispatch("edit", {
      texture: item,
    });
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="item-layer"
  class:selected
  class:drop-hover={isDragging &&
    multiVariant &&
    item.type != LAYER_TYPE.REMOTE}
  on:click
  on:dragleave={handleRenderDragEnd}
  on:dragover={handleRenderDragOver}
  on:dragenter={handleDragEnter}
  on:dragend={handleRenderDragEnd}
>
  {#if isDragging && multiVariant && item.type != LAYER_TYPE.REMOTE}
    <div class="model-selection">
      <div
        class:drop-hover={isAlexDragging}
        on:dragleave={handleRenderAlexDragEnd}
        on:dragend={handleRenderAlexDragEnd}
        on:dragover={handleRenderAlexDragOver}
        on:drop={handleAlexDrop}
        on:dragenter={handleRenderAlexDragOver}
      >
        {$_("modelOpt.alex")}
      </div>
      <div
        class:drop-hover={isSteveDragging}
        on:dragleave={handleRenderSteveDragEnd}
        on:dragend={handleRenderSteveDragEnd}
        on:dragover={handleRenderSteveDragOver}
        on:drop={handleSteveDrop}
        on:dragenter={handleRenderSteveDragOver}
      >
        {$_("modelOpt.steve")}
      </div>
    </div>
  {/if}
  <div class="render" title={item.colorName}>
    <OutfitLayerRender {item} {renderProvider} {modelName} />
  </div>
  <div class="data">
    <div class="data-title">{label}</div>
    <div>
      <Label variant="common">{item.outfitType}</Label>
      {#if showLabels}
        {#if item.type == LAYER_TYPE.REMOTE}
          <Label variant="rare">{$_("layerType.remote")}</Label>
        {/if}
      {/if}
    </div>
  </div>
  <div class="actions">
    {#if link}
      <Button
        icon={ExternalLinkIcon}
        label={"Go to outfit page"}
        type="tertiary"
        href={link}
        onlyIcon
        size="large"
      />
    {/if}
    {#if multiVariant && item.type != LAYER_TYPE.REMOTE && !readonly}
      <Button
        icon={EditIcon}
        whiteText={selected}
        label={$_("newLayerVariant")}
        type="quaternary"
        on:click={edit}
        onlyIcon
        size="large"
      />
      {#if controls}
        <div class="separator vertical" />
      {/if}
    {/if}
    {#if controls && !readonly}
      <Button
        icon={UpIcon}
        label={$_("up")}
        type="quaternary"
        whiteText={selected}
        on:click={up}
        disabled={!canUp}
        onlyIcon
        size="large"
      />
      <Button
        icon={DownIcon}
        label={$_("down")}
        type="quaternary"
        whiteText={selected}
        on:click={down}
        disabled={!canDown}
        onlyIcon
        size="large"
      />
    {/if}
    {#if !readonly}
      <div class="separator vertical" />
      <Button
        icon={DeleteIcon}
        whiteText={selected}
        label={$_("remove")}
        type="quaternary"
        on:click={remove}
        onlyIcon
        size="large"
      />
    {/if}
  </div>
</div>

<style lang="scss">
  @import "ItemLayer.scss";
</style>
