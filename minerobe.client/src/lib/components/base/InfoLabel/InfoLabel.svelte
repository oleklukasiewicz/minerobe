<script lang="ts">
  //components
  import Button from "../Button/Button.svelte";
  //icons
  import DeleteIcon from "$src/icons/close.svg?raw";

  export let label = "";
  export let type: "warning" | "info" = "info";
  export let description = "";
  export let closeable = true;

  let isClosed = false;
</script>

<div
  class="info-label"
  class:warning={type == "warning"}
  class:info={type == "info"}
  class:hidden={isClosed}
>
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
    padding: 8px;
    box-sizing: border-box;
    &.warning {
      background-color: var(--color-warning);
    }
    &.info {
      background-color: var(--color-info);
    }
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
