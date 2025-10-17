<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //components
  import Button from "../Button/Button.svelte";
  //icons
  import CloseIcon from "$icons/close.svg?raw";
  import { IS_MOBILE_VIEW } from "$src/data/static";

  const dispatch = createEventDispatcher();

  export let open = false;
  export let style = "";
  export let label = "";
  export let showTitleBar = true;
  export let className = "";

  const onClose = () => {
    open = false;
    dispatch("close");
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="dialog {className}"
  class:open
  on:click={onClose}
  class:mobile={$IS_MOBILE_VIEW}
>
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
            iconSize="large"
            onlyIcon
            on:click={onClose}
          />
        </div>
      {/if}
      <div class="dialog-content-container" {style}>
        <slot isMobile={$IS_MOBILE_VIEW} />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @use "Dialog.scss";
</style>
