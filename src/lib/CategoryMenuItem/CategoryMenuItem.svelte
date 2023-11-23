<script lang="ts">
    export let label: string = null;
    export let icon: string = null;
    export let selected:boolean = false;
</script>
<button class="category-menu-item" class:tertiary={!selected}>
    {#if icon}
        <div class="icon-small">{@html icon}</div>
    {/if}
    <span>{label}</span>
  </button>
<style lang="scss">
  @import "CategoryMenuItem.scss";
</style>
