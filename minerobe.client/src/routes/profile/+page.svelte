<script lang="ts">
  import { _ } from "svelte-i18n";
  import SectionTitle from "$component/base/SectionTitle/SectionTitle.svelte";
  import {
    appState,
    currentUser,
    isMobileView,
    defaultRenderer,
    serverWsConnection,
    showToast,
  } from "$src/data/cache";
  import { APP_STATE, MODEL_TYPE } from "$src/data/consts";
  import { onMount } from "svelte";
  import { logoutUser } from "$src/api/auth";
  import {
    navigate,
    navigateToHome,
  } from "$src/helpers/other/navigationHelper";
  import SocialInfo from "$component/social/SocialInfo/SocialInfo.svelte";
  import Placeholder from "$component/base/Placeholder/Placeholder.svelte";
  import Dialog from "$component/base/Dialog/Dialog.svelte";
  import LoginIcon from "$src/icons/login.svg?raw";
  import BaseTextureDialog from "$lib/components/dialog/BaseTextureDialog.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import { GetUserProfile, UpdateUserProfile } from "$src/api/user";
  import {
    derived,
    writable,
    type Readable,
    type Writable,
  } from "svelte/store";
  import { UpdateBaseTexture } from "$src/api/settings";
  import OutfitTextureRender from "$component/render/OutfitTextureRender.svelte";
  import {
    CreateDefaultRenderProvider,
    type RenderProvider,
  } from "$src/data/render";
  import { CurrentTexture, MinerobeUserProfile } from "$src/model/user";
  import type { OutfitPackage } from "$src/model/package";
  import LinkAccountDialog from "$lib/components/dialog/LinkAccountDialog.svelte";
  import {
    GetFullAccount,
    LinkAccount,
    UnLinkAccount,
  } from "$src/api/integration/minecraft";
  import { GetImageArea } from "$src/helpers/image/imageDataHelpers";

  const userProfile: Writable<MinerobeUserProfile> = writable(
    new MinerobeUserProfile()
  );
  const minecraftAccount = writable(null);

  const baseTexture: Readable<OutfitPackage> = derived(
    userProfile,
    ($userProfile) => $userProfile?.settings?.baseTexture
  );
  const currentTexture: Readable<CurrentTexture> = derived(
    userProfile,
    ($userProfile) => {
      return $userProfile?.settings?.currentTexture;
    }
  );

  let providers: { steve: RenderProvider; alex: RenderProvider };

  let isAuthDialogOpen = false;
  let isBaseTextureDialogOpen = false;
  let loading = true;
  onMount(async () => {
    appState.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      if (!loading) return;
      providers = await CreateDefaultRenderProvider($defaultRenderer);
      var profile = await GetUserProfile($currentUser?.id);
      userProfile.set(profile);
      if (profile.settings?.integrations?.includes("minecraft")) {
        var account = await GetFullAccount(false);
        minecraftAccount.set(account);
      }

      loading = false;
      userProfile.subscribe(async (p) => {
        if (p.user == null) return;
        await UpdateUserProfile(p.user);
      });
    });
  });
  const logout = async () => {
    navigateToHome();
    await logoutUser();
  };
  const updateBaseTexture = async (event) => {
    userProfile.update((p) => {
      p.settings.baseTexture = event.detail;
      return p;
    });
    const texture = event.detail;
    await UpdateBaseTexture(texture);
    isBaseTextureDialogOpen = false;
  };
  const unLink = async () => {
    await UnLinkAccount();
    minecraftAccount.set({});
    isAuthDialogOpen = false;
    cancelLinking();
  };

  let authUrl = null,
    authCode = null,
    linkText = "Link account",
    unLinkText = "Unlink account";

  let abortLinking = new AbortController();
  const linkAccount = async () => {
    if (authUrl == null || authCode == null) return;
    linkText = "Linking...";
    window.open(authUrl, "_blank");
  };
  const cancelLinking = () => {
    abortLinking.abort();
    isAuthDialogOpen = false;
  };
  const startMcLinkFlow = async () => {
    cancelLinking();
    abortLinking = new AbortController();
    $serverWsConnection.on("linkToMc", (data) => {
      const currentStatus = data.status;
      if (currentStatus === "ConnectingToMs") linkText = "Getting code...";
      if (currentStatus === "AwaitingUserInput") linkText = "Link account";
      if (
        currentStatus === "ConnectingToXbox" ||
        currentStatus === "ConnectingToMojang"
      )
        linkText = "Getting data...";

      if (!data.isSuccess)
        showToast("Failed to link account", undefined, "error");

      if (currentStatus !== "AwaitingUserInput") return;
      authUrl = data.data.verificationUrl;
      authCode = data.data.userCode;
      isAuthDialogOpen = true;
    });
    var profile = await LinkAccount(abortLinking);
    showToast("Success", undefined, "success");
    minecraftAccount.set(profile);
    isAuthDialogOpen = false;
    linkText = "Link account";
  };
