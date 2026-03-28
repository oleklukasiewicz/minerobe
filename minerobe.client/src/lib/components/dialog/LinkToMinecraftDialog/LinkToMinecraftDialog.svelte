<script lang="ts">
  import { run } from 'svelte/legacy';

  //services
  import { ShowToast } from "$src/data/toast";
  import { GetImageFaceArea } from "$src/helpers/image/imageDataHelpers";
  //models
  import type {
    MinecraftAccount,
    MinecraftSkin,
  } from "$src/data/models/integration/minecraft";
  //components
  import Label from "$lib/components/base/Label/Label.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import Dialog from "$lib/components/base/Dialog/Dialog.svelte";
  //icons
  import ArticleMultipleIcon from "$icons/article-multiple.svg?raw";

  interface Props {
    open?: boolean;
    authUrl?: string;
    authCode?: string;
    authStatus?: string;
    profile?: MinecraftAccount;
    skin?: MinecraftSkin;
    onclose?: (event?: any) => void;
  }

  let {
    open = $bindable(false),
    authUrl = "",
    authCode = "",
    authStatus = "",
    profile = null,
    skin = null,
    onclose = null
  }: Props = $props();

  let linkButtonLabel = $state("Link");
  let isLinkingButtonDisabled = $state(false);

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

  run(() => {
    GetLinkButtonLabel(authStatus);
  });
</script>

<Dialog {open} label="Link to Minecraft" {onclose}>
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
          onclick={CopyCode}
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
              <!-- svelte-ignore a11y_missing_attribute -->
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
