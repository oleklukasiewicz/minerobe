<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import TextBox from "$lib/components/base/TextBox/TextBox.svelte";
  import { GetMinerobeUser } from "$src/api/auth";
  import { APP_STATE } from "$src/data/enums/app";
  import type { MinerobeUser } from "$src/data/models/user";
  import { CURRENT_APP_STATE, CURRENT_USER } from "$src/data/static";
  import { onDestroy, onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import DownloadIcon from "$icons/download.svg?raw";
  import { ExportImage } from "$src/data/export";
  import { ImportImages } from "$src/data/import";
  import AvatarIcon from "$icons/avatar.svg?raw";
  import { FetchSettings } from "$src/api/settings";
  import { GetImageFaceArea } from "$src/helpers/image/imageDataHelpers";

  const profileUser: Writable<MinerobeUser> = writable(null);

  let stateSub = null;
  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      $profileUser = await GetMinerobeUser($CURRENT_USER.id);
      loaded = true;
    });
  });
  onDestroy(() => {
    stateSub();
  });

  let loaded = false;

  const DownloadAvatar = async () => {
    await ExportImage($profileUser.avatar, "avatar.png");
  };
  const UploadAvatar = async () => {
    let image = await ImportImages(false);
    if (image) {
      $profileUser.avatar = image[0].steve.content;
    }
  };
  const GenerateAvatarFromCurrentSkin = async () => {
    let settings = await FetchSettings();
    const basetexture = settings.baseTexture;
    var image = await GetImageFaceArea(
      basetexture.layers[0][basetexture.model].content
    );
    $profileUser.avatar = image;
  };
</script>

<div id="profile-info">
  <div>
    <SectionTitle label={"Avatar"} placeholder={!loaded} />
    <div id="profile-avatar-section">
      <Placeholder {loaded} aspectRatio="1" height="96px" width="96px">
        <img src={$profileUser.avatar} id="profile-avatar" alt="avatar" />
      </Placeholder>
      <div id="profile-avatar-actions">
        <Placeholder {loaded} height="36px" width="100%">
          <Button
            icon={ImportPackageIcon}
            label={"Upload"}
            on:click={UploadAvatar}
          />
        </Placeholder>
        <Placeholder {loaded} height="36px" width="100%">
          <Button
            icon={DownloadIcon}
            type={"secondary"}
            label={"Download"}
            on:click={DownloadAvatar}
          />
        </Placeholder>
      </div>
    </div>
  </div>
  <div>
    <SectionTitle label={"Name"} placeholder={!loaded} />
    <div id="profile-name">
      <div id="profile-name-input">
        <Placeholder {loaded}>
          <TextBox placeholder="Username" bind:value={$profileUser.name} />
        </Placeholder>
      </div>
      <div>
        <Placeholder
          {loaded}
          height="36px"
          width="100%"
          loadedStyle={"max-width:412px;"}
        >
          <Button label={"Change username"} />
        </Placeholder>
      </div>
    </div>
  </div>
  <div>
    <SectionTitle label={"Avatar from skin"} placeholder={!loaded} />
    <div id="profile-avatar-skin">
      <Placeholder {loaded} height="36px" width="100%" loadedStyle={"flex:1;"}>
        <Button
          icon={AvatarIcon}
          label={"Generate from current skin"}
          on:click={GenerateAvatarFromCurrentSkin}
        />
      </Placeholder>
      <Placeholder {loaded} height="30px" width="100%">
        <Checkbox
          label="Auto generate from current skin"
          style="margin-top:6px;"
        />
      </Placeholder>
    </div>
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
