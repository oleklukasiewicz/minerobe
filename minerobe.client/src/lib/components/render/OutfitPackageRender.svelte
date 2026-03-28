<script lang="ts">
  import { run } from 'svelte/legacy';

  //main imports
  import { onDestroy, onMount } from "svelte";
  import { get, type Readable } from "svelte/store";
  import IntersectionObserver from "svelte-intersection-observer";
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
  //models
  import type { OutfitLayer, OutfitPackage } from "$data/models/package";
  import { MODEL_TYPE } from "$src/data/enums/model";
  import { OUTFIT_TYPE } from "$src/data/enums/outfit";
  //components
  import Resize from "../other/Resize/Resize.svelte";
  //icons
  import floorTexture from "$texture/floor.webp?url";

  export const addAnimation = function (animation, force = false) {
    if (textureRenderer == null) return;
    textureRenderer.AddAnimation(animation, force);
  };
  export const resize = async function () {
    if (textureRenderer == null) return;
    await textureRenderer.Resize();
  };
  export const getCurrentTexture = function () {
    return textureRenderer.GetTexture();
  };
  interface Props {
    source: string | OutfitPackage;
    model?: MODEL_TYPE | "source";
    outfitType?: string;
    isDynamic?: boolean;
    isFlatten?: boolean;
    layerId?: string;
    cameraOptions?: CameraConfig | "auto";
    renderer?: any;
    cape?: string;
    baseTexture?: OutfitLayer | string;
    pauseOnIntersection?: boolean;
    useTextureLighting?: boolean;
    resizable?: boolean;
    resizeDebounce?: number;
    ontextureUpdate?: (event?: any) => void;
  }

  let {
    source,
    model = "source",
    outfitType = null,
    isDynamic = false,
    isFlatten = false,
    layerId = "",
    cameraOptions = "auto",
    renderer = $DEFAULT_RENDERER,
    cape = null,
    baseTexture = null,
    pauseOnIntersection = false,
    useTextureLighting = false,
    resizable = false,
    resizeDebounce = 300
  ,
    ontextureUpdate = null
  }: Props = $props();

  let _component: any = $state(null);

  let _source: string | OutfitPackage = null;
  let _model: MODEL_TYPE | "source" = "source";
  let _isFlatten: boolean = false;
  let _baseTexture: OutfitLayer | string = null;
  let _layerId: string = "";
  let _cape: string = null;
  let renderReady = $state(false);
  let cachedtexture: string = null;
  let renderNode: any = $state();
  let merger: OutfitPackageToTextureConverter =
    new OutfitPackageToTextureConverter();
  let textureRenderer: TextureRender;
  let initialized = false;

  const safeClone = <T>(value: T): T => {
    if (value == null) return value;
    if (typeof value !== "object") return value;

    try {
      return structuredClone(value);
    } catch {
      // Fallback for non-cloneable values (e.g. functions/proxies inside objects).
      try {
        return JSON.parse(JSON.stringify(value)) as T;
      } catch {
        return value;
      }
    }
  };

  onMount(async () => {
    _source = safeClone(source);
    _model = model;
    _isFlatten = isFlatten;
    _baseTexture = baseTexture;
    _layerId = layerId;
    _cape = cape;
    textureRenderer = new TextureRender(renderer);

    textureRenderer.SetNode(renderNode);
    
    // Add timeout to prevent hanging if initialization takes too long
    const initPromise = loadInitialParams();
    const timeoutPromise = new Promise<void>((resolve) =>
      setTimeout(() => {
        console.warn("Render initialization timeout");
        resolve();
      }, 3000)
    );
    
    await Promise.race([initPromise, timeoutPromise]);
    await setRenderMode(isDynamic);
    initialized = true;
    renderReady = true;
    if (_cape != null) await textureRenderer.SetCapeAsync(_cape);
  });
  onDestroy(() => {
    textureRenderer.StopRendering();
  });

  const onTextureUpdate= function () {
    ontextureUpdate?.({ detail: { texture: textureRenderer.GetTexture() } });
  };

  const setRenderMode = async (v) => {
    textureRenderer.RemoveAmbientLight().RemoveDirectionalLight();
    if (useTextureLighting) {
      await textureRenderer.AddTextureAmbientLighting();
    } else {
      await textureRenderer.AddAmbientLight();
      await textureRenderer.AddDirectionalLight();
    }
    if (isDynamic) {
      await textureRenderer.AddFloor(floorTexture);
      await textureRenderer.AddShadow();
      await textureRenderer.SetBackground(0x202020);
      await textureRenderer.RenderDynamic();
    } else {
      textureRenderer.RemoveFloor().RemoveShadow();

      await textureRenderer.RemoveBackground();
      textureRenderer.StopRendering();
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
      cachedtexture = await merger.ConvertAsyncWithFlattenSettingsAsync();
    else cachedtexture = _source as string;

    if (cameraOptions == "auto") {
      let options: CameraConfig;
      if (typeof _source !== "string" && outfitType == null) {
        options = CAMERA_CONFIG.getForOutfit(_source.outfitType);
      } else {
        options = CAMERA_CONFIG.getForOutfit(outfitType);
      }
      await textureRenderer.SetCameraOptions(options);
    }
    if (cachedtexture != null)
      await textureRenderer.SetTextureAsync(cachedtexture);
  };
  const setSource = async (
    v,
    oldModel,
    newModel,
    oldLayerId,
    newLayerId,
    oldCape,
    newCape
  ) => {
    if (!initialized) return;
    if (_source == null || _source == "") return;

    //compare source
    let isReRender = true;
    let isLayersModified = true;
    if (
      typeof _source !== "string" &&
      typeof v !== "string" &&
      _source != null &&
      oldModel != null &&
      (newLayerId != oldLayerId || oldCape != newCape)
    ) {
      isReRender = isReRenderNeeded(
        _source,
        v,
        oldModel,
        newModel,
        oldLayerId,
        newLayerId
      );
      if (!isReRender) return;
    }

    if (typeof _source !== "string" && typeof v !== "string")
      isLayersModified = isLayersChanged(_source, v);

    _source = safeClone(v);
    cachedtexture = _source as string;
    if (typeof _source !== "string") {
      if (cameraOptions == "auto" && outfitType == null) {
        await textureRenderer.SetCameraOptions(
          CAMERA_CONFIG.getForOutfit(_source.outfitType)
        );
      } else {
        await textureRenderer.SetCameraOptions(
          CAMERA_CONFIG.getForOutfit(outfitType)
        );
      }

      cachedtexture = await merger
        .SetOutfitPackage(_source)
        .ConvertAsyncWithFlattenSettingsAsync();
      await textureRenderer.SetTextureAsync(cachedtexture);
    } else {
      cachedtexture = _source;
      await textureRenderer.SetTextureAsync(cachedtexture);
    }
    if (!isDynamic) await textureRenderer.RenderStatic();
    renderReady = true;

    //if layers order changed - trigger event
    if (
      isLayersModified ||
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
    await setCameraOptions(v);
  };
  const setFlatten = async (v) => {
    if (!initialized) return;
    if (v == _isFlatten) return;
    _isFlatten = v;

    if (_source == null && _source == "") return;
    if (_isFlatten) merger.SetAsFlatten();
    else merger.SetAsNotFlatten();

    cachedtexture = await merger.ConvertAsyncWithFlattenSettingsAsync();

    if (cachedtexture != null)
      await textureRenderer.SetTextureAsync(cachedtexture);
    if (!isDynamic) await textureRenderer.RenderStatic();
  };
  const setLayerId = async (v) => {
    if (!initialized) return;
    if (v == _layerId) return false;
    _layerId = v;
    if (merger && typeof _source !== "string") {
      await merger.SetLayerId(layerId);
      await textureRenderer.SetTextureAsync(cachedtexture);
      if (typeof _source !== "string") {
        const layer = _source.layers.find((x) => x.id == layerId);
        if (layer != null)
          await textureRenderer.SetCameraOptions(
            CAMERA_CONFIG.getForOutfit(layer.outfitType)
          );
      }
    }
    return true;
  };
  const setCameraOptions = async (v) => {
    if (!initialized) return;

    let targetCameraOptions = cameraOptions;
    if (cameraOptions == "auto") {
      if (typeof _source !== "string" && outfitType == null)
        targetCameraOptions = CAMERA_CONFIG.getForOutfit(_source.outfitType);
      else targetCameraOptions = CAMERA_CONFIG.getForOutfit(outfitType);
    }
    await textureRenderer.SetCameraOptions(targetCameraOptions);

    if (!isDynamic) await textureRenderer.RenderStatic();
  };
  const setBaseTexture = async (v) => {
    if (!initialized) return;
    if (v == null) return;
    if (
      typeof v === "string" &&
      typeof _baseTexture === "string" &&
      v === _baseTexture
    )
      return;
    if (
      typeof v !== "string" &&
      typeof _baseTexture !== "string" &&
      _baseTexture != null &&
      v[merger.GetModel()].content ===
        (_baseTexture as OutfitLayer)[merger.GetModel()].content
    )
      return;
    _baseTexture = v;

    if (_baseTexture != null) {
      if (typeof _baseTexture === "string") merger.SetBaseTexture(_baseTexture);
      else merger.SetBaseTexture(_baseTexture[merger.GetModel()].content);
    }

    cachedtexture = await merger.ConvertAsyncWithFlattenSettingsAsync();
    if (cachedtexture != null)
      await textureRenderer.SetTextureAsync(cachedtexture);
    if (!isDynamic) await textureRenderer.RenderStatic();
  };
  const setCape = async (v) => {
    if (!initialized) return;
    if (v == _cape) return;
    _cape = v;
    if (v != null) await textureRenderer.SetCapeAsync(v);
    else textureRenderer.RemoveCape();
  };
  const baseModelTypesList = [
    OUTFIT_TYPE.OUTFIT_SET,
    OUTFIT_TYPE.SHOES,
    OUTFIT_TYPE.BOTTOM,
  ];

  async function waitForStoreValue<T>(
    store: Readable<T>,
    timeoutMs = 5000
  ): Promise<T> {
    const value = get(store);
    if (value != null) return value;

    return new Promise<T>((resolve) => {
      let timeout: ReturnType<typeof setTimeout> = null;
      const unsubscribe = store.subscribe((nextValue) => {
        if (nextValue == null) return;
        if (timeout != null) clearTimeout(timeout);
        unsubscribe();
        resolve(nextValue);
      });

      timeout = setTimeout(() => {
        unsubscribe();
        resolve(get(store));
      }, timeoutMs);
    });
  }

  const resolveModelScene = async (
    modelToSync: MODEL_TYPE,
    useBaseScene: boolean
  ): Promise<ModelScene> => {
    const targetStore = useBaseScene
      ? modelToSync === MODEL_TYPE.ALEX
        ? ALEX_MODELSCENE_BASE
        : STEVE_MODELSCENE_BASE
      : modelToSync === MODEL_TYPE.ALEX
        ? ALEX_MODELSCENE
        : STEVE_MODELSCENE;

    return await waitForStoreValue(targetStore as Readable<ModelScene>);
  };

  const syncModel = async (modelToSync) => {
    if (modelToSync == "source") modelToSync = (source as OutfitPackage).model;
    merger.SetModel(modelToSync);

    const useBaseScene =
      (typeof _source !== "string" &&
        outfitType == null &&
        baseModelTypesList.includes(_source.outfitType as OUTFIT_TYPE)) ||
      ((typeof _source === "string" || outfitType != null) &&
        baseModelTypesList.includes(outfitType as OUTFIT_TYPE));

    const modelScene = await resolveModelScene(
      modelToSync as MODEL_TYPE,
      !useBaseScene
    );
    if (modelScene == null) {
      console.warn("Unable to resolve model scene in syncModel", {
        modelToSync,
        useBaseScene: !useBaseScene,
      });
      return;
    }

    await textureRenderer.SetModelScene(modelScene.Clone());
  };
  const syncModelSource = async function (vModel, vSource, vLayerId, vCape) {
    const oldModel = merger.GetModel();
    await setModel(vModel);
    const newModel = merger.GetModel();
    const oldLayerId = merger.GetLayerId();
    await setLayerId(vLayerId);
    const newLayerId = merger.GetLayerId();
    const oldCape = _cape;
    await setCape(vCape);
    const newCape = vCape;
    await setSource(
      vSource,
      oldModel,
      newModel,
      oldLayerId,
      newLayerId,
      oldCape,
      newCape
    );
  };

  const isReRenderNeeded = function (
    aSource: OutfitPackage,
    bSource: OutfitPackage,
    oldModel: MODEL_TYPE,
    newModel: MODEL_TYPE,
    oldLayerId: string,
    newLayerId: string
  ) {
    if (oldLayerId != newLayerId) return true;
    const aLayers = aSource.layers;
    const bLayers = bSource.layers;
    if (aLayers.length != bLayers.length) return true;
    for (let i = 0; i < aLayers.length; i++) {
      if (
        aLayers[i].id != bLayers[i].id ||
        aLayers[i][oldModel]?.content != bLayers[i][newModel]?.content
      )
        return true;
    }
    return false;
  };
  const isLayersChanged = function (
    aSource: OutfitPackage,
    bSource: OutfitPackage
  ) {
    const aLayers = aSource.layers;
    const bLayers = bSource.layers;
    if (aLayers.length != bLayers.length) return true;
    for (let i = 0; i < aLayers.length; i++) {
      if (
        aLayers[i].id != bLayers[i].id ||
        aLayers[i].alex?.content != bLayers[i].alex?.content ||
        aLayers[i].steve?.content != bLayers[i].steve?.content
      )
        return true;
    }
    return false;
  };

  run(() => {
    syncModelSource(model, source, layerId, cape);
  });
  run(() => {
    setBaseTexture(baseTexture);
  });
  run(() => {
    setOutfitType(outfitType);
  });

  run(() => {
    setFlatten(isFlatten);
  });
  run(() => {
    setCameraOptions(cameraOptions);
  });

  const onResize= async function () {
    if (!initialized) return;
    await textureRenderer.Resize();
    renderReady = true;
  };
  const onObserve= function (e) {
    if (pauseOnIntersection) {
      if (!e.detail.isIntersecting) textureRenderer.PauseRendering();
      else textureRenderer.ResumeRendering();
    } else textureRenderer.ResumeRendering();
  };
</script>

<div class="outfit-render" bind:this={_component}>
  {#if !isDynamic}
    <!-- svelte-ignore a11y_missing_attribute -->
    <img
      bind:this={renderNode}
      class:renderReady
      draggable="false"
      fetchpriority="low"
      loading="lazy"
    />
  {:else}
    <IntersectionObserver element={_component} on:observe={onObserve}>
      <div bind:this={renderNode}></div></IntersectionObserver
    >
  {/if}
  {#if resizable}
    <Resize
      onresize={onResize}
      debounce={resizeDebounce}
      targetNode={_component}
    ></Resize>
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
