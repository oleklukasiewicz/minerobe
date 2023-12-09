<script lang="ts">
  import { cubicOut } from "svelte/easing";

  export let open = false;
  function fadeInScale(node, { duration }) {
    return {
      duration,
      easing: cubicOut,
      css: (t) => `opacity: ${t}; transform: scale(${0.9 + t * 0.1})`,
    };
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="dialog" class:open on:click={() => (open = false)}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="dialog-content"
    on:click|stopPropagation
    in:fadeInScale={{ duration: 300 }}
    out:fadeInScale={{ duration: 300 }}
  >
    <div class="dialog-content-container">
      <slot />
    </div>
  </div>
</div>

<style lang="scss">
  @import "Dialog.scss";
</style>
