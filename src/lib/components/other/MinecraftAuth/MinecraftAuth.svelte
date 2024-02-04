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
    <span>Your are linked to account</span>
    <br />
    <div><Label variant="unique">{profile.name}</Label></div>
    <br />
    <Button on:click={unlink} label="Unlink account" />
  {:else}
    <br />
    <span>Copy code and click <b>link account</b> button</span>
    <br />
    <b class="code mc-font">{authCode}</b>
    <br />
    <b>Refresh page after signing in (linking may take some time)</b>
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
  @import "MinecraftAuth.scss";
</style>
