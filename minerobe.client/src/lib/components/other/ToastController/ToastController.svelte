<script lang="ts">
  //services
  import { HideToast } from "$src/data/toast";

  //consts
  import { IS_MOBILE_VIEW } from "$src/data/static";

  //components
  import Toast from "$lib/components/base/Toast/Toast.svelte";

  interface ToastControllerProps {
    items?: any;
  }

  let { items = [] }: ToastControllerProps = $props();
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
      onclick={toast.action}
      onclose={() => HideToast(toast)}
    />
  {/each}
</div>
