<script lang="ts">
  //main imports
  import { onDestroy, onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import * as THREE from "three";
  //api
  import { GetPackage } from "$src/api/pack";
  import { FetchSettings, SetCurrentTexture } from "$src/api/settings";
  //services
  import { ExportImage } from "$src/data/export";
  import { OutfitPackageToTextureConverter } from "$src/data/render";
  import { debounce } from "$src/data/base";
  //consts
  import DefaultAnimation from "$src/animation/default";
  import {
    BASE_TEXTURE,
    CURRENT_APP_STATE,
    IS_MOBILE_VIEW,
  } from "$src/data/static";
  //model
  import { APP_STATE } from "$src/data/enums/app";
  import type { MinerobeUserSettings } from "$src/data/models/user";
  import type { RenderAnimation } from "$src/data/animation";
  import { OutfitPackageRenderConfig } from "$src/data/models/render";
  //components
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";
  import ModelRadioGroup from "$lib/components/outfit/ModelRadioGroup/ModelRadioGroup.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  //icons
  import DownloadIcon from "$icons/download.svg?raw";

  const userSettings: Writable<MinerobeUserSettings> = writable(null);
  const renderConfiguration: Writable<OutfitPackageRenderConfig> = writable(
    new OutfitPackageRenderConfig()
  );
  let stateSub = null;
  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      dynamicRenderer = new THREE.WebGLRenderer({
        alpha: true,
      });
      dynamicRenderer.outputColorSpace = THREE.LinearSRGBColorSpace;

      $userSettings = await FetchSettings();

      $renderConfiguration.isFlatten = $userSettings.currentTexture.isFlatten;
      if ($userSettings.currentTexture != null) {
        $renderConfiguration.item = await GetPackage(
          $userSettings.currentTexture.packageId
        );
        $renderConfiguration.item.model = $userSettings.currentTexture.model;
      }
      if ($userSettings.baseTexture != null)
        $renderConfiguration.baseTexture = $userSettings.baseTexture.layers[0];

      loaded = true;
      setTimeout(() => addAnimation(null), 0);
      renderConfiguration.subscribe(async (value) => {
        await UpdateCurrentSkinDebouced(value);
      });
    });
  });
  onDestroy(() => {
    if (stateSub) stateSub();
  });

  let loaded = false;
  let dynamicRenderer = null;

  let __addAnimation = function (
    animation: RenderAnimation,
    force: boolean = false
  ) {};

  const UpdateCurrentSkinDebouced = debounce(async (value) => {
    if (loaded) await SetCurrentTexture($renderConfiguration.ToExportConfig());
  }, 500);

  const addAnimation = (animation: RenderAnimation) => {
    if (animation) __addAnimation(animation, false);
    __addAnimation(DefaultAnimation, true);
  };

  const DownloadSkin = async function () {
    const texture = new OutfitPackageToTextureConverter();
    texture.SetOptions($renderConfiguration);
    var textureData = await texture.ConvertAsyncWithFlattenSettingsAsync();

    await ExportImage(textureData, $renderConfiguration.item.name);
  };
</script>

<div id="profile-base" class:mobile={$IS_MOBILE_VIEW}>
  <div class="render">
    <Placeholder {loaded}>
      <OutfitPackageRender
        bind:addAnimation={__addAnimation}
        baseTexture={$userSettings?.baseTexture.layers[0] || $BASE_TEXTURE}
        source={$renderConfiguration.item}
        isFlatten={$renderConfiguration.isFlatten}
        renderer={dynamicRenderer}
        resizable
        resizeDebounce={10}
        isDynamic={true}
      />
    </Placeholder>
  </div>
  <div class="data">
    <div>
      <SectionTitle placeholder={!loaded} label="Model" />
      <Placeholder {loaded} height="43px">
        <ModelRadioGroup
          bind:selectedValue={$renderConfiguration.item.model}
        /></Placeholder
      >
    </div>
    <Placeholder width="150px" height="30px" {loaded}>
      <Checkbox
        label="Minimal format"
        bind:value={$renderConfiguration.isFlatten}
      />
    </Placeholder>
    <br />
    <Placeholder {loaded} height="46px">
      <Button
        label="Download Skin"
        size="large"
        type="primary"
        icon={DownloadIcon}
        on:click={DownloadSkin}
      />
    </Placeholder>
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
