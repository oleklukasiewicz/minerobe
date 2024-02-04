<script lang="ts">
  import Label from "$component/base/Label/Label.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let isAuthorized: boolean = false;
  export let profile: any = null;
  export let authUrl: string = "";
  export let authCode: string = "";

  const unlink = function () {
    dispatch("unlink");
  };
  const link = function () {
    dispatch("link");
  };
</script>

<div class="mc-auth">
  {#if isAuthorized}
    <br />
    <span class="mc-font-simple" style="font-size: var(--size-font-caption);">Your are linked to account</span>
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
    <span class="mc-font-simple" style="font-size: var(--size-font-caption);"
      >Refresh page after signing in <br/> (linking may take some time)</span
    >
    <br />
    <Button
      type="primary"
      on:click={link}
      label="Link account"
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
