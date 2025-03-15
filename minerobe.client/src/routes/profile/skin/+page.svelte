<script lang="ts">
  //main imports
  import { onDestroy, onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  //api
  import { GetPackage } from "$src/api/pack";
  import { FetchSettings, SetCurrentTexture } from "$src/api/settings";
  import { GetAccount } from "$src/api/integration/minecraft";
  //services
  import { ShowToast } from "$src/data/toast";
  import { ExportImage } from "$src/data/export";
  import { OutfitPackageToTextureConverter } from "$src/data/render";
  //consts
  import DefaultAnimation from "$src/animation/default";
  import {
    BASE_TEXTURE,
    CURRENT_APP_STATE,
    IS_MOBILE_VIEW,
  } from "$src/data/static";
  //models
  import { APP_STATE } from "$src/data/enums/app";
  import type { MinerobeUserSettings } from "$src/data/models/user";
  import type { RenderAnimation } from "$src/data/animation";
  import { OutfitPackageRenderConfig } from "$src/data/models/render";
  import type {
    Cape,
    MinecraftAccount,
  } from "$src/data/models/integration/minecraft";
  //components
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";
  import ModelRadioGroup from "$lib/components/outfit/ModelRadioGroup/ModelRadioGroup.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import CapeList from "$lib/components/outfit/CapeList/CapeList.svelte";
  //icons
  import DownloadIcon from "$icons/download.svg?raw";
  import HumanHandsUpIcon from "$icons/human-handsup.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";
  import { IsEmptyGuid } from "$src/helpers/data/dataHelper";
  import { THREE } from "$lib/three";

  const userSettings: Writable<MinerobeUserSettings> = writable(null);
  const renderConfiguration: Writable<OutfitPackageRenderConfig> = writable(
    new OutfitPackageRenderConfig()
  );

  let loaded = false;
  let dynamicRenderer = null;
  let integrationSettings: MinecraftAccount = null;
  let isSkinSetting = false;

  let stateSub = null;
  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      const threeModule = await THREE.getThree();
      dynamicRenderer = new threeModule.WebGLRenderer({
        alpha: true,
      });
      dynamicRenderer.outputColorSpace = threeModule.LinearSRGBColorSpace;

      $userSettings = await FetchSettings();

      if (
        $userSettings.currentTexture != null &&
        IsEmptyGuid($userSettings.currentTexture.packageId) == false
      ) {
        $renderConfiguration.FromExportConfig(
          $userSettings.currentTexture,
          await GetPackage($userSettings.currentTexture.packageId)
        );
      }

      if ($userSettings.baseTexture != null)
        $renderConfiguration.baseTexture = $userSettings.baseTexture.layers[0];

      if ($userSettings.integrations.includes("minecraft")) {
        integrationSettings = await GetAccount(false);
        $renderConfiguration.cape = integrationSettings.capes?.find(
          (c) => c.id == $userSettings?.currentTexture?.capeId
        );
      }
      loaded = true;
      setTimeout(() => addAnimation(null), 0);
    });
  });
  onDestroy(() => {
    if (stateSub) stateSub();
  });

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
  const UpdateSkin = async function () {
    isSkinSetting = true;
    await SetCurrentTexture($renderConfiguration.ToExportConfig());
    isSkinSetting = false;
    ShowToast("Skin updated", "success");
  };

  const setCape = function (e) {
    const item = e.detail.item as Cape;
    $renderConfiguration.cape = item;
  };
</script>

<div id="profile-base" class:mobile={$IS_MOBILE_VIEW}>
  <div class="render">
    <Placeholder {loaded}>
      <OutfitPackageRender
        pauseOnIntersection
        bind:addAnimation={__addAnimation}
        baseTexture={$userSettings?.baseTexture.layers[0] || $BASE_TEXTURE}
        source={$renderConfiguration.item}
        isFlatten={$renderConfiguration.isFlatten}
        renderer={dynamicRenderer}
        cape={$renderConfiguration?.cape?.texture}
        resizable
        resizeDebounce={-1}
        isDynamic={true}
      />
    </Placeholder>
  </div>
  <div class="data">
    <div>
      {#if loaded && integrationSettings != null}
        <SectionTitle label="Capes" />
        <CapeList
          items={integrationSettings.capes}
          selectedCapeId={$renderConfiguration.cape?.id}
          on:select={setCape}
        />
      {/if}
    </div>
    <div>
      <SectionTitle placeholder={!loaded} label="Model" />
      <Placeholder {loaded} height="43px">
        <ModelRadioGroup
          bind:selectedValue={$renderConfiguration.item.model}
        /></Placeholder
      >
    </div>
    <div id="data-minimal">
      <Placeholder width="150px" height="30px" {loaded}>
        <Checkbox
          label="Minimal format"
          bind:value={$renderConfiguration.isFlatten}
        />
      </Placeholder>
    </div>
    <br />
    <Placeholder {loaded} height="46px">
      <Button
        label={isSkinSetting ? "Updating skin..." : "Update skin"}
        type="primary"
        disabled={isSkinSetting}
        icon={isSkinSetting ? LoaderIcon : HumanHandsUpIcon}
        size="large"
        on:click={UpdateSkin}
      />
    </Placeholder>
    <Placeholder {loaded} height="46px">
      <Button
        label="Download Skin"
        size="large"
        type="secondary"
        icon={DownloadIcon}
        on:click={DownloadSkin}
      />
    </Placeholder>
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
