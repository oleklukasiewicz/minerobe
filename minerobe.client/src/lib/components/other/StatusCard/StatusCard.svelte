<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  export let label;
</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<!-- svelte-ignore a11y_missing_attribute -->
<div class="status-card">
  <div>
    <SectionTitle {label} />
  </div>
  <div>
    <slot></slot>
  </div>
  <div>
    <slot name="actions">
    </slot>
  </div>
</div>

<style lang="scss">
  .status-card {
    flex:1;
    min-width: 150px;
    display: grid;
    grid-template-rows: auto 1fr auto;
    padding: 8px;
    gap:8px;
    aspect-ratio: 5/8;
    box-sizing: border-box;
    background-color: var(--color-theme-D1);
    div {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
