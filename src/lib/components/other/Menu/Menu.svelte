<script lang="ts">
  export let label: string = null;
</script>

<div class="menu">
  <div class="header">
    {#if label}
      <span>{label}</span>
    {/if}
  </div>
  <slot />
</div>

<style lang="scss">
  @import "Menu.scss";
</style>
