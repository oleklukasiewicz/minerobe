<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import Dialog from "$lib/components/base/Dialog/Dialog.svelte";
  import type {
    MinecraftAccount,
    MinecraftSkin,
  } from "$src/data/models/integration/minecraft";
  import ArticleMultipleIcon from "$icons/article-multiple.svg?raw";
  import { ShowToast } from "$src/data/toast";
  import Label from "$lib/components/base/Label/Label.svelte";
  import { GetImageFaceArea } from "$src/helpers/image/imageDataHelpers";

  export let open = false;
  export let authUrl = "";
  export let authCode = "";
  export let authStatus = "";
  export let profile: MinecraftAccount = null;
  export let skin: MinecraftSkin = null;

  let linkButtonLabel = "Link";
  let isLinkingButtonDisabled = false;

  const GetLinkButtonLabel = function (status) {
    switch (authStatus) {
      case "ConnectingToMs":
        linkButtonLabel = "Connecting to Microsoft";
        isLinkingButtonDisabled = true;
        break;
      case "AwaitingUserInput":
        linkButtonLabel = "Link account";
        isLinkingButtonDisabled = false;
        break;
      case "ConnectingToXbox":
        linkButtonLabel = "Linking...";
        isLinkingButtonDisabled = true;
        break;
      case "ConnectingToMojang":
        linkButtonLabel = "Downloading profile...";
        isLinkingButtonDisabled = true;
        break;
      case "Success":
        linkButtonLabel = "Almost done";
        isLinkingButtonDisabled = true;
        break;
      case "Ready":
        linkButtonLabel = "Linked";
        isLinkingButtonDisabled = true;
    }
  };
  const CopyCode = function () {
    navigator.clipboard.writeText(authCode);
    ShowToast("Code copied to clipboard");
  };

  $: GetLinkButtonLabel(authStatus);
</script>

<Dialog {open} label="Link to Minecraft" on:close>
  <div id="link-to-mc-dialog">
    {#if authStatus != "Ready"}
      <div class="description">
        <b>Copy code</b> and click <b>link account</b> button to link your Minecraft
        account.
      </div>
      <div class="auth-code">{authCode}</div>
      <div>
        <Button
          label={"Copy code"}
          type="tertiary"
          icon={ArticleMultipleIcon}
          on:click={CopyCode}
        />
      </div>
      <div>
        <Button
          label={linkButtonLabel}
          href={authUrl}
          target="_blank"
          disabled={isLinkingButtonDisabled}
        />
      </div>
    {:else}
      <div class="description-ready">
        <h3>You are linked to</h3>
        <div>
          {#if skin?.texture != null}
            {#await GetImageFaceArea(skin?.texture) then skin}
              <!-- svelte-ignore a11y-missing-attribute -->
              <img src={skin} style="width:100%;image-rendering: pixelated; " />
            {/await}
          {/if}
        </div>
        <div>
          <Label variant={"unique"} text={profile?.username} />
        </div>
      </div>
    {/if}
  </div>
</Dialog>

<style lang="scss">
  #link-to-mc-dialog {
    max-width: 400px;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    .description {
      font-family: minecraft-simple;
      font-size: var(--size-font-base);
      width: 75%;
      margin: auto;
      text-align: center;
    }
    .auth-code {
      font-family: minecraft;
      font-size: var(--size-font-base);
      background-color: var(--color-theme-D1);
      padding: 4px 8px;
      box-sizing: border-box;
      text-align: center;
    }
    .description-ready {
      font-family: minecraft;
      min-width: 300px;
      max-width: 90vw;
      font-size: var(--size-font-base);
      margin: auto;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 8px;
      img {
        aspect-ratio: 1;
        max-width: 92px;
      }
    }
  }
</style>
