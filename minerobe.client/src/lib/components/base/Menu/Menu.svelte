<script lang="ts">
  interface MenuProps {
    opened?: boolean;
    top?: boolean;
    children?: import('svelte').Snippet<[any]>;
    footer?: import('svelte').Snippet<[any]>;
  }

  let {
    opened = $bindable(false),
    top = false,
    children,
    footer
  }: MenuProps = $props();
</script>

<div class="menu" class:opened class:top class:left={!top}>
  <div class="menu-items">
    {@render children?.({ opened, top, })}
  </div>
  <div class="menu-footer">
    {@render footer?.({ opened, top, })}
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
      gap: 8px;
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
