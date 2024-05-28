<script lang="ts">
  import { _ } from "svelte-i18n";
  import SectionTitle from "$component/base/SectionTitle/SectionTitle.svelte";
  import {
    appState,
    currentUser,
    defaultRenderer,
    isMobileView,
    isReadyForData,
    userSettings,
  } from "$src/data/cache";
  import { APP_STATE, MODEL_TYPE } from "$src/data/consts";
  import {
    CreateDefaultRenderProvider,
    RenderProvider,
  } from "$src/data/render";
  import { onMount } from "svelte";
  import { propertyStore } from "svelte-writable-derived";
  import { logoutUser } from "$src/api/auth";
  import {
    navigate,
    navigateToHome,
  } from "$src/helpers/other/navigationHelper";
  import SocialInfo from "$component/social/SocialInfo/SocialInfo.svelte";
  import Placeholder from "$component/base/Placeholder/Placeholder.svelte";
  import Dialog from "$component/base/Dialog/Dialog.svelte";
  import AvatarIcon from "$src/icons/avatar.svg?raw";
  import LoginIcon from "$src/icons/login.svg?raw";
  import { GetCurrentBaseTexture } from "$src/helpers/image/imageDataHelpers";
  import OutfitTextureRender from "$lib/components/render/OutfitTextureRender.svelte";
  import BaseTextureDialog from "$lib/components/dialog/BaseTextureDialog.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import LinkAccountDialog from "$lib/components/dialog/LinkAccountDialog.svelte";
  import { GetUserProfile } from "$src/api/user";
  import { writable, type Writable } from "svelte/store";
  import { MinerobeUserProfile } from "$src/data/common";

  const userProfile: Writable<MinerobeUserProfile> = writable(
    new MinerobeUserProfile()
  );

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
    appState.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      var profile = await GetUserProfile($currentUser?.id);
      userProfile.set(profile);
      console.log(profile);
      loading = false;
    });
  });
  const logout = async () => {
    navigateToHome();
    await logoutUser();
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
      <Placeholder loaded={!loading}  style="height:28px;margin-bottom:16px;min-width:100px">
        <SocialInfo data={$userProfile.social} /></Placeholder
      >
    </div>
  </div>
  <div class="profile-cards">
    <div class="profile-card">
      <SectionTitle label="Current skin" placeholder={loading} />
      {#if $userSettings?.currentSkin != null && !loading}
        <div>
          <OutfitTextureRender
            renderProvider={$userSettings?.currentSkin?.model == MODEL_TYPE.ALEX
              ? providers.alex
              : providers.steve}
            texture={$userSettings?.currentSkin?.texture}
          />
        </div>
        <div class="actions">
          <Button
            on:click={() =>
              navigate("/design/outfit_set/" + $userSettings?.currentSkin?.id)}
            label="See in design"
          />
        </div>
      {/if}
    </div>
    <div class="profile-card">
      <SectionTitle label="Base texture" placeholder={loading} />
      {#if !loading}
        <div>
          <!-- <OutfitTextureRender
            renderProvider={$userModel == MODEL_TYPE.ALEX
              ? providers.alex
              : providers.steve}
            texture={GetCurrentBaseTexture($userSettings)}
          /> -->
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
            <!-- <Button
              type="primary"
              on:click={linkAccount}
              label="Link account"
            /> -->
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
  <BaseTextureDialog on:setTexture={() => (isBaseTextureDialogOpen = false)} />
</Dialog>

<style lang="scss">
  @import "style.scss";
</style>
