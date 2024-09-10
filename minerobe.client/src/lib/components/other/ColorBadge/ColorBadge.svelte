<script lang="ts">
  export let colorName: string;
  export let color: string;
  export let small = false;
  export let noBorder = false;
  export let style = "";
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<span
  class:small
  class:noBorder
  on:click|stopPropagation
  class="color-view"
  title={colorName}
  style={style + `background-color: ${color};`}
></span>

<style lang="scss">
  .color-view {
    min-width: 16px;
    min-height: 16px;
    margin: 3px 2px;
    vertical-align: middle;
    display: inline-table;
    transition: var(--time);
    aspect-ratio: 1;
    border: 2px solid var(--color-theme-D2);
    &.noBorder {
      border: none;
    }
    &.small {
      min-width: 10px;
      min-height: 10px;
      margin: 3px 2px;
      vertical-align: top;
    }
  }
</style>
