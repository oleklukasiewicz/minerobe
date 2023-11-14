<script>
  import { page } from "$app/stores";
  export let label = "";
  export let icon = "";
  export let viewId = "";
</script>

<a href={"/" + viewId} class:selected={$page.route.id == "/" + viewId} on:click>
  <span class="nav-icon">{@html icon}</span>
  <span>{label}</span>
</a>

<style lang="scss">
  @import "NavigationItem.scss";
</style>
