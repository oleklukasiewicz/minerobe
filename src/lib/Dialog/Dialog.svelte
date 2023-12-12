<script lang="ts">
  export let open = false;
  export let style = "";
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="dialog" class:open on:click={() => (open = false)}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="dialog-content"
    on:click|stopPropagation
  >
    <div class="dialog-content-container"  {style}>
      <slot />
    </div>
  </div>
</div>

<style lang="scss">
  @import "Dialog.scss";
</style>
