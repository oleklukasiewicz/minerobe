<script lang="ts">
  //components
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";

  export let label;
</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<!-- svelte-ignore a11y_missing_attribute -->
<div class="status-card">
  <div class="data">
    <SectionTitle {label} />
  </div>
  <div class="data">
    <slot></slot>
  </div>
  <div class="data">
    <div class="actions">
      <slot name="actions"></slot>
    </div>
  </div>
</div>

<style lang="scss">
  .status-card {
    flex: 1;
    min-width: 150px;
    display: grid;
    grid-template-rows: auto 1fr auto;
    padding: 8px;
    gap: 8px;
    aspect-ratio: 5/8;
    box-sizing: border-box;
    background-color: var(--color-theme-D1);
    div.data {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      overflow: hidden;
      max-width: 100%;
      flex: 1;
    }
    .actions {
      flex: 1;
      max-width: 100%;
    }
  }
</style>
