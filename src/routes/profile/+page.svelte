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
    wardrobe,
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
  import Placeholder from "$lib/Placeholder/Placeholder.svelte";
  import SocialInfo from "$lib/SocialInfo/SocialInfo.svelte";
  import Label from "$lib/Label/Label.svelte";
  import Dialog from "$lib/Dialog/Dialog.svelte";
  import MinecraftAuth from "$lib/MinecraftAuth/MinecraftAuth.svelte";

  import {
    LinkMinecraftAccount,
    UnlinkMinecraftAccount,
  } from "$src/api/settings";
  import { GetFaceOfRemoteSkin } from "$src/helpers/imageDataHelpers";

  const userModel = propertyStore(userSettings, "model");

  let providers: { steve: RenderProvider; alex: RenderProvider };

  let isAuthDialogOpen = false;
  let authCode = "";
  let profile: any;
  let profilePhoto = "";
  let requireUserInteraction = true;
  let authUrl = "";
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
      requireUserInteraction = v.linkedMinecraftAccount == null;
      profile = v.linkedMinecraftAccount;
      if (profile) {
        let skinUrl = profile.skins.find((s) => s.state == "ACTIVE").url;
        skinUrl = skinUrl.replace("http://", "https://");
        profilePhoto = await GetFaceOfRemoteSkin(skinUrl);
      }
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

  const unlinkAccount = async function () {
    await UnlinkMinecraftAccount();
    requireUserInteraction = true;
    profile = null;
    isAuthDialogOpen = false;
  };
  const linkAccount = async function () {
    const resp = await LinkMinecraftAccount();
    if (resp.requireUserInteraction) {
      authCode = resp.params.userCode;
      authUrl = resp.params.verificationUri;
      requireUserInteraction = resp.requireUserInteraction;
      profile = resp.profile;
    } else {
      isAuthDialogOpen = false;
    }
    isAuthDialogOpen = true;
  };
</script>

<div id="profile-view" class:mobile={$isMobileView}>
  <div class="render-area">
    <div class="render">
      {#if !loading}
        <DynamicRender
          defaultAnimation={DefaultAnimation}
          model={$userModel == MODEL_TYPE.STEVE ? $steveModel : $alexModel}
          {texture}
          modelName={$userModel}
        />
      {:else}
        <Placeholder />
      {/if}
    </div>
    <div class="render-actions">
      <SectionTitle label="model" placeholder={loading} />
      {#if !loading}
        <ModelSelection bind:group={$userModel} />
      {:else}
        <Placeholder style="height:52px" />
      {/if}
      <div class="render-opt">
        {#if !loading}
          <button
            class="secondary"
            class:disabled={loading}
            on:click={importBaseImage}
            >{@html ImportPackageIcon}
            {$_("layersOpt.addLayer")}</button
          >
          <button
            class="secondary"
            class:disabled={loading}
            on:click={resetImage}>{@html CloseIcon} Reset</button
          >
        {:else}
          <Placeholder style="height:42px" />
          <Placeholder style="height:42px" />
        {/if}
      </div>
    </div>
  </div>
  <div class="data-area">
    <SectionTitle label="Profile" placeholder={loading} />
    {#if !loading}
      <h1>{$currentUser?.name}</h1>
      <div>
        <SectionTitle label="Total" placeholder={loading} />
        <SocialInfo
          data={{
            likes: $wardrobe.local.totalLikes,
            downloads: $wardrobe.local.totalDownloads,
            isFeatured: false,
          }}
        />
      </div>
      <SectionTitle label="Minecraft account" placeholder={loading} />
      {#if $userSettings?.linkedMinecraftAccount?.name == null}
        <button on:click={linkAccount}>Link account</button>
      {:else}
        <div class="profile-data">
          <!-- svelte-ignore a11y-missing-attribute -->
          <img src={profilePhoto} />
          <span class="mc-font"
            >{$userSettings.linkedMinecraftAccount.name}</span
          >
          <button class="secondary" on:click={() => (isAuthDialogOpen = true)}
            >Unlink account</button
          >
        </div>
      {/if}
      <br />
      <button on:click={logout}>Logout</button>
    {:else}
      <Placeholder style="height:46px;margin-bottom:16px;" />
      <Placeholder style="height:24px; max-width:100px;margin-bottom:8px;" />
      <Placeholder style="height:36px;margin-bottom:16px; max-width:400px;" />
      <Placeholder style="height:24px;" />
      <Placeholder style="height:46px;margin-bottom:16px;" />
    {/if}
  </div>
</div>
<Dialog bind:open={isAuthDialogOpen}>
  <div class="auth-dialog">
    <div class="dialog-header">
      <h1>{$_("link_to_mc")}</h1>
      <button
        style="margin: 0px"
        class="icon tertiary"
        on:click={() => {
          isAuthDialogOpen = false;
        }}
      >
        {@html CloseIcon}
      </button>
    </div>
    <MinecraftAuth
      isAuthorized={!requireUserInteraction}
      {profile}
      {authCode}
      {authUrl}
      on:unlink={unlinkAccount}
    />
  </div>
</Dialog>

<style lang="scss">
  @import "style.scss";
</style>
