<script lang="ts">
  import OutfitPackageSnapshotRender from "$lib/components/render/OutfitPackageSnapshotRender.svelte";
  import { defaultRenderer } from "$src/data/cache";
  import { MODEL_TYPE } from "$src/data/consts";
  import {
    CreateDefaultRenderProvider,
    type RenderProvider,
  } from "$src/data/render";
  import type { OutfitPackage } from "$src/model/package";
  import { onMount } from "svelte";

  export let item: OutfitPackage = null;
  export let readonly: boolean = false;
  export let renderProvider: RenderProvider = null;

  onMount(async () => {
    if (renderProvider == null) {
      const defaultRender = await CreateDefaultRenderProvider($defaultRenderer);
      renderProvider =
        item.model === MODEL_TYPE.ALEX
          ? defaultRender.alex
          : defaultRender.steve;
    }
  });

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
  {#if renderProvider != null && item != null}
    <OutfitPackageSnapshotRender {renderProvider} {item}/>
  {:else}
    <div class="loading">Loading...</div>
  {/if}
</div>

<style lang="scss">
  @import "OutfitPresenter.scss";
</style>
