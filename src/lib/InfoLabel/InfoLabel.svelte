<script lang="ts">
  export let label = "";
  export let description = "";
</script>

<div class="info-label">
  <span class="label-text">{label}</span>
  <br />
  <span class="description">{description}</span>
</div>

<style lang="scss">
  .info-label {
    background-color: var(--color-warning);
    padding: 8px;
    box-sizing: border-box;
    .label-text {
      font-family: minecraft;
    }
    .description {
      font-size: var(--size-font-caption);
    }
  }
</style>
