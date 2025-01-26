<script lang="ts">
  import {
    BASE_TEXTURE,
    CURRENT_APP_STATE,
    CURRENT_USER,
  } from "$src/data/static";
  import { onDestroy, onMount } from "svelte";
  import { APP_STATE } from "$src/data/enums/app";
  import type { MinerobeUserProfile } from "$src/data/models/user";
  import { writable, type Writable } from "svelte/store";
  import { GetUserProfile } from "$src/api/user";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import * as THREE from "three";
  import { ImportImages, ImportImagesFromFiles } from "$src/data/import";
  import { OutfitPackage } from "$src/data/models/package";
  import { MODEL_TYPE } from "$src/data/enums/model";
  import DragAndDrop from "$lib/components/draganddrop/DragAndDrop/DragAndDrop.svelte";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import OutfitLayerListItem from "$lib/components/outfit/OutfitLayerListItem/OutfitLayerListItem.svelte";
  import ModelRadioGroup from "$lib/components/outfit/ModelRadioGroup/ModelRadioGroup.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import EditLayerDialog from "$lib/components/dialog/EditLayerDialog.svelte";
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import DownloadIcon from "$icons/download.svg?raw";
  import { ExportImage } from "$src/data/export";

  const profileUser: Writable<MinerobeUserProfile> = writable(null);

  let stateSub = null;
  onMount(async () => {
    stateSub=CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      dynamicRenderer = new THREE.WebGLRenderer({
        alpha: true,
      });
      dynamicRenderer.outputColorSpace = THREE.LinearSRGBColorSpace;

      $profileUser = await GetUserProfile($CURRENT_USER.id);
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
    $profileUser.settings.baseTexture.layers = [textures[0]];
  };

  const ImportBaseTexture = async function () {
    const files = await ImportImages(false);
    $profileUser.settings.baseTexture.layers = [files[0]];
  };
  const EditBaseTexture = function (e) {
    const layer = e.detail.item;
    $profileUser.settings.baseTexture.layers[0] = layer;
    isBaseTextureEditDialogOpen = true;
  };
  const RemoveBaseTexture = function () {
    $profileUser.settings.baseTexture = new OutfitPackage(
      "base",
      MODEL_TYPE.STEVE,
      []
    );
  };
  const OpenEditBaseTetxureDialog = function () {
    isBaseTextureEditDialogOpen = true;
  };
  const DownloadBaseTexture = async function () {
    await ExportImage(
      $profileUser.settings.baseTexture.layers[0][
        $profileUser.settings.baseTexture.model
      ].content,
      "Base"
    );
  };
</script>

<div id="profile-base">
  <div class="render">
    <Placeholder {loaded}>
      <DragAndDrop on:drop={DropBaseTexture}>
        <OutfitPackageRender
          baseTexture={$BASE_TEXTURE}
          renderer={dynamicRenderer}
          resizable
          resizeDebounce={10}
          source={$profileUser?.settings?.baseTexture}
          isDynamic={true}
        /></DragAndDrop
      >
    </Placeholder>
  </div>
  <div class="data">
    {#if $profileUser?.settings?.baseTexture.layers.length > 0 || !loaded}
      <div>
        <SectionTitle placeholder={!loaded} label="base Texture" />
        <Placeholder {loaded} height="68px">
          <OutfitLayerListItem
            item={$profileUser.settings.baseTexture.layers[0]}
            model={$profileUser.settings.baseTexture.model}
            movable={false}
            labels={false}
            removable={true}
            on:edit={OpenEditBaseTetxureDialog}
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
          bind:selectedValue={$profileUser.settings.baseTexture.model}
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
    item={$profileUser?.settings?.baseTexture?.layers[0]}
  />
</div>

<style lang="scss">
  @use "style.scss";
</style>
