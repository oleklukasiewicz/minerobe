<script lang="ts">
  export let colorName: string;
  export let color: string;
  export let small = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<span
  class:small
  on:click|stopPropagation
  class="color-view"
  title={colorName}
  style="background-color: {color};"
></span>

<style lang="scss">
  .color-view {
    min-width: 16px;
    min-height: 16px;
    margin: 3px 2px;
    vertical-align: middle;
    display: inline-table;
    transition: var(--time);
    border: 2px solid var(--color-theme-D1);
    &.small {
      min-width: 10px;
      min-height: 10px;
      margin: 3px 2px;
      vertical-align: top;
    }
  }
</style>
