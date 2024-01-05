<script lang="ts">
  import { _ } from "svelte-i18n";
  import ModelSelection from "$lib/ModelSelection/ModelSelection.svelte";
  import SectionTitle from "$lib/SectionTitle/SectionTitle.svelte";
  import DynamicRender from "$lib/render/DynamicRender.svelte";
  import DefaultAnimation from "$src/animation/default";
  import {
    alexModel,
    currentUser,
    defaultRenderer,
    isMobileView,
    isReadyForData,
    planksTexture,
    steveModel,
    userSettings,
  } from "$src/data/cache";
  import { MODEL_TYPE } from "$src/data/consts";
  import {
    CreateDefaultRenderProvider,
    RenderProvider,
  } from "$src/data/render";
  import { onMount } from "svelte";
  import { propertyStore } from "svelte-writable-derived";
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import { mergeImages } from "$src/helpers/imageMerger";
  import { ImportImage } from "$src/helpers/imageOperations";
  import { logoutUser } from "$src/api/auth";
  import { navigateToHome } from "$src/helpers/navigationHelper";

  const userModel = propertyStore(userSettings, "model");

  let providers: { steve: RenderProvider; alex: RenderProvider };

  let loading = true;
  onMount(async () => {
    providers = await CreateDefaultRenderProvider($defaultRenderer);
    isReadyForData.subscribe((v) => {
      if (v.wardrobe) {
        loading = false;
      }
    });
    userSettings.subscribe(async (v) => {
      if (v.baseTexture) {
        texture = await mergeImages(
          [$planksTexture, v.baseTexture],
          undefined,
          v.model
        );
      } else texture = $planksTexture;
    });
  });
  let texture = $planksTexture;
  const importBaseImage = async () => {
    const filedata = await ImportImage();
    if (filedata) {
      userSettings.update((v) => {
        v.baseTexture = filedata[0].content;
        return v;
      });
    }
  };
  const resetImage = () => {
    userSettings.update((v) => {
      v.baseTexture = null;
      return v;
    });
  };
  const logout = async () => {
   navigateToHome();
   await logoutUser();
  };
</script>

<div id="profile-view" class:mobile={$isMobileView}>
  <div class="render-area">
    {#if !loading}
      {#if !$isMobileView}
        <SectionTitle label="base texture" placeholder={loading} />
      {/if}
      <div class="render">
        <DynamicRender
          defaultAnimation={DefaultAnimation}
          model={$userModel == MODEL_TYPE.STEVE ? $steveModel : $alexModel}
          {texture}
          modelName={$userModel}
        />
      </div>
      <div class="render-actions">
        <ModelSelection bind:group={$userModel} />
        <div class="render-opt">
          <button class="secondary" class:disabled={loading}
            on:click={importBaseImage}
            >{@html ImportPackageIcon}
            {$_("layersOpt.addLayer")}</button
          >
          <button
            class="secondary"
            class:disabled={loading}
            on:click={resetImage}>{@html CloseIcon} Reset</button
          >
        </div>
      </div>
    {/if}
  </div>
  <div class="data-area">
    <SectionTitle label="Profile" placeholder={loading} />
    {#if !loading}
      <h1>{$currentUser?.name}</h1>
      <button on:click={logout}>Logout</button>
    {/if}
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
