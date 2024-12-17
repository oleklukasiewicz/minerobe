<script lang="ts">
  export let opened = true;
</script>

<div class="menu" class:opened>
  <div class="menu-items">
    <slot {opened} />
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
    &.opened {
      width: 25vw;
    }
  }
</style>
