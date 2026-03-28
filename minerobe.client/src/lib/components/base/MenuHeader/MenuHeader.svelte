<script lang="ts">
  interface Props {
    label: string;
    opened?: boolean;
  }

  let { label, opened = true }: Props = $props();
</script>

<div class="menu-header" class:opened>
  {#if opened}
    {label}
  {/if}
</div>

<style lang="scss">
  .menu-header {
    font-family: minecraft;
    font-size: var(--size-font-caption);
    &.opened {
      margin: 4px 8px;
    }
  }
</style>
