<script lang="ts">
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import MenuItem from "$lib/components/base/MenuItem/MenuItem.svelte";
  import MenuItemHeader from "$lib/components/base/MenuItemHeader/MenuItemHeader.svelte";
  import {
    BASE_TEXTURE,
    CURRENT_APP_STATE,
    CURRENT_USER,
    IS_MOBILE_VIEW,
  } from "$src/data/static";
  import MenuIcon from "$src/icons/menu.svg?raw";
  import ContactIcon from "$icons/contact.svg?raw";
  import ZapIcon from "$icons/zap.svg?raw";
  import AvatarIcon from "$icons/avatar.svg?raw";
  import LoginIcon from "$icons/login.svg?raw";
  import UsersIcon from "$icons/users.svg?raw";
  import DashboardIcon from "$icons/dashboard.svg?raw";
  import MenuSeparator from "$lib/components/base/MenuSeparator/MenuSeparator.svelte";
  import { onMount } from "svelte";
  import { APP_STATE } from "$src/data/enums/app";
  import type { MinerobeUserProfile } from "$src/data/models/user";
  import { writable, type Writable } from "svelte/store";
  import { GetUserProfile } from "$src/api/user";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import SocialInfo from "$lib/components/social/SocialInfo.svelte";
  import StatusCard from "$lib/components/other/StatusCard/StatusCard.svelte";
  import { GetAccount } from "$src/api/integration/minecraft";
  import CapeListItem from "$lib/components/outfit/CapeListItem/CapeListItem.svelte";
  import { Cape } from "$src/data/models/integration/minecraft";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import { MODEL_TYPE } from "$src/data/enums/model";
  import { GetImageFaceArea } from "$src/helpers/image/imageDataHelpers";
  import Label from "$lib/components/base/Label/Label.svelte";
  import ModelRadioGroup from "$lib/components/outfit/ModelRadioGroup/ModelRadioGroup.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import DragAndDrop from "$lib/components/draganddrop/DragAndDrop/DragAndDrop.svelte";
  import { ImportImages, ImportImagesFromFiles } from "$src/data/import";
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import OutfitLayerListItem from "$lib/components/outfit/OutfitLayerListItem/OutfitLayerListItem.svelte";
  import { OUTFIT_TYPE } from "$src/data/enums/outfit";
  import * as THREE from "three";
  import EditLayerDialog from "$lib/components/dialog/EditLayerDialog.svelte";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import { OutfitPackage } from "$src/data/models/package";

  const profileUser: Writable<MinerobeUserProfile> = writable(null);
  const minecraftIntegration: Writable<any> = writable(null);

  onMount(async () => {
    CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      dynamicRenderer = new THREE.WebGLRenderer({
        alpha: true,
      });
      dynamicRenderer.outputColorSpace = THREE.LinearSRGBColorSpace;

      $profileUser = await GetUserProfile($CURRENT_USER.id);
      if ($profileUser.settings.integrations.includes("minecraft")) {
        $minecraftIntegration = await GetAccount(true);
        if ($profileUser.settings.currentCapeId != null) {
          currentCape = $minecraftIntegration.capes.find(
            (x) => x.id == $profileUser.settings.currentCapeId
          );
        }
      }

      loaded = true;
    });
  });

  let currentCape: Cape = new Cape();
  let menuOpened = true;
  let selectedView = "overview";
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
</script>

