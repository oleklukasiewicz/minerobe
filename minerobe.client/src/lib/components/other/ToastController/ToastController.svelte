<script lang="ts">
  import Toast from "$lib/components/base/Toast/Toast.svelte";
  import { hideToast, isMobileView } from "$src/data/cache";

    export let items = [];
</script>
<div>
{#each items as toast }
    <Toast
      message={toast.message}
      icon={toast.icon}
      mobile={$isMobileView}
      show={true}
      closeable={toast.closeable}
      type={toast.type}
      on:click={toast.action}
      on:close={() => hideToast(toast)}/>
{/each}
</div>