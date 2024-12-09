<script lang="ts">
  //main imports
  import { onDestroy, onMount, createEventDispatcher } from "svelte";
  //services
  import {
    CameraConfig,
    ModelScene,
    OutfitPackageToTextureConverter,
    TextureRender,
  } from "$src/data/render";
  //consts
  import {
    ALEX_MODELSCENE,
    ALEX_MODELSCENE_BASE,
    DEFAULT_RENDERER,
    STEVE_MODELSCENE,
    STEVE_MODELSCENE_BASE,
  } from "$src/data/static";
  import { CAMERA_CONFIG } from "$src/data/consts/render";
  //model
  import type { OutfitLayer, OutfitPackage } from "$data/models/package";
  import { MODEL_TYPE } from "$src/data/enums/model";
  import { OUTFIT_TYPE } from "$src/data/enums/outfit";
  //components
  import Resize from "../other/Resize/Resize.svelte";
  //icons
  import floorTexture from "$texture/floor.png?url";

  const dispatch = createEventDispatcher();

  export let source: string | OutfitPackage;
  export let model: MODEL_TYPE | "source" = "source";
  export let outfitType: string = null;
  export let isDynamic: boolean = false;
  export let isFlatten: boolean = false;
  export let layerId: string = "";
  export let cameraOptions: CameraConfig | "auto" = "auto";
  export let renderer = $DEFAULT_RENDERER;
  export let baseTexture: OutfitLayer | string = null;
  export const addAnimation = function (animation, force = false) {
    if (textureRenderer == null) return;
    textureRenderer.AddAnimation(animation, force);
  };
  export const resize = function () {
    if (textureRenderer == null) return;
    textureRenderer.Resize();
  };
  export const getCurrentTexture = function () {
    return textureRenderer.GetTexture();
  };
  export let resizable = false;
  export let resizeDebounce = 300;

  let _source: string | OutfitPackage = structuredClone(source);
  let _model: MODEL_TYPE | "source" = structuredClone(model);
  let _isFlatten: boolean = isFlatten;
  let _baseTexture: OutfitLayer | string = baseTexture;
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

  const onTextureUpdate = function () {
    dispatch("textureUpdate", { texture: textureRenderer.GetTexture() });
  };

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
    if (_source == null || _source == "") return;
    if (_model == "source" && typeof _source === "string") {
      console.error("_model is _source but _source is string");
      return;
    }

    if (typeof _source !== "string") {
      merger.SetOutfitPackage(_source);
      if (layerId != null && layerId != "") merger.SetLayerId(layerId);
    }
    let targetModel = _model as string;
    if (_model == "source" && typeof _source !== "string")
      targetModel = _source.model;
    await syncModel(targetModel);

    if (_baseTexture != null) {
      if (typeof _baseTexture === "string") merger.SetBaseTexture(_baseTexture);
      else merger.SetBaseTexture(_baseTexture[targetModel].content);
    }

    if (_isFlatten) merger.SetAsFlatten();
    if (typeof _source !== "string")
      cachedtexture = await merger.ConvertAsyncWithFlattenSettings();
    else cachedtexture = _source as string;

    if (cameraOptions == "auto") {
      if (typeof _source !== "string") {
        textureRenderer.SetCameraOptions(
          CAMERA_CONFIG.getForOutfit(_source.outfitType)
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
  const setSource = async (v, oldModel, newModel) => {
    if (!initialized) return;
    if (_source == null || _source == "") return;
    
    //compare source
    let isReRender = false;
    let isLayersOrderNew = false;
    if (typeof _source !== "string" && v !== "string") {
      isReRender = isReRenderNeeded(_source, v, oldModel, newModel);
      isLayersOrderNew = isLayersOrderChanged(_source, v);
      if (!isReRender) return;
    }

    _source = structuredClone(v);
    cachedtexture = _source as string;
    if (typeof _source !== "string") {
      if (cameraOptions == "auto") {
        textureRenderer.SetCameraOptions(
          CAMERA_CONFIG.getForOutfit(_source.outfitType)
        );
      }

      cachedtexture = await merger
        .SetOutfitPackage(_source)
        .ConvertAsyncWithFlattenSettings();
      await textureRenderer.SetTextureAsync(cachedtexture);
    } else {
      cachedtexture = _source;
      await textureRenderer.SetTextureAsync(cachedtexture);
    }
    if (!isDynamic) await textureRenderer.RenderStatic();
    renderReady = true;

    //if layers order changed - trigger event
    if (
      isLayersOrderNew ||
      typeof _source == "string" ||
      typeof source == "string"
    )
      onTextureUpdate();
  };
  const setModel = async (v) => {
    if (!initialized) return false;
    if (_model == v && v != "source") return false;
    if (
      _model == "source" &&
      typeof _source !== "string" &&
      (source as OutfitPackage).model == merger.GetModel()
    )
      return false;
    _model = v;

    await syncModel(v);
    return true;
  };
  const setOutfitType = async (v) => {
    if (!initialized) return;

    await syncModel(_source);
  };
  const setFlatten = async (v) => {
    if (!initialized) return;
    if (v == _isFlatten) return;
    _isFlatten = v;

    if (_source == null && _source == "") return;
    if (_isFlatten) merger.SetAsFlatten();
    else merger.SetAsNotFlatten();

    cachedtexture = await merger.ConvertAsyncWithFlattenSettings();

    if (cachedtexture != null)
      await textureRenderer.SetTextureAsync(cachedtexture);
    if (!isDynamic) await textureRenderer.RenderStatic();
  };
  const setLayerId = async (v) => {
    if (!initialized) return;

    if (merger && typeof _source !== "string") {
      cachedtexture = await merger
        .SetLayerId(layerId)
        .ConvertAsyncWithFlattenSettings();
      await textureRenderer.SetTextureAsync(cachedtexture);
      if (!isDynamic) await textureRenderer.RenderStatic();
    }
    onTextureUpdate();
  };
  const setCameraOptions = async (v) => {
    if (!initialized) return;

    let targetCameraOptions = cameraOptions;
    if (cameraOptions == "auto" && typeof _source !== "string") {
      targetCameraOptions = CAMERA_CONFIG.getForOutfit(_source.outfitType);
    }
    textureRenderer.SetCameraOptions(targetCameraOptions);

    if (!isDynamic) await textureRenderer.RenderStatic();
  };
  const setBaseTexture = async (v) => {
    if (!initialized) return;
    if (
      typeof v === "string" &&
      typeof _baseTexture === "string" &&
      v === _baseTexture
    )
      return;
    if (
      typeof v !== "string" &&
      typeof _baseTexture !== "string" &&
      v[merger.GetModel()].content ===
        (_baseTexture as OutfitLayer)[merger.GetModel()].content
    )
      return;
    _baseTexture = v;

    if (_baseTexture != null) {
      if (typeof _baseTexture === "string") merger.SetBaseTexture(_baseTexture);
      else merger.SetBaseTexture(_baseTexture[merger.GetModel()].content);
    }

    cachedtexture = await merger.ConvertAsyncWithFlattenSettings();
  };
  const baseModelTypesList = [
    OUTFIT_TYPE.OUTFIT_SET,
    OUTFIT_TYPE.SHOES,
    OUTFIT_TYPE.BOTTOM,
  ];

  const syncModel = async (modelToSync) => {
    if (modelToSync == "source") modelToSync = (source as OutfitPackage).model;
    merger.SetModel(modelToSync);

    let modelScene: ModelScene = null;
    if (
      (typeof _source !== "string" &&
        baseModelTypesList.includes(_source.outfitType as OUTFIT_TYPE)) ||
      (typeof _source === "string" &&
        baseModelTypesList.includes(outfitType as OUTFIT_TYPE))
    ) {
      modelScene =
        modelToSync === MODEL_TYPE.ALEX ? $ALEX_MODELSCENE : $STEVE_MODELSCENE;
    } else {
      modelScene =
        modelToSync === MODEL_TYPE.ALEX
          ? $ALEX_MODELSCENE_BASE
          : $STEVE_MODELSCENE_BASE;
    }
    await textureRenderer.SetModelScene(modelScene.Clone());
  };
  const syncModelSource = async function (vModel, vSource) {
    const oldModel = merger.GetModel();
    const modelChanged = await setModel(vModel);
    const newModel = merger.GetModel();
    await setSource(vSource, oldModel, newModel);
  };

  const isReRenderNeeded = function (
    aSource: OutfitPackage,
    bSource: OutfitPackage,
    oldModel: MODEL_TYPE,
    newModel: MODEL_TYPE
  ) {
    const aLayers = aSource.layers;
    const bLayers = bSource.layers;
    if (aLayers.length != bLayers.length) return true;
    for (let i = 0; i < aLayers.length; i++) {
      if (
        aLayers[i].id != bLayers[i].id ||
        aLayers[i][oldModel].content != bLayers[i][newModel].content
      )
        return true;
    }
    return false;
  };
  const isLayersOrderChanged = function (
    aSource: OutfitPackage,
    bSource: OutfitPackage
  ) {
    const aLayers = aSource.layers;
    const bLayers = bSource.layers;
    if (aLayers.length != bLayers.length) return true;
    for (let i = 0; i < aLayers.length; i++) {
      if (aLayers[i].id != bLayers[i].id) return true;
    }
    return false;
  };

  $: syncModelSource(model, source);
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
    <img bind:this={renderNode} class:renderReady draggable="false" />
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
