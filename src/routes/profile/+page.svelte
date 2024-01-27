<script lang="ts">
  import { _ } from "svelte-i18n";
  import SectionTitle from "$component/base/SectionTitle/SectionTitle.svelte";
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
  import CloseIcon from "$icons/close.svg?raw";
  import { mergeImages } from "$src/data/imageMerger";
  import { ImportImage } from "$src/helpers/imageOperationsHelper";
  import { logoutUser } from "$src/api/auth";
  import { navigateToHome } from "$src/helpers/navigationHelper";
  import Placeholder from "$component/base/Placeholder/Placeholder.svelte";
  import SocialInfo from "$component/social/SocialInfo/SocialInfo.svelte";
  import Dialog from "$component/base/Dialog/Dialog.svelte";
  import MinecraftAuth from "$component/other/MinecraftAuth/MinecraftAuth.svelte";
  import AvatarIcon from "$src/icons/avatar.svg?raw";
  import {
    LinkMinecraftAccount,
    UnlinkMinecraftAccount,
  } from "$src/api/settings";
  import { GetFaceOfRemoteSkin } from "$src/helpers/imageDataHelpers";
  import OutfitTextureRender from "$lib/components/render/OutfitTextureRender.svelte";
  import BaseTextureDialog from "$lib/components/dialog/BaseTextureDialog.svelte";

  const userModel = propertyStore(userSettings, "model");

  let providers: { steve: RenderProvider; alex: RenderProvider };

  let isAuthDialogOpen = false;
  let isBaseTextureDialogOpen=false;
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
      requireUserInteraction = v.linkedMinecraftAccount == null;
      profile = v.linkedMinecraftAccount;
      if (profile) {
        let skinUrl = profile.skins.find((s) => s.state == "ACTIVE").url;
        skinUrl = skinUrl.replace("http://", "https://");
        profilePhoto = await GetFaceOfRemoteSkin(skinUrl);
      }
    });
  });
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
  <div class="header-area">
    <div class="header-image">
      <!-- svelte-ignore a11y-missing-attribute -->
      <img src={$currentUser?.avatar} />
    </div>
    <div class="header-name">
      <SectionTitle label="Profile" placeholder={loading} />
      {#if !loading}
        <h1>{$currentUser?.name}</h1>
      {:else}
        <Placeholder style="height:46px;margin-bottom:16px;min-width:200px" />
      {/if}
    </div>
    <div class="header-social">
      <SectionTitle label="Total" placeholder={loading} />
      <SocialInfo
        data={{
          likes: $wardrobe.local?.totalLikes,
          downloads: $wardrobe.local?.totalDownloads,
          isFeatured: false,
        }}
      />
    </div>
  </div>
  <div class="profile-cards">
    <div class="profile-card">
      <SectionTitle label="Base texture" placeholder={loading} />
      {#if !loading}
        <div>
          <OutfitTextureRender
            renderProvider={$userModel == MODEL_TYPE.ALEX
              ? providers.alex
              : providers.steve}
            texture={$userSettings.baseTexture}
          />
        </div>
        <div class="actions">
          <button on:click={()=>isBaseTextureDialogOpen=true}>Edit</button>
        </div>
      {/if}
    </div>
    <div class="profile-card">
      <SectionTitle label="Minecraft account" placeholder={loading} />
      {#if !loading}
        <div class="main-data">
          <!-- svelte-ignore a11y-missing-attribute -->
          {#if $userSettings?.linkedMinecraftAccount?.name != null}
            <img src={profilePhoto} style="min-width: calc(100% - 80px);" />
            <span class="mc-font"
              >{$userSettings.linkedMinecraftAccount.name}</span
            >
          {:else}
            <span class="icon-big">{@html AvatarIcon}</span>
            <span class="mc-font">Not linked</span>
          {/if}
        </div>
        <div class="actions">
          {#if $userSettings?.linkedMinecraftAccount?.name == null}
            <button on:click={linkAccount}>Link account</button>
          {:else}
            <button class="secondary" on:click={() => (isAuthDialogOpen = true)}
              >Unlink account</button
            >
          {/if}
        </div>
      {/if}
    </div>
    <div class="profile-card">
      <SectionTitle label="Profile page" placeholder={loading} />
      {#if !loading}
        <div class="main-data">
          <span class="mc-font">{$currentUser?.name}</span>
        </div>
        <div class="actions">
          <a href="/profile/{$currentUser.id}">
            <button style="width: 100%;">profile page</button></a
          >
        </div>
      {/if}
    </div>
    <div class="profile-card">
      <SectionTitle label="Logout"></SectionTitle>
      <div class="main-data">
        <span class="mc-font">Logout from your account</span>
      </div>
      <div class="actions">
        <button class="secondary" on:click={logout}>Logout</button>
      </div>
    </div>
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
<Dialog bind:open={isBaseTextureDialogOpen}>
  <div class="dialog-header" style="padding:16px;">
    <h1>Base texture</h1>
    <button
      style="margin: 0px"
      class="icon tertiary"
      on:click={() => {
        isBaseTextureDialogOpen = false;
      }}
    >
      {@html CloseIcon}
    </button>
  </div>
  {#if isBaseTextureDialogOpen}
  <BaseTextureDialog/>
  {/if}
  </Dialog>
<style lang="scss">
  @import "style.scss";
</style>
