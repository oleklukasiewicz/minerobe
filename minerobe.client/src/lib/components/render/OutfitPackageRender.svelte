<script lang="ts">
  import { MODEL_TYPE, OUTFIT_TYPE } from "$src/data/consts";
  import { CAMERA_CONFIG } from "$src/data/consts/render";
  import {
    CameraConfig,
    OutfitPackageToTextureConverter,
    TextureRender,
  } from "$src/data/render";
  import {
    ALEX_MODELSCENE,
    ALEX_MODELSCENE_BASE,
    DEFAULT_RENDERER,
    STEVE_MODELSCENE,
    STEVE_MODELSCENE_BASE,
  } from "$src/data/static";
  import type { OutfitLayer, OutfitPackage } from "$src/model/package";
  import floorTexture from "$texture/floor.png?url";
  import { onDestroy, onMount } from "svelte";
  import Resize from "../other/Resize/Resize.svelte";

  export let source: string | OutfitPackage;
  export let model: "alex" | "steve" | "source" = "source";
  export let outfitType: string = null;
  export let isDynamic: boolean = false;
  export let isFlatten: boolean = false;
  export let layerId: string = "";
  export let cameraOptions: CameraConfig | "auto" = "auto";
  export let renderer = $DEFAULT_RENDERER;
  export let baseTexture: OutfitLayer | string = null;
  export const addAnimation = function (animation) {
    if (textureRenderer == null) return;
    textureRenderer.AddAnimation(animation);
  };
  export const resize = function () {
    if (textureRenderer == null) return;
    textureRenderer.Resize();
  };
  export const getCurrentTexture=function(){
    return textureRenderer.GetTexture();
  }
  export let resizable = false;
  export let resizeDebounce = 300;

  let renderReady = false;
  let cachedtexture: string = null;
  let renderNode: any;
  let merger: OutfitPackageToTextureConverter =
    new OutfitPackageToTextureConverter();
  const textureRenderer = new TextureRender(renderer);
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
        .RemoveBackground()
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
    }

    let targetModel = model as string;
    if (model == "source" && typeof source !== "string")
      targetModel = source.model;
    await syncModel(targetModel);

    if (baseTexture != null) {
      if (typeof baseTexture === "string") merger.SetBaseTexture(baseTexture);
      else merger.SetBaseTexture(baseTexture[targetModel].content);
    }

    if (isFlatten) merger.SetAsFlatten();
    if (typeof source !== "string")
      cachedtexture = await merger.ConvertAsyncWithFlattenSettings();
    else cachedtexture = source as string;

    if (cameraOptions == "auto") {
      if (typeof source !== "string") {
        textureRenderer.SetCameraOptions(
          CAMERA_CONFIG.getForOutfit(source.outfitType)
        );
      } else {
        textureRenderer.SetCameraOptions(
          CAMERA_CONFIG.getForOutfit(outfitType)
        );
      }
    }

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
      if (cameraOptions == "auto") {
        textureRenderer.SetCameraOptions(
          CAMERA_CONFIG.getForOutfit(source.outfitType)
        );
      }
      cachedtexture = await merger
        .SetOutfitPackage(source)
        .ConvertAsyncWithFlattenSettings();
    } else {
      await syncModel(model);
      cachedtexture = source;
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
  const setOutfitType = async (v) => {
    if (!initialized) return;

    await syncModel(source);
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
      if (!isDynamic) await textureRenderer.RenderStatic();
    }
  };
  const setCameraOptions = async (v) => {
    if (!initialized) return;

    let targetCameraOptions = cameraOptions;
    if (cameraOptions == "auto" && typeof source !== "string") {
      targetCameraOptions = CAMERA_CONFIG.getForOutfit(source.outfitType);
    }
    textureRenderer.SetCameraOptions(targetCameraOptions);

    if (!isDynamic) await textureRenderer.RenderStatic();
  };
  const setBaseTexture = async (v) => {
    if (!initialized) return;

    if (baseTexture != null) {
      if (typeof baseTexture === "string") merger.SetBaseTexture(baseTexture);
      else merger.SetBaseTexture(baseTexture[merger.GetModel()].content);
    }
    await setSource(source);
  };
  const baseModelTypesList = [
    OUTFIT_TYPE.OUTFIT_SET,
    OUTFIT_TYPE.SHOES,
    OUTFIT_TYPE.BOTTOM,
  ];

  const syncModel = async (modelToSync) => {
    merger.SetModel(
      modelToSync == MODEL_TYPE.ALEX ? MODEL_TYPE.ALEX : MODEL_TYPE.STEVE
    );

    let modelScene = null;
    if (
      (typeof source !== "string" &&
        baseModelTypesList.includes(source.outfitType)) ||
      (typeof source === "string" && baseModelTypesList.includes(outfitType))
    ) {
      modelScene =
        modelToSync === MODEL_TYPE.ALEX ? $ALEX_MODELSCENE : $STEVE_MODELSCENE;
    } else {
      modelScene =
        modelToSync === MODEL_TYPE.ALEX
          ? $ALEX_MODELSCENE_BASE
          : $STEVE_MODELSCENE_BASE;
    }
    await textureRenderer.SetModelScene(Object.assign({}, { ...modelScene }));
  };

  $: setModel(model);
  $: setSource(source);
  $: setBaseTexture(baseTexture);
  $: setOutfitType(outfitType);

  $: setFlatten(isFlatten);
  $: setLayerId(layerId);
  $: setCameraOptions(cameraOptions);

  const onResize = async function () {
    if (!initialized) return;
    textureRenderer.Resize();
    renderReady = true;
  };
</script>

<div class="outfit-render">
  {#if !isDynamic}
    <!-- svelte-ignore a11y-missing-attribute -->
    <img bind:this={renderNode} class:renderReady />
  {:else}
    <div bind:this={renderNode}></div>
  {/if}
  {#if resizable}
    <Resize on:resize={onResize} debounce={resizeDebounce}></Resize>
  {/if}
</div>

<style lang="scss">
  .outfit-render {
    aspect-ratio: 1;
    width: 100%;
    height: 100%;
    display: flex;
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
