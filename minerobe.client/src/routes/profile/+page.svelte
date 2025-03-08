<script lang="ts">
  //main imports
  import { onDestroy, onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  //api
  import { GetUserProfile } from "$src/api/user";
  import { GetAccount, GetCurrentSkin } from "$src/api/integration/minecraft";
  import { GetMergedPackage } from "$src/api/pack";
  //services
  import { GetImageFaceArea } from "$src/helpers/image/imageDataHelpers";
  //consts
  import { CURRENT_APP_STATE, CURRENT_USER } from "$src/data/static";
  //models
  import type { MinerobeUserProfile } from "$src/data/models/user";
  import { APP_STATE } from "$src/data/enums/app";
  import {
    Cape,
    MinecraftAccount,
    MinecraftSkin,
  } from "$src/data/models/integration/minecraft";
  import { OUTFIT_TYPE } from "$src/data/enums/outfit";
  import type { OutfitPackage } from "$src/data/models/package";
  //components
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import SocialInfo from "$lib/components/social/SocialInfo.svelte";
  import StatusCard from "$lib/components/other/StatusCard/StatusCard.svelte";
  import CapeListItem from "$lib/components/outfit/CapeListItem/CapeListItem.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import Label from "$lib/components/base/Label/Label.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import { IsEmptyGuid } from "$src/helpers/data/dataHelper";
  //icons

  const profileUser: Writable<MinerobeUserProfile> = writable(null);
  const minecraftIntegration: Writable<MinecraftAccount> = writable(null);

  let stateSub = null;
  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;

      $profileUser = await GetUserProfile($CURRENT_USER.id);
      if (
        $profileUser.settings.currentTexture != null &&
        !IsEmptyGuid($profileUser.settings.currentTexture.packageId)
      ) {
        currentTexture = await GetMergedPackage(
          $profileUser.settings.currentTexture.packageId,
          $profileUser.settings.currentTexture.isFlatten,
          true
        );
      }
      if ($profileUser.settings.integrations.includes("minecraft")) {
        $minecraftIntegration = await GetAccount(false);
        currentMinecraftSkin = await GetCurrentSkin(false);
        if ($profileUser.settings.currentTexture?.capeId != null) {
          currentCape = $minecraftIntegration.capes.find(
            (x) => x.id == $profileUser.settings.currentTexture?.capeId
          );
        }
      }
      if ($profileUser.settings.currentTexture) loaded = true;
    });
  });
  onDestroy(() => {
    if (stateSub) stateSub();
  });

  let currentCape: Cape = new Cape();
  let currentTexture: OutfitPackage;
  let currentMinecraftSkin: MinecraftSkin = null;
  let loaded = false;
</script>

<div id="profile-overview">
  <div id="overview-header">
    <!-- svelte-ignore a11y-missing-attribute -->
    <Placeholder
      loaded={$profileUser != null}
      width="96px"
      height="96px"
      aspectRatio="1"
      loadedStyle={"height:96px"}
    >
      <img id="profile-avatar" src={$profileUser.user.avatar} /></Placeholder
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
    <!-- Current skin card-->
    <StatusCard label={"current skin"}>
      <Placeholder
        {loaded}
        height="100%"
        width="100%"
        loadedStyle="width:100%;"
      >
        {#if $profileUser?.settings?.currentTexture?.packageId != null}
          <div style="width: 100%;">
            <OutfitPackageRender
              source={currentTexture}
              model={$profileUser?.settings.currentTexture.model}
              outfitType={OUTFIT_TYPE.DEFAULT}
            />
          </div>
        {:else}
          <div class="mc-font">No skin setted</div>
        {/if}
      </Placeholder>
      <Button
        slot="actions"
        href={"/profile/skin"}
        label={"Edit current skin"}
      />
    </StatusCard>
    <!-- Base texture card-->
    <StatusCard label={"base texture"}>
      <Placeholder
        loaded={$profileUser?.settings != null || loaded}
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
          <div class="mc-font font-center">No texture</div>
        {/if}
      </Placeholder>
      <Button
        slot="actions"
        label={"Change base texture"}
        href="/profile/base"
      />
    </StatusCard>
    <!-- Cape card-->
    {#if currentCape != null}
      <StatusCard label={"cape"}>
        <Placeholder
          {loaded}
          height="100%"
          width="100%"
          loadedStyle="width:100%;"
        >
          <div class="font-center">
            <div id="cape-item">
              <CapeListItem item={currentCape} readonly autoSize />
              <div class="mc-font">{currentCape.name || "No Cape"}</div>
            </div>
          </div>
        </Placeholder>
        <Button slot="actions" label={"Change cape"} href="/profile/skin" />
      </StatusCard>
    {/if}
    <!-- Minecraft account card-->
    <StatusCard label={"minecraft account"}>
      <Placeholder {loaded} height="100%" width="100%">
        {#if currentMinecraftSkin?.texture != null}
          {#await GetImageFaceArea(currentMinecraftSkin?.texture) then skin}
            <!-- svelte-ignore a11y-missing-attribute -->
            <img src={skin} style="width:100%;image-rendering: pixelated; " />
          {/await}
        {/if}
        <br />
        <br />
        {#if $minecraftIntegration != null}
          <Label variant="unique" text={$minecraftIntegration.username} />
        {:else}
          <div class="mc-font">No account linked</div>
        {/if}
      </Placeholder>
      <Button
        slot="actions"
        label={"manage account"}
        href="/profile/minecraft"
      />
    </StatusCard>
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
