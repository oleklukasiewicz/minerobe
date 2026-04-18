<script lang="ts">
  import Placeholder from "$component/base/Placeholder/Placeholder.svelte";

  interface SectionTitleProps {
    label: string;
    placeholder?: boolean;
  }

  let { label, placeholder = false }: SectionTitleProps = $props();
</script>

<span class="section-title">
  {#if placeholder}
    <Placeholder height="14px" width="64px" />
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
