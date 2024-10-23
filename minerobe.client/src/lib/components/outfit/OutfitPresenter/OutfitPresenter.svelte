<script lang="ts">
  import OutfitPackageSnapshotRender from "$lib/components/render/OutfitPackageSnapshotRender.svelte";
  import { defaultRenderer } from "$src/data/cache";
  import { MODEL_TYPE, PACKAGE_TYPE } from "$src/data/consts";
  import {
    CreateDefaultRenderProvider,
    type RenderProvider,
  } from "$src/data/render";
  import type { OutfitPackage } from "$src/model/package";
  import { onMount } from "svelte";
  import { CAMERA_CONFIG_FRONT } from "$src/data/consts/render";
  import { GetCameraYCoordsForType } from "$src/helpers/render/renderHelper";
  import PlusIcon from "$icons/plus.svg?raw";

  export let item: OutfitPackage = null;
  export let readonly: boolean = false;
  export let renderProvider: RenderProvider = null;
  export let cameraOptions = CAMERA_CONFIG_FRONT;
  export let variantId: string = null;

  let laoded = false;
  onMount(async () => {
    await updateRender(null);
  });

  $: updateRender(item);
  let isDragging = false;
  //drop support
  const handleRenderDrop = (e) => {
    isDragging = false;
  };
  const handleRenderDragOver = (e) => {
    isDragging = true;
    e.preventDefault();
  };
  const handleRenderDragEnter = (e) => {
    isDragging = true;
    e.preventDefault();
  };
  const handleRenderDragLeave = (e) => {
    isDragging = false;
    e.preventDefault();
  };
  const updateRender = async function (invoke) {
    if (item == null) {
      laoded = true;
      return;
    }
    laoded = false;
    if (item.type == PACKAGE_TYPE.OUTFIT && variantId != null) {
      item.layers = item.layers.filter((x) => x.id == variantId);
    }
    if (renderProvider == null) {
      const defaultRender = await CreateDefaultRenderProvider(
        $defaultRenderer,
        true
      );
      renderProvider =
        item.model === MODEL_TYPE.ALEX
          ? defaultRender.alex
          : defaultRender.steve;
    }
    const cameraY = GetCameraYCoordsForType(item.outfitType);
    cameraOptions.lookAt.y = cameraY;
    cameraOptions.position.y = cameraY;
    laoded = true;
  };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="outfit-presenter"
  class:dragging={isDragging && !readonly}
  on:drop={handleRenderDrop}
  on:dragover={handleRenderDragOver}
  on:dragenter={handleRenderDragEnter}
  on:dragleave={handleRenderDragLeave}
>
  {#if laoded && item != null}
    <OutfitPackageSnapshotRender {renderProvider} {item} {cameraOptions} />
  {:else}
    <div class="add-new">{@html PlusIcon}</div>
  {/if}
</div>

<style lang="scss">
  @use "OutfitPresenter.scss";
</style>
