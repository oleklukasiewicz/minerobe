<script lang="ts">
  //main imports
  import { onDestroy, onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import * as THREE from "three";
  //api
  import { FetchSettings, UpdateBaseTexture } from "$src/api/settings";
  //services
  import { ImportImages, ImportImagesFromFiles } from "$src/data/import";
  import { ExportImage } from "$src/data/export";
  import { ShowToast } from "$src/data/toast";
  //consts
  import {
    BASE_TEXTURE,
    CURRENT_APP_STATE,
    IS_MOBILE_VIEW,
  } from "$src/data/static";
  import { DEFAULT_PACKAGE } from "$src/data/consts/outfit";
  //model
  import { APP_STATE } from "$src/data/enums/app";
  import type { MinerobeUserSettings } from "$src/data/models/user";
  //components
  import DragAndDrop from "$lib/components/draganddrop/DragAndDrop/DragAndDrop.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import OutfitLayerListItem from "$lib/components/outfit/OutfitLayerListItem/OutfitLayerListItem.svelte";
  import ModelRadioGroup from "$lib/components/outfit/ModelRadioGroup/ModelRadioGroup.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import EditLayerDialog from "$lib/components/dialog/EditLayerDialog.svelte";
  //icons
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import DownloadIcon from "$icons/download.svg?raw";

  const userSettings: Writable<MinerobeUserSettings> = writable(null);

  let stateSub = null;
  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      dynamicRenderer = new THREE.WebGLRenderer({
        alpha: true,
      });
      dynamicRenderer.outputColorSpace = THREE.LinearSRGBColorSpace;

      $userSettings = await FetchSettings();
      loaded = true;
    });
  });
  onDestroy(() => {
    if (stateSub) stateSub();
  });

  let loaded = false;
  let dynamicRenderer = null;

  //base texture dialogs
  let isBaseTextureEditDialogOpen = false;

  //base texture
  const DropBaseTexture = async function (e) {
    const files = e.detail.items;
    const textures = await ImportImagesFromFiles(files);
    $userSettings.baseTexture.layers = [textures[0]];
    await UpdateBaseTexture($userSettings.baseTexture);
    ShowToast("Base texture updated");
  };

  const ImportBaseTexture = async function () {
    const files = await ImportImages(false);
    $userSettings.baseTexture.layers = [files[0]];
    await UpdateBaseTexture($userSettings.baseTexture);
    ShowToast("Base texture updated");
  };
  const EditBaseTexture = async function (e) {
    const layer = e.detail.item;
    $userSettings.baseTexture.layers[0] = layer;
    await UpdateBaseTexture($userSettings.baseTexture);
    ShowToast("Base texture updated");
    isBaseTextureEditDialogOpen = true;
  };
  const RemoveBaseTexture = async function () {
    $userSettings.baseTexture = DEFAULT_PACKAGE;
    await UpdateBaseTexture($userSettings.baseTexture);
    ShowToast("Base texture removed");
  };
  const OpenEditBaseTextureDialog = function () {
    isBaseTextureEditDialogOpen = true;
  };
  const DownloadBaseTexture = async function () {
    await ExportImage(
      $userSettings.baseTexture.layers[0][$userSettings.baseTexture.model]
        .content,
      "Base"
    );
  };
</script>

<div id="profile-base" class:mobile={$IS_MOBILE_VIEW}>
  <div class="render">
    <Placeholder {loaded}>
      <DragAndDrop on:drop={DropBaseTexture}>
        <OutfitPackageRender
          baseTexture={$BASE_TEXTURE}
          renderer={dynamicRenderer}
          resizable
          resizeDebounce={10}
          source={$userSettings?.baseTexture}
          isDynamic={true}
        /></DragAndDrop
      >
    </Placeholder>
  </div>
  <div class="data">
    {#if $userSettings?.baseTexture.layers.length > 0 || !loaded}
      <div>
        <SectionTitle placeholder={!loaded} label="base Texture" />
        <Placeholder {loaded} height="68px">
          <OutfitLayerListItem
            item={$userSettings.baseTexture.layers[0]}
            model={$userSettings.baseTexture.model}
            movable={false}
            labels={false}
            removable={true}
            on:edit={OpenEditBaseTextureDialog}
            on:delete={RemoveBaseTexture}
          /></Placeholder
        >
      </div>
    {:else}
      <h3 class="mc-font font-center">No base texture</h3>
    {/if}
    <div>
      <SectionTitle placeholder={!loaded} label="Model" />
      <Placeholder {loaded} height="43px">
        <ModelRadioGroup
          bind:selectedValue={$userSettings.baseTexture.model}
        /></Placeholder
      >
    </div>
    <br />
    <Placeholder {loaded} height="46px">
      <Button
        label="Import base texture"
        size="large"
        on:click={ImportBaseTexture}
        icon={ImportPackageIcon}
      />
    </Placeholder>
    <Placeholder {loaded} height="46px">
      <Button
        label="Download Texture"
        size="large"
        type="secondary"
        icon={DownloadIcon}
        on:click={DownloadBaseTexture}
      />
    </Placeholder>
  </div>
  <!-- Dialogs -->
  <EditLayerDialog
    onlyTextures
    on:edit={EditBaseTexture}
    bind:open={isBaseTextureEditDialogOpen}
    item={$userSettings?.baseTexture?.layers[0]}
  />
</div>

<style lang="scss">
  @use "style.scss";
</style>