<div id="profile-view">
  <div id="profile-navigation">
    <div>
      <Menu let:opened let:top opened={menuOpened} top={$IS_MOBILE_VIEW}>
        {#if !$IS_MOBILE_VIEW}
          <MenuItemHeader
            label="Profile"
            icon={MenuIcon}
            {opened}
            on:click={() => (menuOpened = !menuOpened)}
          />
        {/if}
        <MenuItem
          label="Overview"
          {opened}
          {top}
          icon={DashboardIcon}
          selected={selectedView == "overview"}
          on:click={() => (selectedView = "overview")}
        />
        <MenuItem
          label="Profile Data"
          {opened}
          {top}
          icon={ContactIcon}
          selected={selectedView == "data"}
          on:click={() => (selectedView = "data")}
        />
        <MenuItem
          label="Current Skin"
          {opened}
          {top}
          icon={UsersIcon}
          selected={selectedView == "skin"}
          on:click={() => (selectedView = "skin")}
        />
        <MenuItem
          label="Base Texture"
          {opened}
          {top}
          icon={AvatarIcon}
          selected={selectedView == "base-skin"}
          on:click={() => (selectedView = "base-skin")}
        />
        <MenuSeparator />
        <MenuItem
          label="Minecraft Account"
          {opened}
          {top}
          icon={ZapIcon}
          selected={selectedView == "minecraft-account"}
          on:click={() => (selectedView = "minecraft-account")}
        />
        <MenuItem
          slot="footer"
          opened={menuOpened}
          label="Sign Out"
          icon={LoginIcon}
        />
      </Menu>
    </div>
  </div>
  <div id="profile-content">
    {#if selectedView == "overview"}
      <div id="overview">
        <div id="overview-header">
          <!-- svelte-ignore a11y-missing-attribute -->
          <Placeholder
            {loaded}
            width="96px"
            height="96px"
            aspectRatio="1"
            loadedStyle={"height:96px"}
          >
            <img
              id="profile-avatar"
              src={$profileUser.user.avatar}
            /></Placeholder
          >
          <div id="profile-data">
            <Placeholder {loaded} height="43px" width="50%">
              <div id="profile-name">{$profileUser.user.name}</div>
            </Placeholder>
            <Placeholder {loaded} height="24px" width="20%">
              <SocialInfo data={$profileUser.social} />
            </Placeholder>
          </div>
        </div>
        <div id="overview-status">
          <StatusCard label={"minecraft account"}>
            <Placeholder {loaded} height="100%" width="100%">
              {#await GetImageFaceArea($profileUser?.settings?.currentTexture?.texture) then skin}
                <!-- svelte-ignore a11y-missing-attribute -->
                <img
                  src={skin}
                  style="width:100%;image-rendering: pixelated; "
                />
              {/await}
              <br />
              <br />
              {#if $minecraftIntegration != null}
                <Label variant="unique" text={$minecraftIntegration.username} />
              {:else}
                <div class="mc-font">No account linked</div>
              {/if}
            </Placeholder>
          </StatusCard>
          <StatusCard label={"current skin"} />
          <StatusCard label={"base texture"}>
            <Placeholder
              {loaded}
              height="100%"
              width="100%"
              loadedStyle="width:100%;"
            >
              {#if $profileUser?.settings?.baseTexture?.layers.length > 0}
                <div style="width: 100%;">
                  <OutfitPackageRender
                    source={$profileUser?.settings?.baseTexture}
                    model={"source"}
                  />
                </div>
              {:else}
                <div class="mc-font">No texture</div>
              {/if}
            </Placeholder>
          </StatusCard>
          {#if currentCape != null}
            <StatusCard label={"cape"}>
              <Placeholder
                {loaded}
                height="100%"
                width="100%"
                loadedStyle="width:100%;"
              >
                <div class="font-center">
                  <CapeListItem item={currentCape} readonly />
                  <br />
                  <br />
                  <div class="mc-font">{currentCape.name || "No Cape"}</div>
                </div>
              </Placeholder>
            </StatusCard>
          {/if}
        </div>
      </div>
    {/if}
    {#if selectedView == "your-data"}
      <h1>Your Data</h1>
    {/if}
    {#if selectedView == "minecraft-account"}
      <h1>Minecraft Account</h1>
    {/if}
    {#if selectedView == "base-skin"}
      <div id="base-skin">
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
          <Placeholder {loaded} height="46px">
            <Button
              label="Import base texture"
              size="large"
              on:click={ImportBaseTexture}
              icon={ImportPackageIcon}
            />
          </Placeholder>
        </div>
      </div>
    {/if}
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
