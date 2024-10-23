<script lang="ts">
  export let style = "";
  export let loadedStyle = null;
  export let loaded = false;
</script>

<div
  class="placeholder"
  style={loaded ? loadedStyle : style}
  class:unloaded={!loaded}
>
  {#if loaded}
    <slot />
  {/if}
</div>

<style lang="scss">
  @use "Placeholder.scss";
</style>
