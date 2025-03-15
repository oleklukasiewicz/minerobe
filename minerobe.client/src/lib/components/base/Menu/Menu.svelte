<script lang="ts">
  export let opened = true;
  export let top = false;
</script>

<div class="menu" class:opened class:top class:left={!top}>
  <div class="menu-items">
    <slot {opened} {top} />
  </div>
  <div class="menu-footer">
    <slot name="footer" {opened} {top} />
  </div>
</div>

<style lang="scss">
  .menu {
    max-width: 100%;
    display: grid;
    flex-direction: column;
    .menu-items {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .menu-footer {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    &.left.opened {
      width: 100%;
    }
    &.top {
      width: 100%;
      .menu-items {
        flex-direction: row;
        gap: 8px;
      }
    }
  }
</style>
