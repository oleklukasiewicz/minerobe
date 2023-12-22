<script lang="ts">
  export let label: string = null;
  export let icon: string = null;
  export let minimal = false;
  export let selected: boolean = false;
  export let badge: string = null;
</script>

<button
  class="category-menu-item"
  class:minimal
  class:icon={minimal}
  class:tertiary={!selected}
  on:click
>
  {#if icon}
    <div class="icon-small">{@html icon}</div>
  {/if}
  {#if !minimal}
    <span>{label}</span>
    {#if badge}
      <span class="badge">{badge}</span>
    {/if}
  {/if}
</button>

<style lang="scss">
  @import "CategoryMenuItem.scss";
</style>
