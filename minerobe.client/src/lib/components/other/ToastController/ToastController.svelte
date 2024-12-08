<script lang="ts">
  import Toast from "$lib/components/base/Toast/Toast.svelte";
  import { IS_MOBILE_VIEW } from "$src/data/static";
  import { HideToast } from "$src/data/toast";

  export let items = [];
</script>

<div>
  {#each items as toast}
    <Toast
      message={toast.message}
      icon={toast.icon}
      mobile={$IS_MOBILE_VIEW}
      show={true}
      closeable={toast.closeable}
      type={toast.type}
      on:click={toast.action}
      on:close={() => HideToast(toast)}
    />
  {/each}
</div>
