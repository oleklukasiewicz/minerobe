<script>
  export let label = "";
  export let value = "";
  export let group = "";
  export let disabled = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<span
  class="toggle-button"
  title={label}
  class:selected={value == group}
  class:disabled
  on:click={() => (group = value)}
>
  {label}
</span>

<style>
  @import "RatioButton.scss";
</style>
