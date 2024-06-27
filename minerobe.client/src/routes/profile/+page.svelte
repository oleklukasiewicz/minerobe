<script lang="ts">
  import { _ } from "svelte-i18n";
  import SectionTitle from "$component/base/SectionTitle/SectionTitle.svelte";
  import {
    appState,
    currentUser,
    isMobileView,
    defaultRenderer,
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
  import OutfitPackageSnapshotRender from "$component/render/OutfitPackageSnapshotRender.svelte";
  import LoginIcon from "$src/icons/login.svg?raw";
  import BaseTextureDialog from "$lib/components/dialog/BaseTextureDialog.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import { GetUserProfile } from "$src/api/user";
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

  const userProfile: Writable<MinerobeUserProfile> = writable(
    new MinerobeUserProfile()
  );
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
      loading = false;
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
        style="height:46px;margin-bottom:16px;min-width:200px"
        ><h1>{$userProfile?.user?.name}</h1></Placeholder
      >
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
          <!-- {#if $userSettings?.linkedAccount?.name != null}
            <img src={profilePhoto} style="min-width: calc(100% - 80px);" />
            <span class="mc-font">{$userSettings.linkedAccount.name}</span>
          {:else}
            <span class="icon-big">{@html AvatarIcon}</span>
            <span class="mc-font">Not linked</span>
          {/if} -->
        </div>
        <div class="actions">
          <!-- {#if $userSettings?.linkedAccount?.name == null}
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
          {/if} -->
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
    <!-- <LinkAccountDialog
      isAuthorized={!requireUserInteraction}
      {profile}
      {authCode}
      {authUrl}
      on:unlink={unlinkAccount}
    /> -->
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
