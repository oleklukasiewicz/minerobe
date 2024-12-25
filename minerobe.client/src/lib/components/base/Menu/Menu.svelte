<script lang="ts">
  export let opened = true;
  export let top = false;
</script>

<div class="menu" class:opened class:top class:left={!top}>
  <div class="menu-items">
    <slot {opened} {top} />
  </div>
</div>

<style lang="scss">
  .menu {
    max-width: 100%;
    .menu-items {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    &.left.opened {
      width: 25vw;
    }
    &.top {
      width: 100vw;
      .menu-items {
        flex-direction: row;
        gap: 8px;
      }
    }
  }
</style>
