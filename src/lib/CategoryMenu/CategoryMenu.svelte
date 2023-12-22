<script lang="ts">
  export let label: string = null;
  export let horizontal: boolean = false;
</script>

<div class="category-menu" class:horizontal>
  {#if label}
    <h2 class="category-menu-label">{label}</h2>
  {/if}
  <div class="category-menu-items">
    <slot />
  </div>
</div>

<style lang="scss">
  @import "CategoryMenu.scss";
</style>
