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
  //consts
  import {
    BASE_TEXTURE,
    CURRENT_APP_STATE,
    IS_MOBILE_VIEW,
  } from "$src/data/static";
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
  import { DEFAULT_PACKAGE } from "$src/data/consts/outfit";
  import { ShowToast } from "$src/data/toast";
  import { GetFullAccount } from "$src/api/integration/minecraft";
  import type {
    Cape,
    MinecraftAccount,
  } from "$src/data/models/integration/minecraft";
  import { MODEL_TYPE } from "$src/data/enums/model";
  import CapeList from "$lib/components/outfit/CapeList/CapeList.svelte";

  const minecraftAccount: Writable<MinecraftAccount> = writable(null);

  let stateSub = null;
  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      dynamicRenderer = new THREE.WebGLRenderer({
        alpha: true,
      });
      dynamicRenderer.outputColorSpace = THREE.LinearSRGBColorSpace;

      $minecraftAccount = await GetFullAccount();
      currentCape = $minecraftAccount?.capes.find(
        (c) => c.id == $minecraftAccount.currentCapeId
      );
      loaded = true;
    });
  });
  onDestroy(() => {
    if (stateSub) stateSub();
  });

  let loaded = false;
  let dynamicRenderer = null;
  let currentCape: Cape = null;
</script>

<div id="profile-minecraft" class:mobile={$IS_MOBILE_VIEW}>
  <div class="render">
    <Placeholder {loaded}>
      <OutfitPackageRender
        baseTexture={$BASE_TEXTURE}
        renderer={dynamicRenderer}
        resizable
        resizeDebounce={10}
        source={$minecraftAccount?.skin?.texture}
        model={$minecraftAccount?.skin?.variant}
        cape={currentCape.texture}
        isDynamic={true}
      />
    </Placeholder>
  </div>
  <div class="data">
    <div>
      <SectionTitle label="Username" placeholder={!loaded} />
      <Placeholder {loaded}>
        <h2 class="username">{$minecraftAccount?.username}</h2></Placeholder
      >
    </div>
    <div>
      {#if $minecraftAccount != null}
        <SectionTitle label="Capes" />
        <CapeList
          items={$minecraftAccount?.capes}
          selectedCapeId={$minecraftAccount.currentCapeId}
          readonly
        />
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
