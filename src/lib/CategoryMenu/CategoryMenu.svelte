<script lang="ts">
  export let label: string = null;
</script>

<div class="category-menu">
  {#if label}
    <h2 class="category-menu-label">{label}</h2>
  {/if}
  <div class="category-menu-items">
    <slot/>
  </div>
</div>

<style lang="scss">
  @import "CategoryMenu.scss";
</style>
