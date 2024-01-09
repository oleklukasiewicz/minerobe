<script lang="ts">
  import Label from "$lib/Label/Label.svelte";
  import { createEventDispatcher } from "svelte";


  const dispatch = createEventDispatcher();
  
  export let isAuthorized: boolean = false;
  export let profile: any = null;
  export let authUrl: string = "";
  export let authCode: string = "";

  const unlink=function()
  {
    dispatch("unlink");
  }
  const link=function()
  {
    dispatch("link");
  }
</script>

<div class="mc-auth">
  {#if isAuthorized}
    <br />
    <span>Your are linked to account</span>
    <br />
    <div><Label variant="unique">{profile.name}</Label></div>
    <br />
    <button class="secondary"on:click={unlink} >Unlink account</button>
  {:else}
    <br />
    <span>Copy code and click <b>link account</b> button</span>
    <br />
    <b class="code mc-font">{authCode}</b>
    <br />
    <b>Refresh page after signing in</b>
    <br />
    <a href={authUrl} target="_blank"><button on:click={link}>Link account</button></a>
  {/if}
</div>

<style lang="scss">
  @import "MinecraftAuth.scss";
</style>
