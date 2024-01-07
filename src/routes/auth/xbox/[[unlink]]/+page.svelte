<script lang="ts">
  export let data: any;
</script>

<div>
  {#if data.requireUserInteraction}
    <div class="verify">
      <span
        >To link your minecraft account click button below an enter code:</span
      >
      <br />
      <b class="auth-code">{data?.params?.userCode}</b>
      <a href={data?.params?.verificationUri} target="_blank">
        <button>Link to xbox</button></a
      >
    </div>
  {:else}
    <div class="already-linked">
      <span>Your account is already linked to xbox account with name</span>
      <span><b class="label unique">{data?.token?.profile?.name}</b></span>
    </div>
  {/if}
</div>

<style lang="scss">
  @import "style.scss";
</style>
