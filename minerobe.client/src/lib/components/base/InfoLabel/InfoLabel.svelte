<script lang="ts">
  //components
  import Button from "../Button/Button.svelte";
  //icons
  import DeleteIcon from "$src/icons/close.svg?raw";

  interface Props {
    label?: string;
    type?: "warning" | "info";
    description?: string;
    closeable?: boolean;
  }

  let {
    label = "",
    type = "info",
    description = "",
    closeable = true
  }: Props = $props();

  let isClosed = $state(false);
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
        onclick={() => {
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