</script>

<div id="profile-view" class:mobile={$isMobileView}>
  <div class="header-area">
    <div class="header-image">
      <!-- svelte-ignore a11y-missing-attribute -->
      <Placeholder loaded={!loading}
        ><img src={$userProfile?.user?.avatar} /></Placeholder
      >
    </div>
    <div class="header-name">
      <SectionTitle label="Profile" placeholder={loading} />
      <Placeholder
        loaded={!loading}
        style="height:46px;margin-bottom:16px;min-width:200px;"
      >
        <input class="title-input" bind:value={$userProfile.user.name} />
      </Placeholder>
      <Placeholder
        loaded={!loading}
        style="height:28px;margin-bottom:16px;min-width:100px"
      >
        <SocialInfo data={$userProfile.social} /></Placeholder
      >
    </div>
  </div>
  <div class="profile-cards">
    <div class="profile-card">
      <SectionTitle label="Current skin" placeholder={loading} />
      {#if $userProfile?.settings?.currentTexture != null && !loading}
        <div style="flex:1;">
          <div style="aspect-ratio: 1/1;">
            <OutfitTextureRender
              renderProvider={$currentTexture.model == MODEL_TYPE.ALEX
                ? providers.alex
                : providers.steve}
              texture={$currentTexture.texture}
              modelName={$currentTexture.model}
            />
          </div>
        </div>
        <div class="actions">
          <Button
            on:click={() =>
              navigate(
                "/design/" +
                  $userProfile.settings.currentTexturePackageId +
                  "?model=" +
                  $currentTexture.model +
                  "&flat=" +
                  $currentTexture.isFlat
              )}
            label="See in design"
          />
        </div>
      {/if}
    </div>
    <div class="profile-card">
      <SectionTitle label="Base texture" placeholder={loading} />
      <div>
        {#if !loading && $baseTexture != null && $baseTexture.layers.length > 0}
          <OutfitTextureRender
            renderProvider={$baseTexture?.model == MODEL_TYPE.ALEX
              ? providers.alex
              : providers.steve}
            texture={$baseTexture?.layers[0][$baseTexture?.model].content}
          />
        {/if}
      </div>
      {#if !loading}
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

          {#if $minecraftAccount?.skin != null}
            {#await GetImageArea($minecraftAccount?.skin?.texture, 8, 8, 8, 8) then texture}
              <img
                src={texture}
                style="min-width: calc(100% - 80px); image-rendering: pixelated;"
              />
            {/await}
            <span class="mc-font">{$minecraftAccount.username}</span>
          {:else}
            <!-- <span class="icon-big">{@html AvatarIcon}</span> -->
            <span class="mc-font">Not linked</span>
          {/if}
        </div>
        <div class="actions">
          {#if $minecraftAccount?.id == null}
            <Button
              type="primary"
              on:click={startMcLinkFlow}
              label={linkText}
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
<Dialog
  bind:open={isAuthDialogOpen}
  label={$_("link_to_mc")}
  on:close={cancelLinking}
>
  <div class="auth-dialog">
    <LinkAccountDialog
      profile={$minecraftAccount}
      on:unlink={unLink}
      on:link={linkAccount}
      {linkText}
      {authCode}
      {authUrl}
    />
  </div>
</Dialog>
<Dialog bind:open={isBaseTextureDialogOpen} label="Base texture">
  <BaseTextureDialog
    on:setTexture={updateBaseTexture}
    baseTexture={$userProfile.settings.baseTexture}
  />
</Dialog>

<style lang="scss">
  @import "style.scss";
</style>
