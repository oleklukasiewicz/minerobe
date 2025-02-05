<script lang="ts">
  //main imports
  import { onDestroy, onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import * as THREE from "three";
  //api
  import {
    FetchSettings,
    GetIntegrationsList,
    UpdateBaseTexture,
  } from "$src/api/settings";
  //services
  import { ImportImages, ImportImagesFromFiles } from "$src/data/import";
  import { ExportImage } from "$src/data/export";
  //consts
  import {
    BASE_TEXTURE,
    CURRENT_APP_STATE,
    IS_MOBILE_VIEW,
    WS_CONNECTION,
  } from "$src/data/static";
  //model
  import { APP_STATE } from "$src/data/enums/app";
  //components
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  //icons
  import {
    GetAccount,
    GetCurrentSkin,
    LinkAccount,
    UnLinkAccount,
  } from "$src/api/integration/minecraft";
  import type {
    Cape,
    MinecraftAccount,
    MinecraftSkin,
  } from "$src/data/models/integration/minecraft";
  import CapeList from "$lib/components/outfit/CapeList/CapeList.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import LinkToMinecraftDialog from "$lib/components/dialog/LinkToMinecraftDialog/LinkToMinecraftDialog.svelte";
  import { goto } from "$app/navigation";
  import { ShowToast } from "$src/data/toast";

  const minecraftAccount: Writable<MinecraftAccount> = writable(null);

  let stateSub = null;
  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      dynamicRenderer = new THREE.WebGLRenderer({
        alpha: true,
      });
      dynamicRenderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      $WS_CONNECTION.on("linkToMc", (data) => {
        linkingStatus = data.status;
        linkingCode = data.data.userCode;
        linkingUrl = data.data.verificationUrl;
      });

      const list = await GetIntegrationsList();
      if (!list.integrations.includes("minecraft")) {
        isAccountLinked = false;
        loaded = true;
        return;
      }

      $minecraftAccount = await GetAccount(true);
      currentMinecraftSkin = await GetCurrentSkin(true);
      if (!$minecraftAccount) return;
      currentCape = $minecraftAccount?.capes?.find(
        (c) => c.id == $minecraftAccount?.currentCapeId
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
  let currentMinecraftSkin: MinecraftSkin = null;
  let accountInProgress = false;
  let isAccountLinked = true;

  //linking account data
  let isLinkToMcDialogOpen = false;
  let linkingStatus = "";
  let linkingAbordController = null;
  let linkingCode = "";
  let linkingUrl = "";

  const UnlinkMinecraftAccount = async () => {
    accountInProgress = true;
    await UnLinkAccount();
    accountInProgress = false;
    goto("/profile");
  };
  const StartLinkMinecraftAccount = async () => {
    CancelLinkToMinecraft();
    accountInProgress = true;
    linkingAbordController = new AbortController();
    isLinkToMcDialogOpen = true;

    $minecraftAccount = await LinkAccount(linkingAbordController);
    currentMinecraftSkin = await GetCurrentSkin(true);
    linkingStatus = "Ready";
    accountInProgress = false;
    isAccountLinked = true;
    ShowToast("Account linked successfully");
  };
  const CancelLinkToMinecraft = () => {
    linkingAbordController?.abort();
    accountInProgress = false;
    isLinkToMcDialogOpen = false;
  };
</script>

<div id="profile-minecraft" class:mobile={$IS_MOBILE_VIEW} class:linked={isAccountLinked}>
  {#if isAccountLinked}
    <div class="render">
      <Placeholder {loaded}>
        <OutfitPackageRender
          baseTexture={$BASE_TEXTURE}
          renderer={dynamicRenderer}
          resizable
          resizeDebounce={10}
          source={currentMinecraftSkin?.texture}
          model={currentMinecraftSkin.model}
          cape={currentCape?.texture}
          isDynamic={true}
        />
      </Placeholder>
    </div>
    <div class="data">
      <div>
        <SectionTitle label="Username" placeholder={!loaded} />
        <Placeholder {loaded} height="36px">
          <h2 class="username">{$minecraftAccount?.username}</h2></Placeholder
        >
      </div>
      <div>
        <SectionTitle label="Capes" placeholder={!loaded} />
        <Placeholder {loaded} height="64px">
          <CapeList
            items={$minecraftAccount?.capes}
            selectedCapeId={$minecraftAccount.currentCapeId}
            readonly
          /></Placeholder
        >
      </div>
      <div class="actions">
        <Placeholder {loaded} height="46px">
          <Button
            label={accountInProgress ? "Unlinking..." : "Unlink Account"}
            size="large"
            type="secondary"
            disabled={accountInProgress}
            on:click={UnlinkMinecraftAccount}
          />
        </Placeholder>
      </div>
    </div>
  {:else}
    <div id="to-link-account">
      <h1>Link your Minecraft account</h1>
      <p>
        Link to your minecraft account for easy skin management and automatis
        skin updates.
      </p>
      <Button
        label={accountInProgress ? "Linking..." : "Link Account"}
        size="large"
        type="primary"
        disabled={accountInProgress}
        on:click={StartLinkMinecraftAccount}
      />
    </div>
  {/if}
  <!-- Dialogs -->
  <LinkToMinecraftDialog
    on:close={CancelLinkToMinecraft}
    bind:open={isLinkToMcDialogOpen}
    authStatus={linkingStatus}
    authCode={linkingCode}
    authUrl={linkingUrl}
    profile={$minecraftAccount}
    skin={currentMinecraftSkin}
  />
</div>

<style lang="scss">
  @use "style.scss";
</style>
