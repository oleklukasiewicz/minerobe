<script lang="ts">
  //services
  import { HideToast } from "$src/data/toast";
  //consts
  import { IS_MOBILE_VIEW } from "$src/data/static";
  //components
  import Toast from "$lib/components/base/Toast/Toast.svelte";

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
