<script lang="ts">
  import Label from "$component/base/Label/Label.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import { GetFaceOfRemoteSkin } from "$src/helpers/image/imageDataHelpers";
  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher();

  export let isAuthorized: boolean = false;
  export let profile: any = null;
  export let authUrl: string = "";
  export let authCode: string = "";
  let linkText = "Link account";

  let profilePhoto = "";
  const loadPhoto = async (prof) => {
    if (!profile) return;
    let skinUrl = profile.skins.find((s) => s.state == "ACTIVE").url;
    skinUrl = skinUrl.replace("http://", "https://");
    profilePhoto = await GetFaceOfRemoteSkin(skinUrl);
  };

  $: loadPhoto(profile);

  const unlink = function () {
    linkText = "Unlinking...";
    dispatch("unlink");
  };
  const link = function () {
    linkText = "Linking...";
    dispatch("link");
  };
</script>

<div class="mc-auth">
  {#if isAuthorized}
    <br />
    <span class="mc-font" style="font-size: var(--size-font-title);"
      >You are linked to</span
    >
    <br />
    <!-- svelte-ignore a11y-missing-attribute -->
    <div><img src={profilePhoto} style="min-width: calc(25%);" /></div>
    <br />
    <div><Label variant="unique">{profile.name}</Label></div>
    <br />
    <br />
    <Button on:click={unlink} label="Unlink account" />
  {:else}
    <br />
    <span class="mc-font-simple" style="font-size: var(--size-font-caption);"
      >Copy code and click <b>link account</b> button</span
    >
    <br />
    <b class="code mc-font">{authCode}</b>
    <br />
    <Button
      type="primary"
      on:click={link}
      label={linkText}
      href={authUrl}
    />
  {/if}
</div>

<style lang="scss">
  .mc-auth {
    text-align: center;
    display: flex;
    flex-direction: column;
    min-width: 30vw;
    .code {
      background-color: var(--color-theme-D1);
      padding: 12px 10px;
      box-sizing: border-box;
    }
  }
</style>
