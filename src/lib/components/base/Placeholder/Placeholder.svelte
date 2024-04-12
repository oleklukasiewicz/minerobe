<script lang="ts">
  export let style = "";
  export let loaded = false;
</script>

<div class="placeholder" style={loaded ? null : style} class:unloaded={!loaded}>
  {#if loaded}
    <slot />
  {/if}
</div>

<style lang="scss">
  @import "Placeholder.scss";
</style>
