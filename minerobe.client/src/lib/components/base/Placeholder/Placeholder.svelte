<script lang="ts">
  export let style = "";
  export let loadedStyle = null;
  export let loaded = false;
  export let width = "100%";
  export let aspectRatio = null;
  export let height = "100%";
</script>

<div
  class="placeholder"
  class:unloaded={!loaded}
  style={`${loaded ? loadedStyle : style + `width: ${width}; height: ${height}; ${aspectRatio ? `aspect-ratio: ${aspectRatio};` : ""}`}`}
>
  {#if loaded}
    <slot />
  {/if}
</div>

<style lang="scss">
  @use "Placeholder.scss";
</style>
