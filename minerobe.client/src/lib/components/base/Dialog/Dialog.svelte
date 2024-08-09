<script lang="ts">
  import Button from "../Button/Button.svelte";

  import CloseIcon from "$icons/close.svg?raw";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let open = false;
  export let style = "";
  export let label = "";
  export let showTitleBar = true;

  const onClose = () => {
    open = false;
    dispatch("close");
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="dialog" class:open on:click={onClose}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  {#if open}
    <div class="dialog-content" on:click|stopPropagation>
      {#if showTitleBar}
        <div class="dialog-title-bar">
          <span>{label || ""}</span>
          <Button
            type="quaternary"
            icon={CloseIcon}
            label="Close"
            onlyIcon
            on:click={onClose}
          />
        </div>
      {/if}
      <div class="dialog-content-container" {style}>
        <slot />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @import "Dialog.scss";
</style>
