<script lang="ts">
  //main imports
  import { writable, type Writable } from "svelte/store";
  import { onDestroy, onMount } from "svelte";
  //api
  import { GetMinerobeUser } from "$src/api/auth";
  import { FetchSettings } from "$src/api/settings";
  import { GetMergedPackage } from "$src/api/pack";
  //services
  import { ImportImages } from "$src/data/import";
  import { ExportImage } from "$src/data/export";
  import { GetImageFaceArea } from "$src/helpers/image/imageDataHelpers";
  import { ResetUserAvatar, UpdateUser } from "$src/api/user";
  import { ShowToast } from "$src/data/toast";
  //consts
  import { CURRENT_APP_STATE, CURRENT_USER } from "$src/data/static";
  //model
  import type {
    MinerobeUser,
    MinerobeUserSettings,
  } from "$src/data/models/user";
  import { APP_STATE } from "$src/data/enums/app";
  //components
  import Button from "$lib/components/base/Button/Button.svelte";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import TextBox from "$lib/components/base/TextBox/TextBox.svelte";
  //icons
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import DownloadIcon from "$icons/download.svg?raw";
  import AvatarIcon from "$icons/avatar.svg?raw";

  const profileUser: Writable<MinerobeUser> = writable(null);
  const userSettings: Writable<MinerobeUserSettings> = writable(null);

  let stateSub = null;
  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      $profileUser = await GetMinerobeUser($CURRENT_USER.id);
      $userSettings = await FetchSettings();
      inputProfileUsername = $profileUser.name;
      loaded = true;
    });
  });
  onDestroy(() => {
    if (stateSub) stateSub();
  });

  let loaded = false;
  let inputProfileUsername = "";

  const DownloadAvatar = async () => {
    await ExportImage($profileUser.avatar, "avatar.png");
  };
  const UploadAvatar = async () => {
    let image = await ImportImages(false);
    if (image) {
      $profileUser.avatar = image[0].steve.content;
    }
    await UpdateUser($profileUser);
    ShowToast("Avatar uploaded", "success");
  };
  const GenerateAvatarFromCurrentSkin = async () => {
    let mergedTexture = await GetMergedPackage(
      $userSettings?.currentTexture?.packageId,
      false,
      true
    );
    var image = await GetImageFaceArea(
      mergedTexture.layers[0][$userSettings?.currentTexture?.model].content
    );
    $profileUser.avatar = image;
    await UpdateUser($profileUser);
    ShowToast("Avatar generated", "success");
  };
  const UpdateUsername = async () => {
    $profileUser.name = inputProfileUsername;
    await UpdateUser($profileUser);
    ShowToast("Username updated", "success");
  };
  const ResetAvatar = async () => {
    $profileUser = await ResetUserAvatar();
    ShowToast("Avatar reseted", "success");
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
        <div id="profile-avatar-actions-primary">
          <Placeholder
            {loaded}
            height="36px"
            width="100%"
            loadedStyle={"flex:1;"}
          >
            <Button
              icon={ImportPackageIcon}
              label={"Upload"}
              on:click={UploadAvatar}
            />
          </Placeholder>
          <Placeholder
            {loaded}
            height="36px"
            width="100%"
            loadedStyle={"flex:1;"}
          >
            <Button label="Reset" type="tertiary" on:click={ResetAvatar} />
          </Placeholder>
        </div>
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
          <TextBox placeholder="Username" bind:value={inputProfileUsername} />
        </Placeholder>
      </div>
      <div>
        <Placeholder
          {loaded}
          height="36px"
          width="100%"
          loadedStyle={"max-width:412px;"}
        >
          <Button
            label={"Change username"}
            on:click={UpdateUsername}
            disabled={$profileUser.name == inputProfileUsername ||
              inputProfileUsername.length == 0}
          />
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
          disabled={$userSettings?.currentTexture?.packageId==null}
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
