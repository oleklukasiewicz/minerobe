<script lang="ts">
  export let label: string = null;
  export let icon: string = null;
  export let minimal: boolean = false;
  export let selected: boolean = false;
  export let badge: string = null;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<a class="menu-item" class:selected={selected} on:click>
  {#if icon}
    <div class="icon-small">
      {@html icon}
    </div>
  {/if}
  {#if label && !minimal}
    <span>{label}</span>
  {/if}
  {#if badge && !minimal}
    <div class="badge">{badge}</div>
  {/if}
</a>

<style lang="scss">
  @import "MenuItem.scss";
</style>
