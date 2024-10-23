<script lang="ts">
  import { page } from "$app/stores";
  export let label = "";
  export let icon = "";
  export let iconImage = "";
  export let viewId = "";
  export let disabled = false;
  export let customCall = false;
  export let minimal: boolean = false;
</script>

<a
  href={customCall ? null :( "/" + viewId)}
  class:minimal
  class:selected={viewId?.length > 0
    ? $page.route?.id?.startsWith("/" + viewId)
    : $page.route?.id == "/"}
  class:disabled
  on:click
>
  <!-- svelte-ignore a11y-missing-attribute -->
  {#if iconImage}
    <img src={iconImage} />
  {/if}
  {#if icon}
    <span class="nav-icon icon-small">{@html icon}</span>
  {/if}
  {#if label}
  <span class="item-label">{label}</span>
  {/if}
  <slot />
</a>

<style lang="scss">
  @use "NavigationItem.scss";
</style>
