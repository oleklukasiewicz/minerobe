<script lang="ts">
  export let label: string = null;
  export let icon: string = null;
  export let minimal: boolean = false;
  export let selected: boolean = false;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a class="menu-item" class:selected>
  {#if icon}
    <div class="icon-small">
      {@html icon}
    </div>
  {/if}
  {#if label && !minimal}
    <span>{label}</span>
  {/if}
</a>

<style lang="scss">
  @import "MenuItem.scss";
</style>
