<script lang="ts">
  import { CURRENT_APP_STATE, CURRENT_USER } from "$src/data/static";
  import { onDestroy, onMount } from "svelte";
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
  import { GetImageFaceArea } from "$src/helpers/image/imageDataHelpers";
  import Label from "$lib/components/base/Label/Label.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";

  const profileUser: Writable<MinerobeUserProfile> = writable(null);
  const minecraftIntegration: Writable<any> = writable(null);

  let stateSub = null;
  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;

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
  onDestroy(() => {
    if (stateSub) stateSub();
  });

  let currentCape: Cape = new Cape();
  let loaded = false;
</script>

<div id="profile-overview">
  <div id="overview-header">
    <!-- svelte-ignore a11y-missing-attribute -->
    <Placeholder
      {loaded}
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
      <Button
        slot="actions"
        href={"/profile/skin"}
        label={"Edit current skin"}
      />
    </StatusCard>
    <!-- Base texture card-->
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
      <Button
        slot="actions"
        label={"Change base texture"}
        href="/profile/base"
      />
    </StatusCard>
    <!-- Minecraft account card-->
    <StatusCard label={"minecraft account"}>
      <Placeholder {loaded} height="100%" width="100%">
        {#await GetImageFaceArea($profileUser?.settings?.currentTexture?.texture) then skin}
          <!-- svelte-ignore a11y-missing-attribute -->
          <img src={skin} style="width:100%;image-rendering: pixelated; " />
        {/await}
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
            <CapeListItem item={currentCape} readonly />
            <br />
            <br />
            <div class="mc-font">{currentCape.name || "No Cape"}</div>
          </div>
        </Placeholder>
        <Button
          slot="actions"
          label={"Change cape"}
          href="/profile/minecraft"
        />
      </StatusCard>
    {/if}
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
