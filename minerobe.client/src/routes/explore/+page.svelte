<script lang="ts">
  import DownloadIcon from "$icons/download.svg?raw";
  import HeartIcon from "$icons/heart.svg?raw";
  import HomeIcon from "$icons/home.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";
  import ClockIcon from "$icons/clock.svg?raw";
  import { onMount } from "svelte";
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import Select from "$lib/components/base/Select/Select.svelte";
  import OutfitPresenter from "$lib/components/outfit/OutfitPresenter/OutfitPresenter.svelte";
  import { BASE_TEXTURE } from "$src/data/static";
  import floorTexture from "$texture/floor.png?url";

  import { appState, defaultRenderer, planksTexture } from "$data/cache";
  import {
    ALEX_MODEL,
    APP_STATE,
    MODEL_TYPE,
    OUTFIT_TYPE,
    STEVE_MODEL,
  } from "$src/data/consts";
  import {
    CameraConfig,
    ModelScene,
    OutfitPackageToTextureConverter,
    TextureRender,
  } from "$src/data/render";
  import {
    CAMERA_CONFIG_BACK,
    CAMERA_CONFIG_FRONT,
    CAMERA_CONFIG_SIDE_IZO,
  } from "$src/consts/render";
  import { GetCameraConfigForType } from "$src/helpers/render/renderHelper";
  import ClapAnimation from "$src/animation/clap";
  import DefaultAnimation from "$src/animation/default";
  import WavingAnimation from "$src/animation/waving";
  import { GetPackage } from "$src/api/pack";
  let laoded = false;
  let renderNode: any;
  let renderNode2: any;
  let test: any;
  onMount(async () => {
    appState.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;

      const render = new TextureRender($defaultRenderer)
        .SetCameraOptions(new CameraConfig())
        .SetNode(renderNode2)
        //.AddAnimation(WavingAnimation)
        .AddAnimation(DefaultAnimation)
        .SetBackground(0x202020);

      var pack = await GetPackage("7f1f0171-7768-4018-a35e-25937ed40ad4");

      var merger = new OutfitPackageToTextureConverter(pack);
      test = await merger
        .SetBaseTexture($planksTexture)
        .SetModel(MODEL_TYPE.STEVE)
        .ConvertAsync()
        .then(async (x) => await x.AsNotFlatten());

      const modelScene2 = await new ModelScene(
        merger.GetModelMap().model
      ).Create();
      await render
        .SetModelScene(modelScene2)
        .AddShadow()
        .AddFloor(floorTexture)
        .RenderDynamic()
        .SetTextureAsync(test);

      setTimeout(async () => {
        const modelScene3 = await new ModelScene(ALEX_MODEL.model).Create();
        test = (await merger.SetModel("alex").ConvertAsync()).GetTexture();
        await render.SetModelScene(modelScene3).SetTextureAsync(test);
      }, 2000);
      laoded = true;
    });
  });
</script>

<div class="layout">
  <div bind:this={renderNode2} style="width: 600px;height:600px" />
</div>

<style lang="scss">
  @import "style.scss";
</style>
