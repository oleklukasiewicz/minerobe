<script lang="ts">
  import Label from "$component/base/Label/Label.svelte";
  import ArticleMultipleIcon from "$icons/article-multiple.svg?raw";
  import Button from "$lib/components/base/Button/Button.svelte";
  import { showToast } from "$src/data/cache";
  import { GetImageArea } from "$src/helpers/image/imageDataHelpers";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let profile: any = null;
  export let authUrl: string = "";
  export let authCode: string = "";
  export let linkText = "Link account";
  export let unLinkText = "Unlink account";

  const unlink = function () {
    unLinkText = "Unlinking...";
    dispatch("unlink");
  };
  const copyText = async function (text) {
    await navigator.clipboard.writeText(text);
    showToast("Code copied to clipboard");
  };
  const link = function () {
    dispatch("link");
  };
</script>

<div class="mc-auth">
  {#if profile.id != null}
    <br />
    <span class="mc-font" style="font-size: var(--size-font-title);"
      >You are linked to</span
    >
    <br />
    <!-- svelte-ignore a11y-missing-attribute -->
    <div>
      {#await GetImageArea(profile.skin?.texture, 8, 8, 8, 8) then texture}
        <img
          src={texture}
          style="min-width: calc(25%);image-rendering: pixelated;"
        />
      {/await}
    </div>
    <br />
    <div><Label variant="unique">{profile.username}</Label></div>
    <br />
    <br />
    <Button on:click={unlink} label={unLinkText} />
  {:else}
    <br />
    <span class="mc-font-simple" style="font-size: var(--size-font-caption);"
      >Copy code and click <b>link account</b> button</span
    >
    <br />
    <b class="code mc-font">{authCode}</b><Button
      type="tertiary"
      label="Copy code"
      on:click={() => copyText(authCode)}
      icon={ArticleMultipleIcon}
    />
    <br />
    <Button type="primary" on:click={link} label={linkText} href={authUrl} />
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
      padding: 10px 10px;
      margin-bottom: 4px;
      box-sizing: border-box;
    }
  }
</style>
