<script lang="ts">
  import { _ } from "svelte-i18n";
  import SectionTitle from "$component/base/SectionTitle/SectionTitle.svelte";
  import {
    currentUser,
    defaultRenderer,
    isMobileView,
    isReadyForData,
    userSettings,
  } from "$src/data/cache";
  import { MODEL_TYPE } from "$src/data/consts";
  import {
    CreateDefaultRenderProvider,
    RenderProvider,
  } from "$src/data/render";
  import { onMount } from "svelte";
  import { propertyStore } from "svelte-writable-derived";
  import { logoutUser } from "$src/api/auth";
  import { navigateToHome } from "$src/helpers/other/navigationHelper";
  import Placeholder from "$component/base/Placeholder/Placeholder.svelte";
  import Dialog from "$component/base/Dialog/Dialog.svelte";
  import AvatarIcon from "$src/icons/avatar.svg?raw";
  import LoginIcon from "$src/icons/login.svg?raw";
  import {
    LinkMinecraftAccount,
    UnlinkMinecraftAccount,
  } from "$helpers/other/minecraftServicesHelper";
  import { GetCurrentBaseTexture, GetFaceOfRemoteSkin } from "$src/helpers/image/imageDataHelpers";
  import OutfitTextureRender from "$lib/components/render/OutfitTextureRender.svelte";
  import BaseTextureDialog from "$lib/components/dialog/BaseTextureDialog.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import LinkAccountDialog from "$lib/components/dialog/LinkAccountDialog.svelte";

  const userModel = propertyStore(userSettings, "model");

  let providers: { steve: RenderProvider; alex: RenderProvider };

  let isAuthDialogOpen = false;
  let isBaseTextureDialogOpen = false;
  let authCode = "";
  let profile: any;
  let profilePhoto = "";
  let requireUserInteraction = true;
  let authUrl = "";
  let loading = true;
  onMount(async () => {
    isReadyForData.subscribe(async (v) => {
      if (v.wardrobe) {
        providers = await CreateDefaultRenderProvider($defaultRenderer);
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
  </div>
  <div class="profile-cards">
    <div class="profile-card">
      <SectionTitle label="Profile page" placeholder={loading} />
      {#if !loading}
        <div class="main-data">
          <span class="mc-font">{$currentUser?.name}</span>
        </div>
        <div class="actions">
          <Button href="/profile/{$currentUser?.id}" label="Profile page" />
        </div>
      {/if}
    </div>
    <div class="profile-card">
      <SectionTitle label="Base texture" placeholder={loading} />
      {#if !loading}
        <div>
          <OutfitTextureRender
            renderProvider={$userModel == MODEL_TYPE.ALEX
              ? providers.alex
              : providers.steve}
            texture={GetCurrentBaseTexture($userSettings)}
          />
        </div>
        <div class="actions">
          <Button
            on:click={() => (isBaseTextureDialogOpen = true)}
            label="Edit"
          />
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
            <Button
              type="primary"
              on:click={linkAccount}
              label="Link account"
            />
          {:else}
            <Button
              on:click={() => (isAuthDialogOpen = true)}
              label="Unlink account"
              type="tertiary"
            />
          {/if}
        </div>
      {/if}
    </div>
    <div class="profile-card">
      <SectionTitle label="Logout"></SectionTitle>
      <div class="main-data">
        <span class="icon-big">{@html LoginIcon}</span>
      </div>
      <div class="actions">
        <Button on:click={logout} label="Logout" type="tertiary" />
      </div>
    </div>
  </div>
</div>
<Dialog bind:open={isAuthDialogOpen} label={$_("link_to_mc")}>
  <div class="auth-dialog">
    <LinkAccountDialog
      isAuthorized={!requireUserInteraction}
      {profile}
      {authCode}
      {authUrl}
      on:unlink={unlinkAccount}
    />
  </div>
</Dialog>
<Dialog bind:open={isBaseTextureDialogOpen} label="Base texture">
  <BaseTextureDialog on:setTexture={() => (isBaseTextureDialogOpen = false)} />
</Dialog>

<style lang="scss">
  @import "style.scss";
</style>
