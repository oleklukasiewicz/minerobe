<script lang="ts">
  import { currentUser, isReadyForData } from "$src/data/cache";
  import { FetchWithTokenAuth } from "$src/data/firebase";
  import { onMount } from "svelte";
  import { get } from "svelte/store";

  export let data: any;
  let requireUserInteraction = false;

  onMount(async () => {
    isReadyForData.subscribe(async (ready) => {
      console.log(ready, data);
      if (ready.fullReadyness && ready.user != null) {
        let resp;
        if (data.path.unlink === "unlink") {
          resp = await FetchWithTokenAuth(
            "/api/internal/unlink/" + $currentUser.id,
            "GET"
          );
        } else {
          resp = await FetchWithTokenAuth(
            "/api/internal/link/" + $currentUser.id,
            "GET"
          );
        }
        const datar = await resp.json();
        requireUserInteraction = data.path.unlink !== "unlink";
        Object.assign(data, {
          requireUserInteraction: data.path.unlink !== "unlink",
          params: {
            userCode: datar.params.userCode,
            verificationUri: datar.params.verificationUri,
          },
          token: {
            profile: datar?.token?.profile,
          },
        });
      }
    });
  });
</script>

<div>
  {#if requireUserInteraction == true}
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
