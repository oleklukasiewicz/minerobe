<script lang="ts">
  export let style = "";
  export let loadedStyle = null;
  export let loaded = false;
  export let width = "100%";
  export let height = "100%";
</script>

<div
  class="placeholder"
  class:unloaded={!loaded}
  style={`width: ${width}; height: ${height}; ${loaded ? loadedStyle : style}`}
>
  {#if loaded}
    <slot />
  {/if}
</div>

<style lang="scss">
  @use "Placeholder.scss";
</style>
