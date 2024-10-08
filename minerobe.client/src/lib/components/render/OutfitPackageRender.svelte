<script lang="ts">
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
  import { onMount } from "svelte";

  export let source: string | OutfitPackage;
  export let model: "alex" | "steve" = "alex";
  export let isDynamic: boolean = false;
  export let isFlatten: boolean = false;
  export let layerId: string = "";
  export let cameraOptions: CameraConfig = new CameraConfig();
  export let renderer = $DEFAULT_RENDERER;
  export let baseTexture = "";

  let cachedtexture: string = null;
  let renderNode: any;
  let merger: OutfitPackageToTextureConverter =
    new OutfitPackageToTextureConverter();
  const textureRenderer = new TextureRender(renderer).SetCameraOptions(
    cameraOptions
  );

  onMount(async () => {
    textureRenderer.SetNode(renderNode);
    await setRenderMode(isDynamic);
  });
  const setRenderMode = async (v) => {
    if (isDynamic) {
      textureRenderer
        .AddFloor(floorTexture)
        .AddShadow()
        .SetBackground(0x202020)
        .RenderDynamic();
    } else {
      textureRenderer
        .RemoveFloor()
        .RemoveShadow()
        .SetBackground(0xffffff)
        .StopRendering()
        .RenderStatic();
    }
  };
  const setSource = async (v) => {
    if (source == null || source == "") return;
    cachedtexture = source as string;
    if (typeof source !== "string") {
      cachedtexture = await merger
        .SetOutfitPackage(source)
        .SetModel(model === "alex" ? "alex" : "steve")
        .ConvertAsyncWithFlattenSettings();
    }
    await textureRenderer.SetTextureAsync(cachedtexture);
  };
  const setModel = async (v) => {
    if (model === "alex") {
      textureRenderer.SetModelScene($ALEX_MODELSCENE);
    } else {
      textureRenderer.SetModelScene($STEVE_MODELSCENE);
    }
    await setSource(source);
  };
  const setFlatten = async (v) => {
    if (source != null && cachedtexture != null) {
      if (isFlatten) {
        cachedtexture = await merger.AsFlattenAsync();
      } else {
        cachedtexture = await merger.AsNotFlatten();
      }
      if (cachedtexture != null)
        await textureRenderer.SetTextureAsync(cachedtexture);
    }
  };
  const setLayerId = async (v) => {
    if (merger && typeof source !== "string") {
      cachedtexture = await merger
        .SetLayerId(layerId)
        .ConvertAsyncWithFlattenSettings();
      await textureRenderer.SetTextureAsync(cachedtexture);
    }
  };
  const setCameraOptions = async (v) => {
    textureRenderer.SetCameraOptions(cameraOptions);
  };
  const setBaseTexture = async (v) => {
    if (baseTexture != null && baseTexture.length > 0 && merger != null)
      merger.SetBaseTexture(baseTexture);
    await setSource(source);
  };
  $: setModel(model);
  $: setSource(source);
  $: setFlatten(isFlatten);
  $: setLayerId(layerId);
  $: setCameraOptions(cameraOptions);
  $: setBaseTexture(baseTexture);
</script>

<div>
  {#if !isDynamic}
    <!-- svelte-ignore a11y-missing-attribute -->
    <img bind:this={renderNode} />
  {:else}
    <div bind:this={renderNode} />
  {/if}
</div>

<style lang="scss">
  div {
    width: 100%;
    height: 100%;
  }
  img {
    width: 100%;
    height: 100%;
  }
</style>
