<script lang="ts">
  import DeleteIcon from "$src/icons/close.svg?raw";
  import Button from "../Button/Button.svelte";

  export let label = "";
  export let description = "";
  export let closeable = true;

  let isClosed = false;
</script>

<div class="info-label" class:hidden={isClosed}>
  <div style="display: flex;">
    <span class="label-text">{label}</span>
    {#if closeable}
      <Button
        type="quaternary"
        on:click={() => {
          isClosed = true;
        }}
        icon={DeleteIcon}
        onlyIcon
        size="small"
      />
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
      font-family: minecraft-simple;
    }
    &.hidden {
      display: none;
    }
  }
</style>
