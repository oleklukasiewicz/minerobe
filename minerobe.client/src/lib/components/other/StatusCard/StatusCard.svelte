<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  export let label;
</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<!-- svelte-ignore a11y_missing_attribute -->
<a class="status-card">
  <div>
    <SectionTitle {label} />
  </div>
  <div>
    <slot></slot>
  </div>
  <div>
    <slot name="actions">
      <Button label="action" />
    </slot>
  </div>
</a>

<style lang="scss">
  .status-card {
    flex:1;
    max-width: 25vw;
    display: grid;
    grid-template-rows: auto 1fr auto;
    padding: 8px;
    box-sizing: border-box;
    background-color: var(--color-theme-D1);
    div {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
