<script lang="ts">
  export let minimal: boolean = false;
  export let label: string = null;
</script>

<div class="header">
  {#if label && !minimal}
    {label}
  {/if}
</div>

<style lang="scss">
  .header {
    font-family: minecraft;
    font-size: 10px;
    margin: 2px 0px 2px 8px;
  }
</style>
