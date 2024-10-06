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
    OUTFIT_TYPE,
    STEVE_MODEL,
  } from "$src/data/consts";
  import { CameraConfig, ModelScene, TextureRender } from "$src/data/render";
  import {
    CAMERA_CONFIG_BACK,
    CAMERA_CONFIG_FRONT,
    CAMERA_CONFIG_SIDE_IZO,
  } from "$src/consts/render";
  import { GetCameraConfigForType } from "$src/helpers/render/renderHelper";
  import ClapAnimation from "$src/animation/clap";
  import DefaultAnimation from "$src/animation/default";
  import WavingAnimation from "$src/animation/waving";
  let laoded = false;
  let renderNode: any;
  let renderNode2: any;
  onMount(async () => {
    appState.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;

      const modelScene = await new ModelScene(STEVE_MODEL.model).Create();
      const modelScene2 = await new ModelScene(ALEX_MODEL.model).Create();
      const render = new TextureRender($defaultRenderer)
        .SetCameraOptions(GetCameraConfigForType(OUTFIT_TYPE.DEFAULT))
        .SetModelScene(modelScene);

      await render
        .SetNode(renderNode)
        .SetTexture($BASE_TEXTURE)
        .then((x) => x.RenderStatic());
      await render
        .SetModelScene(modelScene2)
        .SetCameraOptions(new CameraConfig())
        .SetNode(renderNode2)
        .AddAnimation(WavingAnimation)
        .AddAnimation(DefaultAnimation)
        .AddShadow()
        .AddFloor(floorTexture)
        .SetBackground(0x202020)
        .SetTexture($planksTexture)
        .then((x) => x.RenderDynamic());

      laoded = true;
    });
  });
</script>

<div class="layout">
  <img bind:this={renderNode} style="width: 300px;height:300px" />
  <div bind:this={renderNode2} style="width: 600px;height:600px" />
</div>

<style lang="scss">
  @import "style.scss";
</style>
