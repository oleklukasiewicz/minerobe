<script>
  import { page } from "$app/stores";
  export let label = "";
  export let icon = "";
  export let viewId = "";
  export let disabled = false;
</script>

<a
  href={"/" + viewId}
  class:selected={$page.route.id == "/" + viewId}
  class:disabled
  on:click
>
  <span class="nav-icon">{@html icon}</span>
  <span>{label}</span>
</a>

<style lang="scss">
  @import "NavigationItem.scss";
</style>
