<script lang="ts">
  import { MODEL_TYPE } from "$src/data/consts";
  import {
    CameraConfig,
    OutfitPackageToTextureConverter,
    TextureRender,
  } from "$src/data/render";
  import {
    ALEX_MODELSCENE,
    DEFAULT_RENDERER,
    STEVE_MODELSCENE,
  } from "$src/data/static";
  import type { OutfitPackage } from "$src/model/package";
  import floorTexture from "$texture/floor.png?url";
  import { onDestroy, onMount } from "svelte";

  export let source: string | OutfitPackage;
  export let model: "alex" | "steve" | "source" = "source";
  export let isDynamic: boolean = false;
  export let isFlatten: boolean = false;
  export let layerId: string = "";
  export let cameraOptions: CameraConfig = new CameraConfig();
  export let renderer = $DEFAULT_RENDERER;
  export let baseTexture = "";

  let renderReady = false;
  let cachedtexture: string = null;
  let renderNode: any;
  let merger: OutfitPackageToTextureConverter =
    new OutfitPackageToTextureConverter();
  const textureRenderer = new TextureRender(renderer).SetCameraOptions(
    cameraOptions
  );
  let initialized = false;

  onMount(async () => {
    textureRenderer.SetNode(renderNode);
    await loadInitialParams();
    await setRenderMode(isDynamic);
    initialized = true;
    renderReady = true;
  });
  onDestroy(() => {
    textureRenderer.StopRendering();
  });
  const setRenderMode = async (v) => {
    if (isDynamic) {
      textureRenderer
        .AddFloor(floorTexture)
        .AddShadow()
        .SetBackground(0x202020);
      await textureRenderer.RenderDynamic();
    } else {
      textureRenderer
        .RemoveFloor()
        .RemoveShadow()
        .SetBackground(0xffffff)
        .StopRendering();
      await textureRenderer.RenderStatic();
    }
  };
  const loadInitialParams = async function () {
    if (source == null || source == "") return;
    if (model == "source" && typeof source === "string") {
      console.error("Model is source but source is string");
      return;
    }

    if (typeof source !== "string") {
      merger.SetOutfitPackage(source);
      if (layerId != null && layerId != "") merger.SetLayerId(layerId);
      if (baseTexture != null && baseTexture.length > 0)
        merger.SetBaseTexture(baseTexture);
    }

    let targetModel = model as string;
    if (model == "source" && typeof source !== "string")
      targetModel = source.model;
    await syncModel(targetModel);

    if (isFlatten) merger.SetAsFlatten();
    cachedtexture = await merger.ConvertAsyncWithFlattenSettings();

    if (cachedtexture != null)
      await textureRenderer.SetTextureAsync(cachedtexture);
  };
  const setSource = async (v) => {
    if (!initialized) return;

    if (source == null || source == "") return;
    cachedtexture = source as string;
    if (typeof source !== "string") {
      if (model == "source") {
        const sourceModel = source.model;
        await syncModel(sourceModel);
      }
      cachedtexture = await merger
        .SetOutfitPackage(source)
        .ConvertAsyncWithFlattenSettings();
    }
    await textureRenderer.SetTextureAsync(cachedtexture);
    if (!isDynamic) await textureRenderer.RenderStatic();
    renderReady = true;
  };
  const setModel = async (v) => {
    if (!initialized) return;

    await syncModel(model);
    await setSource(source);
  };
  const setFlatten = async (v) => {
    if (!initialized) return;

    if (source == null && source == "") return;
    if (isFlatten) merger.SetAsFlatten();
    else merger.SetAsNotFlatten();

    cachedtexture = await merger.ConvertAsyncWithFlattenSettings();

    if (cachedtexture != null)
      await textureRenderer.SetTextureAsync(cachedtexture);
    if (!isDynamic) await textureRenderer.RenderStatic();
  };
  const setLayerId = async (v) => {
    if (!initialized) return;

    if (merger && typeof source !== "string") {
      cachedtexture = await merger
        .SetLayerId(layerId)
        .ConvertAsyncWithFlattenSettings();
      await textureRenderer.SetTextureAsync(cachedtexture);
    }
  };
  const setCameraOptions = async (v) => {
    if (!initialized) return;

    textureRenderer.SetCameraOptions(cameraOptions);
    if (!isDynamic) await textureRenderer.RenderStatic();
  };
  const setBaseTexture = async (v) => {
    if (!initialized) return;

    if (baseTexture != null && baseTexture.length > 0 && merger != null)
      merger.SetBaseTexture(baseTexture);
    await setSource(source);
  };

  const syncModel = async (modelToSync) => {
    merger.SetModel(
      modelToSync == MODEL_TYPE.ALEX ? MODEL_TYPE.ALEX : MODEL_TYPE.STEVE
    );
    await textureRenderer.SetModelScene(
      modelToSync === MODEL_TYPE.ALEX ? $ALEX_MODELSCENE : $STEVE_MODELSCENE
    );
  };

  $: setModel(model);
  $: setSource(source);
  $: setBaseTexture(baseTexture);

  $: setFlatten(isFlatten);
  $: setLayerId(layerId);
  $: setCameraOptions(cameraOptions);
</script>

<div class="outfit-render">
  {#if !isDynamic}
    <!-- svelte-ignore a11y-missing-attribute -->
    <img bind:this={renderNode} class:renderReady />
  {:else}
    <div bind:this={renderNode} />
  {/if}
</div>

<style lang="scss">
  .outfit-render {
    aspect-ratio: 1;
    div {
      width: 100%;
      height: 100%;
    }
    img {
      width: 100%;
      height: 100%;
      opacity: 0;
      &.renderReady {
        opacity: 1;
      }
    }
  }
</style>
