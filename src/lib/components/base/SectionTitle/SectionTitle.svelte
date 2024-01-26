<script lang="ts">
    import Placeholder from "$component/base/Placeholder/Placeholder.svelte";
    export let label: string;
    export let placeholder:boolean = false;
</script>

<span class="section-title">
{#if placeholder}
  <!-- svelte-ignore missing-declaration -->
  <Placeholder style="height:16px;width:64px;" />
{:else}
  {label}
{/if}   

</span>

<style lang="scss">
  .section-title {
    font-size: small;
    color: var(--color-theme-D6);
    font-family: minecraft;
    margin: 8px 0;
    display: table;
    user-select: none;
  }
</style>
