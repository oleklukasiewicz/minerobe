<script lang="ts">
  interface PlaceholderProps {
    style?: string;
    loadedStyle?: any;
    loaded?: boolean;
    width?: string;
    aspectRatio?: any;
    height?: string;
    children?: import("svelte").Snippet;
  }

  let {
    style = "",
    loadedStyle = null,
    loaded = false,
    width = "100%",
    aspectRatio = null,
    height = "100%",
    children,
  }: PlaceholderProps = $props();
</script>

<div
  class="placeholder"
  class:unloaded={!loaded}
  style={`${loaded ? loadedStyle : style + `width: ${width}; height: ${height}; ${aspectRatio ? `aspect-ratio: ${aspectRatio};` : ""}`}`}
>
  {#if loaded}
    {@render children?.()}
  {/if}
</div>

<style lang="scss">
  @use "Placeholder.scss";
</style>
