<script lang="ts">
  import DeleteIcon from "$src/icons/close.svg?raw";

  export let label = "";
  export let description = "";
  export let closeable = true;

  let isClosed = false;
</script>

<div class="info-label" class:hidden={isClosed}>
  <div style="display: flex;">
    <span class="label-text">{label}</span>
    {#if closeable}
      <button
        class="close-button icon-small icon tertiary small"
        on:click={() => {
          isClosed = true;
        }}
      >
        {@html DeleteIcon}
      </button>
    {/if}
  </div>
  <span class="description">{description}</span>
</div>

<style lang="scss">
  .info-label {
    background-color: var(--color-warning);
    padding: 8px;
    box-sizing: border-box;
    .label-text {
      font-family: minecraft;
      flex: 1;
    }
    .description {
      font-size: var(--size-font-caption);
    }
    &.hidden {
      display: none;
    }
  }
</style>
