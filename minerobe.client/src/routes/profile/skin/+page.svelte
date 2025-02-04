<script lang="ts">
  import {
    BASE_TEXTURE,
    CURRENT_APP_STATE,
    CURRENT_USER,
    IS_MOBILE_VIEW,
  } from "$src/data/static";
  import { onDestroy, onMount } from "svelte";
  import { APP_STATE } from "$src/data/enums/app";
  import type { MinerobeUserProfile } from "$src/data/models/user";
  import { writable, type Writable } from "svelte/store";
  import { GetUserProfile } from "$src/api/user";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import * as THREE from "three";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import ModelRadioGroup from "$lib/components/outfit/ModelRadioGroup/ModelRadioGroup.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import DownloadIcon from "$icons/download.svg?raw";
  import { ExportImage } from "$src/data/export";
  import { OutfitPackageToTextureConverter } from "$src/data/render";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";
  import { OutfitPackageRenderConfig } from "$src/data/models/render";
  import {  GetPackage } from "$src/api/pack";
  import type { RenderAnimation } from "$src/data/animation";
  import DefaultAnimation from "$src/animation/default";

  const profileUser: Writable<MinerobeUserProfile> = writable(null);
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

      $profileUser = await GetUserProfile($CURRENT_USER.id);

      $renderConfiguration.isFlatten= $profileUser.settings.currentTexture.isFlatten;
      if ($profileUser.settings.currentTexture != null) {
        $renderConfiguration.item = await GetPackage(
          $profileUser.settings.currentTexture.packageId
        );
        $renderConfiguration.item.model =
          $profileUser.settings.currentTexture.model;
      }
      if ($profileUser.settings.baseTexture != null) {
        $renderConfiguration.baseTexture =
          $profileUser.settings.baseTexture.layers[0];
      }
      loaded = true;
      setTimeout(() => addAnimation(null), 0);
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
        baseTexture={$profileUser?.settings?.baseTexture.layers[0] ||
          $BASE_TEXTURE}
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
